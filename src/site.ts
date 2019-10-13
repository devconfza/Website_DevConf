import { Sessionize } from './definations/sessions';

if (typeof fetch === "undefined") {
    alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!");
}

const timeslots = [
    "10h00",
    "11h00",
    "12h00",
    "13h40",
    "14h40",
    "16h00",
    "17h00"
];

const rooms = [
    "Room 1",
    "Room 2",
    "Room 3",
    "Room 4",
    "Room 5",
];

const agendaPlaceholder = document.getElementById("agenda");
if (agendaPlaceholder) {
    const eventId = agendaPlaceholder.getAttribute('data-event-id');

    if (eventId) {
        loadEventSessions(eventId, agendaPlaceholder);
    }
}

function loadEventSessions(id: String, target: HTMLElement) {
    const getTemplate = (id: string) => {
        return ((document.getElementById(id) as HTMLTemplateElement)
            .cloneNode(true) as HTMLTemplateElement)
            .content;
    }

    const toggleUI = () => {
        document.querySelectorAll('.agenda-row-style-loading').forEach((element) => {
            const div = element as HTMLDivElement;
            div.style.display = "none";
        });

        document.querySelectorAll('.agenda > .hidden-row').forEach((element) => {
            const div = element as HTMLDivElement;
            div.style.display = "grid";
        });
    }

    const parseEventData = (event: Sessionize.Event) => {
        document.querySelectorAll(".agenda-session").forEach((element, index) => {
            const div = element as HTMLDivElement;
            const id = div.attributes["data-slot-id"].value;
            const matchedSession = event.sessions.filter(session => session.id === id)[0];

            if (!matchedSession) {
                const tbaTemplate = getTemplate("tbaCardTemplate").querySelector("div");
                div.insertAdjacentElement("beforeend", tbaTemplate!);
            } else {
                const templateDivs = getTemplate("sessionCardTemplate").querySelectorAll("div");
                templateDivs.forEach((templateElement) => {
                    div.insertAdjacentElement("beforeend", templateElement);
                })
            }
        });

        toggleUI();    
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