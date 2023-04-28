import { addPopupHandler, getTemplate, setText } from './common'
import { loadSessionizeData } from './sessionize'
import { v4 as uuidv4 } from 'uuid'

interface QuestionStructure {
    id: string,
    label: string,
    type: 'rate' | 'text' | 'timeslot-selector' | 'yesno' | 'role' | 'level' | 'years' | 'email' | 'influence'
    key: number | undefined
}

interface SectionStructure {
    title: string,
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

    const questionsResponse = await fetch('/public/ratingconfig.json')
    if (!questionsResponse.ok) {
        return
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
        const session = eventData!.sessions.find((s) => s.id === sessionId)!
        const speakers = session.speakers.map((speakerId) => eventData!.speakers.find((speaker) => speaker.id === speakerId)!.fullName).join(' and ')
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

                if (valueAsNumber) {
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

    const updateCompleted = () => {
        document.querySelectorAll('div.feedbackButton').forEach((button) => {
            const id = +button.attributes['data-id'].value
            const completed = Object.keys(ratingData[`s${id}`] || {}).length
            setText(button, '.feedbackButtonProgressBar', `Questions Completed ${completed} / ${questions.structure[id].questions.length}`)
        })
    }

    const questions = await questionsResponse.json() as QuestionaireStructure

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
                if (inputElement) {
                    questionBaseElement.insertAdjacentElement('beforeend', inputElement)
                }

                popupContent.insertAdjacentElement('beforeend', questionBaseElement)
            })

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
        (document.getElementById('saveDataButton') as HTMLButtonElement).onclick = (event) => {
            event.preventDefault()
            // eslint-disable-next-line no-undef
            grecaptcha.ready(async () => {
                // eslint-disable-next-line no-undef
                const token = await grecaptcha.execute('6LfkPcUlAAAAAHwYs14fkTiEZYsu5hAAq_bLKp-j', { action: 'submit' })
                ratingData.captcha = token
                // const uploadResult = await fetch('http://localhost:8080/', {
                const uploadResult = await fetch('https://ratings-2slkxdorza-nw.a.run.app', {
                    method: 'POST',
                    body: JSON.stringify(ratingData),
                })

                if (!uploadResult.ok) {
                    alert('Oh no! Something has gone horribly wrong. Please reload your browser and try again.')
                }

                console.log(uploadResult)
            })
        }
    }

    questions.structure.forEach((question, index) => {
        let show = false
        let title: string | undefined = undefined
        if (question.workshop !== undefined) {
            const workshopTitle = workshopStructure[question.workshop]
            if (workshopTitle !== 'none') {
                show = true
                title = workshopTitle
            }
        } else {
            show = true
        }

        if (show) {
            const questionButton = getTemplate('feedbackButton').querySelector('div')!
            questionButton.setAttribute('data-id', index.toString())
            setText(questionButton, '.feedbackButtonTitle', question.title)
            const completed = Object.keys(ratingData[`s${index}`] || {}).length
            setText(questionButton, '.feedbackButtonProgressBar', `Questions Completed ${completed} / ${question.questions.length}`)
            if (title) {
                setText(questionButton, '.feedbackButtonWorkshop', title)
            }

            stage.insertAdjacentElement('beforeend', questionButton)
        }
    })

    addPopups()
    addSubmit()
}
