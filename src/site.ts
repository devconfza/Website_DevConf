import { Sessionize } from './definations/sessions';

if (typeof fetch === "undefined") {
    alert("Oh no 😢 We don't support your web browser. Please upgrade to a newer version!");
}

export function loadEventSessions(id: String, target: HTMLElement) {
    const getTemplate = (id: string) => {
        return ((document.getElementById(id) as HTMLTemplateElement)
            .cloneNode(true) as HTMLTemplateElement)
            .content;
    }

    const sessionCard = (session: Sessionize.Session, speakers: Sessionize.Speaker[], span: Number) => {
        const content = getTemplate("sessionTemplate");
        content.querySelector("span.talkTitle")!.textContent = session.title;
        const sessionSpeakers = session.speakers
            .map(speakerId => speakers.filter(s => s.id === speakerId)[0]);

        //session.startsAt
        //session.endsAt
        //session.categoryItems

        const imageHolder = content.querySelector("div.talkImages") as HTMLDivElement;
        sessionSpeakers
            .map(speaker => {
                const image = document.createElement("img");
                image.classList.add("profileImage");
                image.src = speaker.profilePicture;
                image.alt = `Profile picture of ${speaker.fullName}`;
                return image;
            })
            .forEach(image => imageHolder.appendChild(image));
        
        content.querySelector("span.talkSpeaker")!.innerHTML = sessionSpeakers
            .map(speaker => speaker.fullName)
            .join("<br/>");

        if (session.isPlenumSession) {
            const sessionDiv = content.querySelector("div.session") as HTMLDivElement;
            sessionDiv.classList.add("highlight");
            sessionDiv.style.gridColumnEnd = `span ${span}`;
        }

        return content;
    }

    const breakCard = (session: Sessionize.Session, span: Number) => {
        const content = getTemplate("breakTeamplate");
        const rootDiv = content.querySelector("div.break")! as HTMLDivElement;
        rootDiv.textContent = session.title;
        rootDiv.style.gridColumnEnd = `span ${span}`;
        return content;
    }

    const parseEventData = (event: Sessionize.Event) => {
        const rooms = event.rooms.length;
        target.style.gridTemplateColumns = event.rooms.map(() => "auto").join(' ');

        event.sessions.map((session, index) => {
            if (session.isServiceSession) {
                return breakCard(session, rooms);
            }

            return sessionCard(session, event.speakers, rooms);
        })
        .forEach(content => {
            target.appendChild(document.importNode(content, true));
        });
    }

    const loadStoredData = () => {
        const sessionData = window.sessionStorage.getItem(`event${id}`);
        if (sessionData) {
            const event = JSON.parse(sessionData) as Sessionize.Event;
            parseEventData(event);
        } else {
            // TODO : wat
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
