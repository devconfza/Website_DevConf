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

const sponsorBlock = document.getElementsByClassName("sponsor-content-detail-wide-body")[0];
if (sponsorBlock) {
    let sponsorPosition = 0;

    setInterval(() => {
        sponsorPosition += 0.25;
        if (sponsorPosition > sponsorBlock.scrollWidth) {
            sponsorPosition = 0;
        }
        sponsorBlock.scrollTo(sponsorPosition, 0);
    }, 10)
}

// const youtubeSection = document.getElementById("youtubeSection");
// if (youtubeSection) {
//     fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=40&playlistId=PLZgTMWtBnKkoLMiqqYd99f6StZovjxszG&key=AIzaSyBw1dUP0nQwOF8P6RRrPVqKGBXPK5Gl598`).then(async response => {
//         if (response.ok) {
//             document.getElementById("youtubeIframe")?.remove();
//             const data = await response.json();

//             data.items.forEach(element => {
//                 const link = document.createElement("a");
//                 link.href = `https://www.youtube.com/watch?${element.contentDetails.videoId}`
//                 const image = document.createElement("img")
//                 image.src = element.snippet.thumbnails.default.url;
//                 link.append(image)
//                 youtubeSection.append(link)
//             });
//         }
//     });
// }

function loadEventSessions(id: String, target: HTMLElement) {
    let eventData: Sessionize.Event;

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

        return remappedSpeakers.filter((_, index) => index < remappedSpeakers.length - 1).join(', ') + ' & ' + remappedSpeakers[remappedSpeakers.length - 1];
    }

    const getSpeakerBio = (sessionSpeakers: Array<string>): string => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s) => s.bio);

        if (remappedSpeakers.length === 1) {
            return remappedSpeakers[0];
        }

        return remappedSpeakers.join(" <hr/> ");
    }

    const otherSpeakerImages = (sessionSpeakers: Array<string>): Array<string> => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s) => s.profilePicture);

        if (remappedSpeakers.length === 1) {
            return [];
        }

        return remappedSpeakers.slice(1);
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
        (element.querySelector(querySelector)! as HTMLDivElement).innerHTML = content;
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
                    const socialLinks = getSpeakerInfo(matchedSession.speakers).flatMap(s => buildSocialBadges(s));
                    const contentNode = getTemplate("popupBioContent");
                    const bioContent = contentNode.firstElementChild!;
                    const otherImages = otherSpeakerImages(matchedSession.speakers);
                    if (otherImages.length > 0) {
                        const imageElement = bioContent.querySelector("img.largePopupImage")!!;
                        imageElement.classList.add("hide");
                        const multiImageElement = buildMuliSpeakerImageBlock(speakerInfo.profilePicture, otherImages, true);
                        imageElement.insertAdjacentElement('afterend', multiImageElement)
                    } else {
                        const imageElement = (bioContent.querySelector("img.largePopupImage")! as HTMLImageElement);
                        imageElement.src = speakerInfo.profilePicture;
                    }

                    setDivText(bioContent, "div.bio-speaker", multipleSpeakerNames(matchedSession.speakers));
                    const socialLinkPlaceholder = (bioContent.querySelector("div.bio-social")! as HTMLDivElement);
                    socialLinks.forEach(link => {
                        socialLinkPlaceholder.appendChild(link);
                    });


                    const bio = getSpeakerBio(matchedSession.speakers);
                    if (otherImages.length == 0) {
                        setDivText(bioContent, "div.bio-tagline", speakerInfo.tagLine);
                    }

                    setDivText(bioContent, "div.bio-title", matchedSession.title);
                    setDivText(bioContent, "div.bio-talk-description", matchedSession.description);
                    setDivText(bioContent, "div.bio-speaker-bio", bio);
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

    const speakerImageCreator = (src: string, hide = false): HTMLImageElement => {
        const imageElement = document.createElement("img");
        imageElement.src = src;
        imageElement.classList.add("speaker-image");
        if (hide) {
            imageElement.classList.add("hide");
        }
        return imageElement;
    }

    const buildMuliSpeakerImageBlock = (primaryImage: string, otherImages: string[], isLargePopupImage = false): HTMLDivElement => {
        const imagesHolder = document.createElement("div");
        imagesHolder.setAttribute("x-imageset", "");
        imagesHolder.classList.add("multi-speaker-container");
        const firstImage = speakerImageCreator(primaryImage);
        firstImage.classList.add("multi-speaker-image");
        if (isLargePopupImage) {
            firstImage.classList.add("largePopupImage");
        }

        imagesHolder.appendChild(firstImage);

        otherImages.forEach((otherSpeaker) => {
            const nextImage = speakerImageCreator(otherSpeaker, true);
            nextImage.classList.add("multi-speaker-image");
            if (isLargePopupImage) {
                nextImage.classList.add("largePopupImage");
            }

            imagesHolder.appendChild(nextImage);
        });

        return imagesHolder;
    }

    const parseEventData = (event: Sessionize.Event) => {
        eventData = event;

        document.querySelectorAll(".agenda-session").forEach((element, _) => {
            const div = element as HTMLDivElement;
            const id = div.attributes["data-slot-id"].value;
            const matchedSession = getSession(id);

            if (!matchedSession) {
                const tbaTemplate = getTemplate("tbaCardTemplate").querySelector("div");
                div.insertAdjacentElement("beforeend", tbaTemplate!);
            } else {
                const templateDivs = getTemplate("sessionCardTemplate").querySelectorAll("div");
                templateDivs.forEach((templateElement) => {
                    switch (templateElement.className) {
                        case "agenda-session-image": {
                            const otherImages = otherSpeakerImages(matchedSession.speakers);
                            if (otherImages.length > 0) {
                                const imagesHolder = buildMuliSpeakerImageBlock(singleSpeakerImage(matchedSession.speakers), otherImages);
                                templateElement.appendChild(imagesHolder);
                            } else {
                                templateElement.appendChild(speakerImageCreator(singleSpeakerImage(matchedSession.speakers)));
                            }

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
                    }

                    div.insertAdjacentElement("beforeend", templateElement);
                })
            }
        });

        addPopupHandler();
        toggleUI();
        rotateImages();
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

    const fadeOut = (element: HTMLElement) => {
        let opacity = 1;  // initial opacity
        const decrease = () => {
            if (opacity <= 0.1) {
                element.classList.add("hide");
                return true;
            }

            element.style.opacity = opacity.toString();
            opacity -= opacity * 0.025;
            requestAnimationFrame(decrease);
        };

        decrease();
    }

    const fadeIn = (element: HTMLElement) => {
        let opacity = 0.1;  // initial opacity
        element.classList.remove("hide");
        const increase = () => {
            if (opacity >= 1) {
                return true;
            }

            element.style.opacity = opacity.toString();
            opacity += opacity * 0.025;
            requestAnimationFrame(increase)
        };

        increase();
    }

    const rotateImages = () => {
        setInterval(() => {
            const imageSets = Array.from(document.querySelectorAll("div[x-imageSet]"));
            imageSets.forEach(imageSet => {
                const images = imageSet.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
                const currentImageIndex = Array.from(images).findIndex(i => !i.classList.contains("hide"));
                fadeOut(images[currentImageIndex]);
                let next = currentImageIndex + 1;
                if (next >= images.length) {
                    next = 0;
                }

                fadeIn(images[next]);
            });
        }, 3500);
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