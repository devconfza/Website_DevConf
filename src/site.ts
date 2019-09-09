import { Sessionize } from './definations/sessions';

if (typeof fetch === "undefined") {
    alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!");
}

const agendaPlaceholder = document.getElementById("agenda");
if (agendaPlaceholder) {
    const eventId = agendaPlaceholder.getAttribute('data-event-id');
    const eventDate = agendaPlaceholder.getAttribute('data-event-date');

    if (eventId && eventDate) {
        loadEventSessions(eventId, agendaPlaceholder, new Date(eventDate));
    }
}

function loadEventSessions(id: String, target: HTMLElement, eventDate: Date) {
    const getTemplate = (id: string) => {
        return ((document.getElementById(id) as HTMLTemplateElement)
            .cloneNode(true) as HTMLTemplateElement)
            .content;
    }

    const roomCard = (roomName: string, column: number) => {
        const content = getTemplate("roomCardTemplate");
        const rootDiv = content.querySelector("div.room")! as HTMLDivElement;
        rootDiv.textContent = roomName;
        rootDiv.style.gridColumn = column.toString();
        return content;
    }

    const sessionCard = (session: Sessionize.Session, speakers: Sessionize.Speaker[], span: Number) => {
        const content = getTemplate("sessionTemplate");
        content.querySelector("span.talkTitle")!.textContent = session.title;
        const link = (content.querySelector("a.modal")! as HTMLAnchorElement);
        link.href = `#modal-window-${session.id}`;

        const imageHolder = content.querySelector("div.talkImages") as HTMLDivElement;
        speakers
            .map(speaker => {
                const image = document.createElement("img");
                image.classList.add("profileImage");
                image.src = speaker.profilePicture;
                image.alt = `Profile picture of ${speaker.fullName}`;
                return image;
            })
            .forEach(image => imageHolder.appendChild(image));

        content.querySelector("span.talkSpeaker")!.innerHTML = speakers
            .map(speaker => speaker.fullName)
            .join(" &amp; ");

        const sessionDiv = content.querySelector("div.session") as HTMLDivElement;
        if (session.isPlenumSession) {
            sessionDiv.classList.add("highlight");
            link.style.gridColumnEnd = `span ${span}`;
        }

        return content;
    }

    const sessionPopup = (session: Sessionize.Session, speakers: Sessionize.Speaker[]) => {
        const content = getTemplate("sessionDetail");
        content.querySelector("aside.popupContainer")!.id = `modal-window-${session.id}`;
        //content.querySelector("span.talkTitle")!.textContent = session.title;

        // const imageHolder = content.querySelector("div.talkImages") as HTMLDivElement;
        // speakers
        //     .map(speaker => {
        //         const image = document.createElement("img");
        //         image.classList.add("profileImage");
        //         image.src = speaker.profilePicture;
        //         image.alt = `Profile picture of ${speaker.fullName}`;
        //         return image;
        //     })
        //     .forEach(image => imageHolder.appendChild(image));

        // content.querySelector("span.talkSpeaker")!.innerHTML = speakers
        //     .map(speaker => speaker.fullName)
        //     .join("<br/>");

        return content;
    }

    const breakCard = (session: Sessionize.Session, span: Number) => {
        const content = getTemplate("breakTeamplate");
        const rootDiv = content.querySelector("div.break")! as HTMLDivElement;
        rootDiv.textContent = session.title;
        rootDiv.style.gridColumnEnd = `span ${span}`;
        return content;
    }

    const tbaCard = () => {
        return getTemplate("tbaCardTemplate");
    }

    const timeslotCard = (session: Sessionize.Session) => {
        const content = getTemplate("timeslotCardTemplate");
        const rootDiv = content.querySelector("div.timeslot")! as HTMLDivElement;
        rootDiv.textContent = `${new Date(session.startsAt).toLocaleTimeString()} - ${new Date(session.endsAt).toLocaleTimeString()}`;
        return content;
    }

    const parseEventData = (event: Sessionize.Event) => {
        const rooms = event.rooms.length;
        target.style.gridTemplateColumns = "180px " + "auto ".repeat(rooms);

        event.rooms
            .forEach((room, i) => {
                target.appendChild(document.importNode(roomCard(room.name, i + 2), true))
            });

        let lastTimeChange = 0;
        const popups = Array<DocumentFragment>();
        event.sessions
            .filter(session => new Date(session.startsAt).getDate() === eventDate.getDate())
            .reduce((accumalator, session) => {
            const sessionStart = new Date(session.startsAt)
            if (sessionStart.getTime() !== lastTimeChange) {
                lastTimeChange = sessionStart.getTime();
                accumalator.push(document.importNode(timeslotCard(session), true));
            }

            if (session.isServiceSession && session.title !== "TBA") {
                accumalator.push(breakCard(session, rooms))
                return accumalator;
            }

            if (session.title === "TBA") {
                accumalator.push(tbaCard());
                return accumalator;
            }

            const sessionSpeakers = session.speakers
                .map(speakerId => event.speakers.filter(s => s.id === speakerId)[0]);
            popups.push(sessionPopup(session, sessionSpeakers));
            accumalator.push(sessionCard(session, sessionSpeakers, rooms));
            return accumalator;
        }, Array<DocumentFragment>())
            .forEach(content => {
                target.appendChild(document.importNode(content, true));
            });

        popups.forEach(popup => {
            document.lastElementChild!.append(popup);
        })
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