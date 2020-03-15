import { Sessionize } from './definations/sessions';
import { Session } from 'inspector';

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
    let eventData: Sessionize.Event;
    let tracks: Array<Sessionize.Item>;

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

    const getSpeakerInfo = (sessionSpeakers: Array<string>) => {
        return eventData.speakers.filter(s => sessionSpeakers.indexOf(s.id) >= 0);
    }

    const multipleSpeakerNames = (sessionSpeakers: Array<string>): string => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s) => s.fullName);

        if (remappedSpeakers.length === 1) {
            return remappedSpeakers[0];
        }

        return remappedSpeakers.filter((value, index) => index < remappedSpeakers.length - 1).join(', ') + ' & ' + remappedSpeakers[remappedSpeakers.length - 1];
    }

    const getTrack = (session: Sessionize.Session) => {
        const trackId = session.categoryItems.filter(category => tracks.map(track => track.id).indexOf(category) > -1)[0];

        if (trackId) {
            return tracks.filter(category => category.id === trackId)[0].name;
        }

        return "";
    }

    const singleSpeaker = (sessionSpeakers: Array<string>) => {
        return getSpeakerInfo(sessionSpeakers)[0];
    };

    const singleSpeakerImage = (sessionSpeakers: Array<string>): string => {
        return singleSpeaker(sessionSpeakers).profilePicture;
    };

    const closePopup = () => {
        document.querySelector("div.popupBackdrop")!.classList.add("popupBackdropHidden");
        document.removeEventListener("keydown", handleCloseKeyPress);
    }

    const handleCloseKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            closePopup();
        }
    }

    const buildSocialBadges = (speaker: Sessionize.Speaker) => {
        const result: Array<HTMLAnchorElement> = [];
        speaker.links.forEach(link => {
            const aTag = document.createElement("a");
            aTag.target = "_blank";
            aTag.href = link.url;
            const image = document.createElement("img");
            image.alt = link.title;
            switch (link.title) {
                case "Twitter": {
                    image.src = "/public/images/icons8-twitter-50.png";
                    break;
                }
                case "LinkedIn": {
                    image.src = "/public/images/icons8-linkedin-50.png";
                    break;
                }
                case "Blog": {
                    image.src = "/public/images/icons8-website-50.png";
                    break;
                }
                default: {
                    image.src = "/public/images/icons8-external-link-50.png";
                    break;
                }
            }
            aTag.appendChild(image);
            result.push(aTag);
        });

        return result;
    }

    const setDivText = (element: Element, querySelector: string, content: string) => {
        (element.querySelector(querySelector)! as HTMLDivElement).innerText = content;
    }

    const addPopupHandler = () => {
        const popupClose = document.querySelector("div.popupClose")! as HTMLDivElement;
        popupClose.onclick = (e) => {
            closePopup();
        };

        const backdrop = document.querySelector("div.popupBackdropHidden")!;
        backdrop.addEventListener("click", closePopup);

        document.querySelectorAll('.agenda-session').forEach((element) => {
            const div = element as HTMLDivElement;
            const id = element.attributes["data-slot-id"].value;
            if (id && id !== "0") {
                div.classList.add("clickable-session");
                div.onclick = (e) => {
                    const id = div.attributes["data-slot-id"].value;
                    const matchedSession = getSession(id);
                    backdrop.classList.remove("popupBackdropHidden");

                    document.addEventListener("keydown", handleCloseKeyPress);

                    const popupContent = document.querySelector("div.popupContent")!;
                    popupContent.querySelectorAll("div.popupBio").forEach((value) => {
                        popupContent.removeChild(value);
                    });

                    const speakerInfo = singleSpeaker(matchedSession.speakers);
                    const socialLinks = buildSocialBadges(speakerInfo);
                    const bioContent = getTemplate("popupBioContent").firstElementChild!;
                    (bioContent.querySelector("img.largePopupImage")! as HTMLImageElement).src = speakerInfo.profilePicture;
                    setDivText(bioContent, "div.bio-speaker", multipleSpeakerNames(matchedSession.speakers));
                    const socialLinkPlaceholder = (bioContent.querySelector("div.bio-social")! as HTMLDivElement);
                    socialLinks.forEach(link => {
                        socialLinkPlaceholder.appendChild(link);
                    });

                    setDivText(bioContent, "div.bio-tagline", speakerInfo.tagLine);
                    setDivText(bioContent, "div.bio-title", matchedSession.title);
                    setDivText(bioContent, "div.bio-talk-description", matchedSession.description);
                    setDivText(bioContent, "div.bio-speaker-bio", speakerInfo.bio);
                    setDivText(bioContent, "div.bio-track", `Track: ${getTrack(matchedSession)}`);
                    popupContent.insertAdjacentElement("beforeend", bioContent);
                };
            } else {
                div.classList.add("unclickable-session");
            }
        });
    }

    const getSession = (sessionId: String) => {
        return eventData.sessions.filter(session => session.id === sessionId)[0];
    }

    const parseEventData = (event: Sessionize.Event) => {
        eventData = event;
        tracks = event.categories.filter(category => category.title === "Track")[0].items;

        document.querySelectorAll(".agenda-session").forEach((element, index) => {
            const div = element as HTMLDivElement;
            const id = div.attributes["data-slot-id"].value;
            const remote = div.attributes["data-remote"].value === "true";
            const matchedSession = getSession(id);

            if (!matchedSession) {
                const tbaTemplate = getTemplate("tbaCardTemplate").querySelector("div");
                div.insertAdjacentElement("beforeend", tbaTemplate!);
            } else {
                const templateDivs = getTemplate("sessionCardTemplate").querySelectorAll("div");
                templateDivs.forEach((templateElement) => {
                    switch (templateElement.className) {
                        case "agenda-session-image": {
                            const imageElement = document.createElement("img");
                            imageElement.src = singleSpeakerImage(matchedSession.speakers);
                            imageElement.classList.add("speaker-image");
                            templateElement.appendChild(imageElement);
                            break;
                        }
                        case "agenda-session-name": {
                            templateElement.innerText = multipleSpeakerNames(matchedSession.speakers);
                            break;
                        }
                        case "agenda-session-title": {
                            templateElement.innerText = matchedSession.title;
                            break;
                        }
                        case "agenda-session-remote": {
                            if (remote) {
                                templateElement.style.display = "block";
                            }

                            break;
                        }
                    }

                    div.insertAdjacentElement("beforeend", templateElement);
                })
            }
        });

        addPopupHandler();
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