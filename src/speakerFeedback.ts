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

    const comparedValue = (speakerScore: number, average: number | undefined): string => {
        const avgValue = (average || 0)
        if (avgValue === 0) {
            return avgValue.toFixed(2);
        }

        let symbol = ''
        if (speakerScore > avgValue) {
            symbol = '↑'
        }

        if (speakerScore < avgValue) {
            symbol = '↓'
        }

        return `${avgValue.toFixed(2)} ${symbol}`
    }

    const showData = (data: EventData[], averages) => {
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

            const presAvg = (feedbackTotals.presSum / event.feedback.length);
            const contentAvg = (feedbackTotals.contentSum / event.feedback.length);
            const valueAvg = (feedbackTotals.valueSum / event.feedback.length);

            (feedbackTable.querySelector('#presAvg') as HTMLTableCellElement).innerText = presAvg.toFixed(2);
            (feedbackTable.querySelector('#contentAvg') as HTMLTableCellElement).innerText = contentAvg.toFixed(2);
            (feedbackTable.querySelector('#valueAvg') as HTMLTableCellElement).innerText = valueAvg.toFixed(2);

            if (averages.length > 0) {
                const average = averages[0];
                (feedbackTable.querySelector('#timeslotPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average[`${event.event}-ratingPresentationtimeslot`]);
                (feedbackTable.querySelector('#timeslotContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average[`${event.event}-ratingContenttimeslot`]);
                (feedbackTable.querySelector('#timeslotValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average[`${event.event}-ratingValuetimeslot`]);

                (feedbackTable.querySelector('#eventPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average[`${event.event}-ratingPresentation`]);
                (feedbackTable.querySelector('#eventContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average[`${event.event}-ratingContent`]);
                (feedbackTable.querySelector('#eventValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average[`${event.event}-ratingValue`]);

                (feedbackTable.querySelector('#globalPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average['global-ratingPresentation']);
                (feedbackTable.querySelector('#globalContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average['global-ratingContent']);
                (feedbackTable.querySelector('#globalValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average['global-ratingValue']);
            } else {
                feedbackTable.querySelectorAll('.additionalAverageInfo').forEach(item => { 
                    console.log('sdd');
                    (item as HTMLTableRowElement).style.display = 'none'; 
                });
            }

            const footerRow = (feedbackTable.querySelector('#feedbackFooter') as HTMLTableRowElement)
            event.feedback.forEach((f) => {
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
                const dataSet = await data.json() as Array<any>;
                const averages = dataSet.filter(row => !row.event)
                showData(dataSet.filter(row => row.event) as EventData[], averages)
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