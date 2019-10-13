import { Sessionize } from './definations/sessions';

if (typeof fetch === "undefined") {
    alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!");
}

const agendaPlaceholder = document.getElementById("agenda");
if (agendaPlaceholder) {
    const eventId = agendaPlaceholder.getAttribute('data-event-id');

    if (eventId) {
        loadEventSessions(eventId, agendaPlaceholder);
    }
}

function loadEventSessions(id: String, target: HTMLElement) {
    const parseEventData = (event: Sessionize.Event) => {
    }

    const loadStoredData = () => {
        const sessionData = window.sessionStorage.getItem(`event${id}`);
        if (sessionData) {
            const event = JSON.parse(sessionData) as Sessionize.Event;
            parseEventData(event);
        } else {
            alert('Oh no! Something has gone horribly wrong. Please reload your browser and try again.')
        }
    }

    if (navigator.onLine) {
        fetch(`https://sessionize.com/api/v2/${id}/view/all`).then(response => {
            switch (response.status) {
                case 200: {
                    response.json()
                        .then(value => value as Sessionize.Event)
                        .then(event => {
                            window.sessionStorage.setItem(`event${id}`, JSON.stringify(event));
                            parseEventData(event)
                        });

                    break;
                }
                case 304: {
                    loadStoredData();
                    break;
                }
            }
        });
    } else {
        loadStoredData();
    }
}