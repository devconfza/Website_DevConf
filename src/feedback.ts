import { addPopupHandler, feedbackServerUrl, getTemplate, setText } from './common'
import { loadSessionizeData } from './sessionize'
import { v4 as uuidv4 } from 'uuid'

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void
            execute: (siteKey: string, options: { action: string }) => Promise<string>
        }
    }
}

const timeKeyFinder = /\$\$(?<start>.+)\$\$(?<end>.+)\$\$/

interface QuestionStructure {
    id: string,
    label: string,
    type: 'rate' | 'text' | 'timeslot-selector' | 'yesno' | 'checkbox' | 'company-size' | 'industry' | 'role' | 'level' | 'years' | 'email' | 'influence'
    key: number | undefined,
    needs?: string,
    defaultValue?: 'yes' | 'no',
    includeInTotal?: boolean,
}

interface SectionStructure {
    title: string,
    subtitle?: string,
    questions: QuestionStructure[]
    workshop?: number,
}

interface QuestionaireStructure {
    structure: SectionStructure[],
}

const tracks = 5

export default async () => {
    const stage = document.getElementById('feedbackStage') as HTMLDivElement
    if (!stage) {
        return
    }

    let questions: QuestionaireStructure
    const storedQuestions = window.sessionStorage.getItem('questionStructure')
    if (storedQuestions) {
        questions = JSON.parse(storedQuestions)
    } else {
        const questionsResponse = await fetch('/public/ratingconfig.json')
        if (!questionsResponse.ok) {
            return
        } else {
            questions = await questionsResponse.json()
            window.sessionStorage.setItem('questionStructure', JSON.stringify(questions))
        }
    }


    const ratingId = stage.getAttribute('data-rating-id');
    if (!ratingId) {
        return
    }

    const eventId = stage.getAttribute('data-event-id')
    if (!eventId) {
        return
    }

    const sessionStructure = document.getElementById('sessionData')!.innerText.trim().split(' ')
    const eventData = await loadSessionizeData(eventId)
    const timingsElement = document.getElementById('timings')
    if (!timingsElement) {
        console.error('Unable to load feedback timings: missing timings element')
        return
    }

    const timingsText = timingsElement.textContent?.trim()
    if (!timingsText) {
        console.error('Unable to load feedback timings: timings data is empty')
        return
    }

    let timings: Record<string, string>
    try {
        timings = JSON.parse(timingsText) as Record<string, string>
    } catch (error) {
        console.error('Unable to load feedback timings: invalid timings JSON', error)
        return
    }
    const workshopStructure = document.getElementById('workshopData')!.innerText.trim().split(';;;').map(s => s.trim())

    const ratingStoredData = window.localStorage.getItem(`rating${ratingId}`)
    let ratingData: { [x: string]: {}; captcha?: any; event: string; submitter: string }
    if (!ratingStoredData) {
        ratingData = {
            event: ratingId,
            submitter: uuidv4(),
        }
    } else {
        ratingData = JSON.parse(ratingStoredData)
    }

    const parseStoredBoolean = (value: unknown): boolean | undefined => {
        if (value === true || value === 'true') {
            return true
        }

        if (value === false || value === 'false') {
            return false
        }

        return undefined
    }

    const normalizeYesNoValue = (value: unknown): 'yes' | 'no' | undefined => {
        const parsedValue = parseStoredBoolean(value)
        if (parsedValue === undefined) {
            return undefined
        }

        return parsedValue ? 'yes' : 'no'
    }

    const emailValidationInput = document.createElement('input')
    emailValidationInput.type = 'email'

    const isValidEmailValue = (value: string) => {
        emailValidationInput.value = value.trim()
        return emailValidationInput.checkValidity()
    }

    const ensureDefaultAnswers = () => {
        let hasChanges = false

        questions.structure.forEach((section, sectionIndex) => {
            section.questions.forEach((question) => {
                if (!ratingData[`s${sectionIndex}`]) {
                    ratingData[`s${sectionIndex}`] = {}
                }

                const existingValue = ratingData[`s${sectionIndex}`][question.id]
                const normalizedYesNoValue = normalizeYesNoValue(existingValue)
                if (question.type === 'yesno' && normalizedYesNoValue !== undefined) {
                    ratingData[`s${sectionIndex}`][question.id] = normalizedYesNoValue
                    hasChanges = true
                    return
                }

                if (!question.defaultValue) {
                    return
                }

                if (existingValue === undefined) {
                    ratingData[`s${sectionIndex}`][question.id] = question.defaultValue
                    hasChanges = true
                }
            })
        })

        if (hasChanges) {
            window.localStorage.setItem(`rating${ratingId}`, JSON.stringify(ratingData))
        }
    }

    ensureDefaultAnswers()

    const talkTitle = (sessionId: string): string => {
        const session = eventData!.sessions.find((s) => s.id === sessionId)
        if (!session) {
            return "To Be Announced";
        }

        const speakers = session.speakers
            .map((speakerId) => eventData!.speakers.find((speaker) => speaker?.id === speakerId))
            .filter((speaker) => !!speaker)
            .map((speaker) => speaker?.fullName)
            .join(' and ');

        return `${session.title} by ${speakers}`
    }

    const setValue = (dataSlotId: number, id: string, value: string | boolean) => {
        const sectionData = getSectionData(dataSlotId)
        sectionData[id] = value
        persistRatingData()
    }

    const getSectionData = (dataSlotId: number): Record<string, string | boolean> => {
        if (!ratingData[`s${dataSlotId}`]) {
            ratingData[`s${dataSlotId}`] = {}
        }

        return ratingData[`s${dataSlotId}`] as Record<string, string | boolean>
    }

    const clearValue = (dataSlotId: number, id: string) => {
        const sectionData = getSectionData(dataSlotId)
        if (sectionData[id] !== undefined) {
            delete sectionData[id]
            persistRatingData()
        }
    }

    const persistRatingData = () => {
        window.localStorage.setItem(`rating${ratingId}`, JSON.stringify(ratingData))
    }

    const configureTimeSlotSelector = (inputElement: HTMLSelectElement, question: QuestionStructure, dataSlotId: number) => {
        const start = question.key! * tracks + 1
        const end = start + tracks

        for (let index = start; index < end; index++) {
            const sessionId = sessionStructure[index]
            if (sessionId === '999999') {
                continue
            }

            const option = document.createElement('option')

            option.value = sessionId
            option.text = talkTitle(sessionId)

            inputElement!.append(option)
        }

        const updateTimeSlot = () => {
            setValue(dataSlotId, question.id, inputElement.value)
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            inputElement.querySelectorAll('option').forEach((option) => {
                if (option.value === existingValue) {
                    option.selected = true
                }
            })
        }

        inputElement.onchange = updateTimeSlot
    }

    const configureSelector = (inputElement: HTMLSelectElement, question: QuestionStructure, dataSlotId: number) => {
        const updateValue = () => {
            setValue(dataSlotId, question.id, inputElement.value)
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            inputElement.querySelectorAll('option').forEach((option) => {
                if (option.value === existingValue) {
                    option.selected = true
                }
            })
        }

        inputElement.onchange = updateValue
    }

    const configureYesNo = (inputElement: HTMLDivElement, question: QuestionStructure, dataSlotId: number) => {
        const yesInput = inputElement.querySelector('input[value="yes"]') as HTMLInputElement
        const noInput = inputElement.querySelector('input[value="no"]') as HTMLInputElement
        const yesLabel = inputElement.querySelector('label[for="yes"]') as HTMLLabelElement
        const noLabel = inputElement.querySelector('label[for="no"]') as HTMLLabelElement
        const yesNoGroupName = `yesno-${dataSlotId}-${question.id}`
        const yesInputId = `${yesNoGroupName}-yes`
        const noInputId = `${yesNoGroupName}-no`

        yesInput.name = yesNoGroupName
        noInput.name = yesNoGroupName
        yesInput.id = yesInputId
        noInput.id = noInputId
        yesLabel.setAttribute('for', yesInputId)
        noLabel.setAttribute('for', noInputId)

        const updateTimeSlot = () => {
            const value = (inputElement.querySelector(`input[name="${yesNoGroupName}"]:checked`) as HTMLInputElement)?.value
            if (value) {
                setValue(dataSlotId, question.id, value)
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            (inputElement.querySelector(`input[name="${yesNoGroupName}"][value="${existingValue}"]`) as HTMLInputElement).checked = true
        } else if (question.defaultValue) {
            (inputElement.querySelector(`input[name="${yesNoGroupName}"][value="${question.defaultValue}"]`) as HTMLInputElement).checked = true
        }

        inputElement.onchange = updateTimeSlot
    }

    const configureCheckbox = (inputElement: HTMLDivElement, question: QuestionStructure, dataSlotId: number) => {
        const checkboxElement = inputElement.querySelector('input[type="checkbox"]') as HTMLInputElement
        checkboxElement.setAttribute('aria-label', question.label)

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        const parsedValue = parseStoredBoolean(existingValue)
        if (parsedValue !== undefined) {
            checkboxElement.checked = parsedValue
        } else {
            checkboxElement.checked = true
        }

        checkboxElement.onchange = () => {
            setValue(dataSlotId, question.id, checkboxElement.checked)
        }
    }

    const configureRating = (inputElement: HTMLDivElement, question: QuestionStructure, dataSlotId: number) => {
        const ratingElement = (inputElement.querySelector('input[type="range"]') as HTMLInputElement)
        const updateValue = () => {
            const value = ratingElement.value
            if (value) {
                setValue(dataSlotId, question.id, value)
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            ratingElement.value = existingValue
        }

        ratingElement.oninput = updateValue
    }

    const configureInput = (inputElement: HTMLInputElement, question: QuestionStructure, dataSlotId: number) => {
        const updateValue = () => {
            const value = inputElement.value.trim()
            if (value) {
                setValue(dataSlotId, question.id, value)
            } else {
                clearValue(dataSlotId, question.id)
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            inputElement.value = String(existingValue).trim()
        }

        inputElement.oninput = updateValue
        inputElement.onchange = updateValue
    }

    const configureText = (inputElement: HTMLTextAreaElement, question: QuestionStructure, dataSlotId: number) => {
        const updateValue = () => {
            const { value } = inputElement
            if (value) {
                setValue(dataSlotId, question.id, value)
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            inputElement.value = existingValue
        }

        inputElement.onchange = updateValue
    }

    const configureYears = (inputElement: HTMLInputElement, question: QuestionStructure, dataSlotId: number) => {
        const updateValue = () => {
            const { value } = inputElement
            if (value) {
                let valueAsNumber: number | undefined = undefined
                try {
                    valueAsNumber = +value
                } catch { }

                if (valueAsNumber !== undefined && !Number.isNaN(valueAsNumber) && valueAsNumber >= 0 && valueAsNumber <= 60) {
                    setValue(dataSlotId, question.id, value)
                }
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            inputElement.value = existingValue
        }

        inputElement.onchange = updateValue
    }

    const needsNotMet = ['no', 'none']

    const countComplete = (id: number): number => {
        const answers = ratingData[`s${id}`] || {}
        return Object.keys(answers).filter(key => {
            const questionStructure = questions.structure[id].questions.find(q => q.id === key)
            if (!questionStructure) {
                return false
            }

            if (questionStructure.type === 'checkbox') {
                return false
            }

            if (questionStructure.includeInTotal === false) {
                return false
            }

            const answeredValue = answers[key]
            if (questionStructure.type === 'timeslot-selector' && answeredValue === 'none') {
                return false
            }

            const needs = questionStructure.needs
            if (!needs) {
                return true
            }

            const needsValue = answers[needs]
            if (!needsValue) {
                return true
            }

            return !needsNotMet.find(n => n === needsValue)
        }).length
    }

    const updateCompleted = () => {
        document.querySelectorAll('div.feedbackButton').forEach((button) => {
            const id = +button.attributes['data-id'].value
            const totalQuestions = questions.structure[id].questions.filter(question => question.type !== 'checkbox' && question.includeInTotal !== false).length
            setText(button, '.feedbackButtonProgressBar', `Questions Completed ${countComplete(id)} / ${totalQuestions}`)
        })
    }

    const addPopups = () => {
        addPopupHandler(document.querySelectorAll('.feedbackButton'), (div) => {
            const dataSlotId = +div.attributes['data-id'].value
            const popupContent = getTemplate('feedbackPopup').firstElementChild!
            const section = questions.structure[dataSlotId]
            const emailInputs: HTMLInputElement[] = []
            setText(popupContent, 'div.feedbackTitle', `Feedback for ${section.title}`)
            section.questions.forEach((question) => {
                const questionBaseElement = getTemplate('questionTemplate').firstElementChild!
                setText(questionBaseElement, 'div.questionTitle', question.label)

                const inputElement = getTemplate(`${question.type}QuestionStyleTemplate`).firstElementChild!

                switch (question.type) {
                    case 'email': {
                        configureInput(inputElement as HTMLInputElement, question, dataSlotId)
                        emailInputs.push(inputElement as HTMLInputElement)
                        break
                    }
                    case 'company-size':
                    case 'industry':
                    case 'level':
                    case 'role':
                    case 'influence': {
                        configureSelector(inputElement as HTMLSelectElement, question, dataSlotId)
                        break
                    }
                    case 'text': {
                        configureText(inputElement as HTMLTextAreaElement, question, dataSlotId)
                        break
                    }
                    case 'rate': {
                        configureRating(inputElement as HTMLDivElement, question, dataSlotId)
                        break
                    }
                    case 'yesno': {
                        configureYesNo(inputElement as HTMLDivElement, question, dataSlotId)
                        break
                    }
                    case 'checkbox': {
                        configureCheckbox(inputElement as HTMLDivElement, question, dataSlotId)
                        break
                    }
                    case 'years': {
                        configureYears(inputElement as HTMLInputElement, question, dataSlotId)
                        break
                    }
                    case 'timeslot-selector': {
                        configureTimeSlotSelector(inputElement as HTMLSelectElement, question, dataSlotId)
                        break
                    }
                }

                inputElement.attributes['data-rating-field-id'] = question.id
                questionBaseElement.insertAdjacentElement('beforeend', inputElement)
                popupContent.insertAdjacentElement('beforeend', questionBaseElement)
            })

            const doneButton = getTemplate('doneButton').firstElementChild! as HTMLButtonElement
            doneButton.onclick = () => {
                const invalidEmailInput = emailInputs.find((input) => {
                    return !isValidEmailValue(input.value)
                })

                if (invalidEmailInput) {
                    invalidEmailInput.focus()
                    alert('Please enter a valid email address or leave it blank.')
                    return
                }

                (document.querySelector('div.popupClose')! as HTMLDivElement).dispatchEvent(new Event('click'))
            }
            popupContent.insertAdjacentElement('beforeend', doneButton)
            return popupContent
        }, undefined, undefined, () => {
            updateCompleted()
        }, (content) => {
            content.querySelectorAll('input[type="range"]').forEach(i => {
                i.dispatchEvent(new Event('input'))
            })
        },
            'feedbackPopupContent')
    }

    const addSubmit = () => {
        const saveButton = (document.getElementById('saveDataButton') as HTMLButtonElement)
        const ensureCheckboxDefaults = () => {
            questions.structure.forEach((section, sectionIndex) => {
                section.questions.forEach((question) => {
                    if (question.type !== 'checkbox') {
                        return
                    }

                    if (!ratingData[`s${sectionIndex}`]) {
                        ratingData[`s${sectionIndex}`] = {}
                    }

                    if (ratingData[`s${sectionIndex}`][question.id] === undefined) {
                        ratingData[`s${sectionIndex}`][question.id] = true
                    }
                })
            })
        }

        saveButton.onclick = (event) => {
            saveButton.innerText = 'Saving...';
            saveButton.disabled = true
            event.preventDefault()
            const recaptcha = window.grecaptcha
            if (!recaptcha) {
                saveButton.innerText = 'Save';
                saveButton.disabled = false
                alert('reCAPTCHA failed to load. Please reload your browser and try again.')
                return
            }

            recaptcha.ready(async () => {
                ensureCheckboxDefaults()
                const token = await recaptcha.execute('6LfkPcUlAAAAAHwYs14fkTiEZYsu5hAAq_bLKp-j', { action: 'submit' })
                ratingData.captcha = token
                const uploadResult = await fetch(feedbackServerUrl, {
                    method: 'POST',
                    body: JSON.stringify(ratingData),
                })

                if (!uploadResult.ok) {
                    saveButton.innerText = 'Save';
                    saveButton.disabled = false
                    alert('Oh no! Something has gone horribly wrong. Please reload your browser and try again.')
                } else {
                    saveButton.disabled = false
                    saveButton.innerText = 'Save Complete';
                    setTimeout(() => {
                        saveButton.innerText = 'Save';
                    }, 2000)
                }
            })
        }

        saveButton.style.display = 'unset'
    }

    const addButtons = () => {
        stage.removeChild(document.getElementById('feedbackLoading')!)
        questions.structure.forEach((question, index) => {
            let show = false
            let subTitle: string | undefined = undefined
            if (question.workshop !== undefined) {
                const workshopTitle = workshopStructure[question.workshop]
                if (workshopTitle !== 'none') {
                    show = true
                    subTitle = workshopTitle
                }
            } else {
                if (question.subtitle) {
                    const parsedSubtitle = timeKeyFinder.exec(question.subtitle)
                    if (parsedSubtitle) {
                        const start = parsedSubtitle.groups?.["start"] ?? ""
                        const end = parsedSubtitle.groups?.["end"] ?? ""
                        const startTiming = timings[start]
                        const endTiming = timings[end]
                        if (startTiming && endTiming) {
                            subTitle = `${startTiming} - ${endTiming}`
                        }
                    } else {
                        subTitle = question.subtitle
                    }
                }

                show = true
            }

            if (show) {
                const questionButton = getTemplate('feedbackButton').querySelector('div')!
                questionButton.setAttribute('data-id', index.toString())
                setText(questionButton, '.feedbackButtonTitle', question.title)
                const totalQuestions = question.questions.filter(question => question.type !== 'checkbox' && question.includeInTotal !== false).length
                setText(questionButton, '.feedbackButtonProgressBar', `Questions Completed ${countComplete(index)} / ${totalQuestions}`)
                if (subTitle) {
                    setText(questionButton, '.feedbackButtonWorkshop', subTitle)
                }

                stage.insertAdjacentElement('beforeend', questionButton)
            }
        })
    }

    addButtons()
    addPopups()
    addSubmit()

    const processUrlParameters = () => {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const timeslotParam = urlParams.get('timeslot')
        const sessionParam = urlParams.get('session')

        // If timeslot parameter doesn't exist, no action needed
        if (!timeslotParam) {
            return
        }

        // Find the timeslot button with the matching data-id
        const timeslotButton = document.querySelector(`div.feedbackButton[data-id="${timeslotParam}"]`) as HTMLDivElement

        // If the button exists, trigger a click to open the popup
        if (timeslotButton) {
            // Click the button to open the popup
            timeslotButton.click()

            // If session parameter exists, set the dropdown to that index
            if (sessionParam) {
                // Wait for the popup to be fully opened
                setTimeout(() => {
                    const popup = document.querySelector('.feedbackPopupContent')
                    if (popup) {
                        // Find the timeslot-selector dropdown in the popup
                        const dropdown = popup.querySelector('select') as HTMLSelectElement
                        if (dropdown && dropdown.options.length > 0) {
                            // Check if the sessionParam is a valid index
                            const sessionIndex = parseInt(sessionParam, 10)
                            if (!isNaN(sessionIndex) && sessionIndex >= 0 && sessionIndex < dropdown.options.length) {
                                dropdown.selectedIndex = sessionIndex
                                // Trigger the change event to save the selection
                                dropdown.dispatchEvent(new Event('change'))
                            }
                        }
                    }
                }, 500) // Give the popup some time to open and render
            }
        }
    }

    // Process URL parameters after all other setup is complete
    processUrlParameters()
}
