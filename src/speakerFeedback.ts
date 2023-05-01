import { feedbackServerUrl, getTemplate } from "./common";

interface EventData {
    event: string;
    feedback: Feedback[];
}

interface Feedback {
    feedback?: string;
    ratingPresentation: number;
    ratingContent: number;
    ratingValue: number;
}


export default () => {
    const target = document.getElementById('speakerFeedbackReport') as HTMLDivElement
    if (!target) {
        return
    }

    const speakerKeyElement = (document.getElementById('speakerKey') as HTMLInputElement)!

    const showData = (data: EventData[]) => {
        target.innerHTML = ''
        data.forEach(event => {
            const title = getTemplate('title')!.firstElementChild as HTMLDivElement
            title.innerText = event.event
            target.insertAdjacentElement('beforeend', title)

            const feedbackTable = getTemplate('feedbackTable')!.firstElementChild as HTMLTableElement

            const feedbackTotals = event.feedback.reduce((acc, nextValue) => {
                acc.presSum += nextValue.ratingPresentation
                acc.contentSum += nextValue.ratingContent
                acc.valueSum += nextValue.ratingValue
                return acc
            }, { presSum: 0, contentSum: 0, valueSum: 0 });

            (feedbackTable.querySelector('#presAvg') as HTMLTableCellElement).innerText = (feedbackTotals.presSum / event.feedback.length).toFixed(2);
            (feedbackTable.querySelector('#contentAvg') as HTMLTableCellElement).innerText = (feedbackTotals.contentSum / event.feedback.length).toFixed(2);
            (feedbackTable.querySelector('#valueAvg') as HTMLTableCellElement).innerText = (feedbackTotals.valueSum / event.feedback.length).toFixed(2);

            const footerRow = (feedbackTable.querySelector('#feedbackFooter') as HTMLTableRowElement)
            event.feedback.forEach((f)=> {
                const row = getTemplate('feedbackRow')!.firstElementChild as HTMLTableRowElement
                (row.querySelector('.presValue') as HTMLTableCellElement).innerText = f.ratingValue.toString();
                (row.querySelector('.contentValue') as HTMLTableCellElement).innerText = f.ratingContent.toString();
                (row.querySelector('.valueValue') as HTMLTableCellElement).innerText = f.ratingValue.toString();
                (row.querySelector('.feedbackValue') as HTMLTableCellElement).innerText = f.feedback || ''

                footerRow.insertAdjacentElement('beforebegin', row)
            })

            target.insertAdjacentElement('beforeend', feedbackTable)
        })
    }

    const addButton = () => {
        const button = document.getElementById('getDataButton') as HTMLButtonElement
        if (!button) {
            return
        }

        button.onclick = async () => {
            button.disabled = true
            button.innerText = 'Loading...'
            const key = speakerKeyElement.value
            const data = await fetch(`${feedbackServerUrl}?speaker=${key}`)
            if (data.ok) {
                showData(await data.json())
                window.localStorage.setItem('speakerFeedbackKey', key)
            }

            button.disabled = false
            button.innerText = 'Get Report'
        }
    }

    const preloadSpeakerKey = () => {
        const speakerKey = window.localStorage.getItem('speakerFeedbackKey')
        if (speakerKey) {
            speakerKeyElement.value = speakerKey
        }
    }

    addButton()
    preloadSpeakerKey()
}