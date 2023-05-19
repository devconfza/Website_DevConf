import { addPopupHandler, feedbackServerUrl, getTemplate, setText } from './common'
import { loadSessionizeData } from './sessionize'
import { v4 as uuidv4 } from 'uuid'

interface QuestionStructure {
    id: string,
    label: string,
    type: 'rate' | 'text' | 'timeslot-selector' | 'yesno' | 'role' | 'level' | 'years' | 'email' | 'influence'
    key: number | undefined,
    needs?: string,
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

    const workshopStructure = document.getElementById('workshopData')!.innerText.trim().split(';;;').map(s => s.trim())

    const ratingStoredData = window.localStorage.getItem(`rating${ratingId}`)
    let ratingData
    if (!ratingStoredData) {
        ratingData = {
            event: ratingId,
            submitter: uuidv4(),
        }
    } else {
        ratingData = JSON.parse(ratingStoredData)
    }

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

    const setValue = (dataSlotId: number, id: string, value: string) => {
        if (!ratingData[`s${dataSlotId}`]) {
            ratingData[`s${dataSlotId}`] = {}
        }

        ratingData[`s${dataSlotId}`][id] = value

        window.localStorage.setItem(`rating${ratingId}`, JSON.stringify(ratingData))
    }

    const configureTimeSlotSelector = (inputElement: HTMLSelectElement, question: QuestionStructure, dataSlotId: number) => {
        const start = question.key! * tracks + 1
        const end = start + tracks

        for (let index = start; index < end; index++) {
            const sessionId = sessionStructure[index]

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
        const updateTimeSlot = () => {
            const value = (inputElement.querySelector('input[name="yesno"]:checked') as HTMLInputElement)?.value
            if (value) {
                setValue(dataSlotId, question.id, value)
            }
        }

        const existingValue = ratingData[`s${dataSlotId}`]?.[question.id]
        if (existingValue) {
            (inputElement.querySelector(`input[name="yesno"][value="${existingValue}"]`) as HTMLInputElement).checked = true
        }

        inputElement.onchange = updateTimeSlot
    }

    const configureRating = (inputElement: HTMLDivElement, question: QuestionStructure, dataSlotId: number) => {
        const ratingElement = (inputElement.querySelector('input[type="range"]') as HTMLInputElement)
        const updateValue = () => {
            console.log('update')
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

                if (valueAsNumber && valueAsNumber >= 0 && valueAsNumber <= 60) {
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
            setText(button, '.feedbackButtonProgressBar', `Questions Completed ${countComplete(id)} / ${questions.structure[id].questions.length}`)
        })
    }

    const addPopups = () => {
        addPopupHandler(document.querySelectorAll('.feedbackButton'), (div) => {
            const dataSlotId = +div.attributes['data-id'].value
            const popupContent = getTemplate('feedbackPopup').firstElementChild!
            const section = questions.structure[dataSlotId]
            setText(popupContent, 'div.feedbackTitle', `Feedback for ${section.title}`)
            section.questions.forEach((question) => {
                const questionBaseElement = getTemplate('questionTemplate').firstElementChild!
                setText(questionBaseElement, 'div.questionTitle', question.label)

                const inputElement = getTemplate(`${question.type}QuestionStyleTemplate`).firstElementChild!

                switch (question.type) {
                    case 'email': {
                        configureInput(inputElement as HTMLInputElement, question, dataSlotId)
                        break
                    }
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
        })
    }

    const addSubmit = () => {
        const saveButton = (document.getElementById('saveDataButton') as HTMLButtonElement)
        saveButton.onclick = (event) => {
            saveButton.innerText = 'Saving...';
            saveButton.disabled = true
            event.preventDefault()
            // eslint-disable-next-line no-undef
            grecaptcha.ready(async () => {
                // eslint-disable-next-line no-undef
                const token = await grecaptcha.execute('6LfkPcUlAAAAAHwYs14fkTiEZYsu5hAAq_bLKp-j', { action: 'submit' })
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
                    subTitle = question.subtitle
                }

                show = true
            }

            if (show) {
                const questionButton = getTemplate('feedbackButton').querySelector('div')!
                questionButton.setAttribute('data-id', index.toString())
                setText(questionButton, '.feedbackButtonTitle', question.title)
                setText(questionButton, '.feedbackButtonProgressBar', `Questions Completed ${countComplete(index)} / ${question.questions.length}`)
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
}
