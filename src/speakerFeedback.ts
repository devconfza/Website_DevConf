import { feedbackServerUrl, getTemplate } from "./common";

interface EventData {
    event: string;
    feedback: Feedback[];
}

interface Feedback {
    feedback?: string;
    whythis?: string;
    ratingPresentation: number;
    ratingContent: number;
    ratingValue: number;
    titleDescriptionMatch?: string;
    sessionLevelMatch?: string;
}


export default () => {
    const target = document.getElementById('speakerFeedbackReport') as HTMLDivElement
    if (!target) {
        return
    }

    const speakerKeyElement = (document.getElementById('speakerKey') as HTMLInputElement)!

    const toNumber = (value: number | string | undefined): number => Number(value ?? 0)

    const matchToScore = (value: string | undefined): number => {
        if (!value) {
            return 0
        }

        return value.toLowerCase() === 'yes' ? 1 : 0
    }

    const comparedValue = (speakerScore: number, average: number | string | undefined, suffix = ''): string => {
        const avgValue = toNumber(average)
        if (avgValue === 0) {
            return `${avgValue.toFixed(2)}${suffix}`;
        }

        let symbol = ''
        if (speakerScore > avgValue) {
            symbol = '↑'
        }

        if (speakerScore < avgValue) {
            symbol = '↓'
        }

        return `${avgValue.toFixed(2)}${suffix} ${symbol}`
    }

    const comparedPercentageValue = (speakerScore: number, average: number | string | undefined): string => {
        const avgValue = toNumber(average) * 100
        if (avgValue === 0) {
            return `${avgValue.toFixed(2)}%`
        }

        let symbol = ''
        if (speakerScore > avgValue) {
            symbol = '↑'
        }

        if (speakerScore < avgValue) {
            symbol = '↓'
        }

        return `${avgValue.toFixed(2)}% ${symbol}`
    }

    const formatValue = (value: number | string | undefined, suffix = ''): string => {
        if (value === undefined) {
            return ''
        }

        return `${toNumber(value).toFixed(0)}${suffix}`
    }

    const formatMatchValue = (value: string | undefined): string => value || ''

    const showData = (data: EventData[], averages: string | any[]) => {
        target.innerHTML = ''
        console.dir(data)
        if (data.length === 0) {
            target.innerText = 'No data yet! Check back later!'
            return
        }

        data.forEach(event => {
            const title = getTemplate('title')!.firstElementChild as HTMLDivElement
            title.innerText = event.event
            target.insertAdjacentElement('beforeend', title)

            const feedbackTable = getTemplate('feedbackTable')!.firstElementChild as HTMLTableElement

            const feedbackTotals = event.feedback.reduce((acc, nextValue) => {
                acc.presSum += nextValue.ratingPresentation
                acc.contentSum += nextValue.ratingContent
                acc.valueSum += nextValue.ratingValue
                acc.titleDescriptionMatchSum += matchToScore(nextValue.titleDescriptionMatch)
                acc.sessionLevelMatchSum += matchToScore(nextValue.sessionLevelMatch)
                return acc
            }, { presSum: 0, contentSum: 0, valueSum: 0, titleDescriptionMatchSum: 0, sessionLevelMatchSum: 0 });

            const presAvg = (feedbackTotals.presSum / event.feedback.length);
            const contentAvg = (feedbackTotals.contentSum / event.feedback.length);
            const valueAvg = (feedbackTotals.valueSum / event.feedback.length);
            const titleDescriptionMatchAvg = (feedbackTotals.titleDescriptionMatchSum / event.feedback.length) * 100;
            const sessionLevelMatchAvg = (feedbackTotals.sessionLevelMatchSum / event.feedback.length) * 100;

            (feedbackTable.querySelector('#presAvg') as HTMLTableCellElement).innerText = presAvg.toFixed(2);
            (feedbackTable.querySelector('#contentAvg') as HTMLTableCellElement).innerText = contentAvg.toFixed(2);
            (feedbackTable.querySelector('#valueAvg') as HTMLTableCellElement).innerText = valueAvg.toFixed(2);
            (feedbackTable.querySelector('#titleDescriptionMatchAvg') as HTMLTableCellElement).innerText = `${titleDescriptionMatchAvg.toFixed(2)}%`;
            (feedbackTable.querySelector('#sessionLevelMatchAvg') as HTMLTableCellElement).innerText = `${sessionLevelMatchAvg.toFixed(2)}%`;

            if (averages.length > 0) {
                const average = averages[0];
                (feedbackTable.querySelector('#timeslotPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average[`${event.event}-ratingPresentationtimeslot`]);
                (feedbackTable.querySelector('#timeslotContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average[`${event.event}-ratingContenttimeslot`]);
                (feedbackTable.querySelector('#timeslotValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average[`${event.event}-ratingValuetimeslot`]);
                (feedbackTable.querySelector('#timeslotTitleDescriptionMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(titleDescriptionMatchAvg, average[`${event.event}-titleDescriptionMatchtimeslot`]);
                (feedbackTable.querySelector('#timeslotSessionLevelMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(sessionLevelMatchAvg, average[`${event.event}-sessionLevelMatchtimeslot`]);

                (feedbackTable.querySelector('#eventPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average[`${event.event}-ratingPresentation`]);
                (feedbackTable.querySelector('#eventContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average[`${event.event}-ratingContent`]);
                (feedbackTable.querySelector('#eventValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average[`${event.event}-ratingValue`]);
                (feedbackTable.querySelector('#eventTitleDescriptionMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(titleDescriptionMatchAvg, average[`${event.event}-titleDescriptionMatch`]);
                (feedbackTable.querySelector('#eventSessionLevelMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(sessionLevelMatchAvg, average[`${event.event}-sessionLevelMatch`]);

                (feedbackTable.querySelector('#globalPresAvg') as HTMLTableCellElement).innerText = comparedValue(presAvg, average['global-ratingPresentation']);
                (feedbackTable.querySelector('#globalContentAvg') as HTMLTableCellElement).innerText = comparedValue(contentAvg, average['global-ratingContent']);
                (feedbackTable.querySelector('#globalValueAvg') as HTMLTableCellElement).innerText = comparedValue(valueAvg, average['global-ratingValue']);
                (feedbackTable.querySelector('#globalTitleDescriptionMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(titleDescriptionMatchAvg, average['global-titleDescriptionMatch']);
                (feedbackTable.querySelector('#globalSessionLevelMatchAvg') as HTMLTableCellElement).innerText = comparedPercentageValue(sessionLevelMatchAvg, average['global-sessionLevelMatch']);
            } else {
                feedbackTable.querySelectorAll('.additionalAverageInfo').forEach(item => {
                    (item as HTMLTableRowElement).style.display = 'none';
                });
            }

            const footerRow = (feedbackTable.querySelector('#feedbackFooter') as HTMLTableRowElement)
            event.feedback.forEach((f) => {
                const row = getTemplate('feedbackRow')!.firstElementChild as HTMLTableRowElement
                (row.querySelector('.presValue') as HTMLTableCellElement).innerText = formatValue(f.ratingPresentation);
                (row.querySelector('.contentValue') as HTMLTableCellElement).innerText = formatValue(f.ratingContent);
                (row.querySelector('.valueValue') as HTMLTableCellElement).innerText = formatValue(f.ratingValue);
                (row.querySelector('.titleDescriptionMatchValue') as HTMLTableCellElement).innerText = formatMatchValue(f.titleDescriptionMatch);
                (row.querySelector('.sessionLevelMatchValue') as HTMLTableCellElement).innerText = formatMatchValue(f.sessionLevelMatch);
                (row.querySelector('.whythisValue') as HTMLTableCellElement).innerText = f.whythis || '';
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
            const key = speakerKeyElement.value
            if (!key || key.length != 32) {
                return
            }

            try {
                button.disabled = true
                button.innerText = 'Loading...'
                const data = await fetch(`${feedbackServerUrl}?speaker=${key}`)
                if (data.ok) {
                    const dataSet = await data.json() as Array<any>;
                    const averages = dataSet.filter(row => !row.event)
                    showData(dataSet.filter(row => row.event) as EventData[], averages)
                    window.localStorage.setItem('speakerFeedbackKey', key)
                } else {
                    target.innerText = `Invalid speaker key [${data.status}]`
                }
            } finally {
                button.disabled = false
                button.innerText = 'Get Report'
            }
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
