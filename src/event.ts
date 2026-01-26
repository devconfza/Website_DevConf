import { addPopupHandler, getTemplate, setText } from './common'
import { SessionizeEvent, SessionizeSession, SessionizeSpeaker, loadSessionizeData } from './sessionize'

export default async () => {
    const agendaPlaceholder = document.getElementById('agenda')

    if (!agendaPlaceholder) {
        return
    }

    const eventId = agendaPlaceholder.getAttribute('data-event-id')

    if (!eventId) {
        return
    }

    let eventData: SessionizeEvent | undefined

    const toggleUI = () => {
        document.querySelectorAll('.agenda-row-style-loading').forEach((element) => {
            const div = element as HTMLDivElement
            div.style.display = 'none'
        })

        document.querySelectorAll('.agenda > .hidden-row').forEach((element) => {
            const div = element as HTMLDivElement
            div.style.display = 'grid'
        })
    }

    const getSpeakerInfo = (sessionSpeakers: Array<string>) => {
        return eventData!.speakers.filter((s: SessionizeSpeaker) => sessionSpeakers.indexOf(s.id) >= 0)
    }

    const seperatorSet = ["🔹"]

    const title = (sessionInfo: SessionizeSession): string => {
        const want = (document.getElementById("titlePreference") as HTMLSelectElement).value;
        const altTitle = sessionInfo.questionAnswers.find(i => i.questionId === 113498)?.answerValue;

        if (!altTitle || want === 'informative' || (want === 'preferred' && sessionInfo.categoryItems.indexOf(408407) >= 0)) {
            return sessionInfo.title;
        }

        return altTitle;
    }

    const level = (sessionInfo: SessionizeSession): string => {
        if (sessionInfo.categoryItems.indexOf(394910) >= 0) {
            return "101: No audience prerequisites (Introduction)"
        }

        if (sessionInfo.categoryItems.indexOf(394911) >= 0) {
            return "201: Audience should already be familiar with the topic"
        }

        if (sessionInfo.categoryItems.indexOf(394909) >= 0) {
            return "301: Audience expected to have experience and a strong knowledge of the topic (Deep Dives)"
        }

        return "";
    }

    const theme = (sessionInfo: SessionizeSession): string => {
        if (sessionInfo.categoryItems.indexOf(394857) >= 0) {
            return "AI / LLM / Rag / ML"
        }

        if (sessionInfo.categoryItems.indexOf(394858) >= 0) {
            return "Accessibility"
        }

        if (sessionInfo.categoryItems.indexOf(394860) >= 0) {
            return "Architecture / System Design"
        }

        if (sessionInfo.categoryItems.indexOf(394850) >= 0) {
            return "Blockchain & Crypto"
        }

        if (sessionInfo.categoryItems.indexOf(394851) >= 0) {
            return "Cloud"
        }

        if (sessionInfo.categoryItems.indexOf(394852) >= 0) {
            return "Data / Big Data / Databases"
        }

        if (sessionInfo.categoryItems.indexOf(394853) >= 0) {
            return "DevOps Methodologies / CI / CD / Pipelines / Deployments"
        }

        if (sessionInfo.categoryItems.indexOf(394859) >= 0) {
            return "Fun / Experiments"
        }

        if (sessionInfo.categoryItems.indexOf(394846) >= 0) {
            return "IoT / Hardware"
        }

        if (sessionInfo.categoryItems.indexOf(394845) >= 0) {
            return "Mental Health / Safety @ Work"
        }

        if (sessionInfo.categoryItems.indexOf(394912) >= 0) {
            return "Personal / Leadership Development"
        }

        if (sessionInfo.categoryItems.indexOf(394847) >= 0) {
            return "Programming Languages & Frameworks"
        }

        if (sessionInfo.categoryItems.indexOf(394854) >= 0) {
            return "Security / Hacking / Infosec"
        }

        if (sessionInfo.categoryItems.indexOf(394855) >= 0) {
            return "Tales from the trenches"
        }

        if (sessionInfo.categoryItems.indexOf(394848) >= 0) {
            return "Team Culture / Team Leadership / Mentoring"
        }

        if (sessionInfo.categoryItems.indexOf(394861) >= 0) {
            return "Testing / QA"
        }

        if (sessionInfo.categoryItems.indexOf(394849) >= 0) {
            return "UI / UX / Design"
        }

        return "Other"
    }

    const speakerSubtitle = (sessionSpeakers: Array<string>): string => {
        const speakers = getSpeakerInfo(sessionSpeakers)

        if (speakers.length === 1) {
            const speaker = speakers[0]
            let country = ''
            if (speaker.categoryItems.indexOf(394843) >= 0) {
                country = 'South Africa'
            } else {
                country = speaker.questionAnswers.find(i => i.questionId === 109821)?.answerValue
            }

            let pronoun = ''
            if (speaker.categoryItems.indexOf(394864) >= 0) {
                pronoun = 'He/Him'
            }

            if (speaker.categoryItems.indexOf(394862) >= 0) {
                pronoun = 'She/Her'
            }

            if (speaker.categoryItems.indexOf(394863) >= 0) {
                pronoun = 'They/Them'
            }

            if (speaker.categoryItems.indexOf(394865) >= 0) {
                pronoun = 'Other'
            }

            const seperator = seperatorSet[Math.floor(Math.random() * seperatorSet.length)]

            if (pronoun) {
                return `${pronoun} ${seperator} ${country}`
            } else {
                return country ?? ""
            }
        }

        return ""
    }

    const multipleSpeakerNames = (sessionSpeakers: Array<string>): string => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s: SessionizeSpeaker) => s.fullName)

        if (remappedSpeakers.length === 1) {
            return remappedSpeakers[0]
        }

        return `${remappedSpeakers.filter((_, index) => index < remappedSpeakers.length - 1).join(', ')} & ${remappedSpeakers[remappedSpeakers.length - 1]}`
    }

    const getSpeakerBio = (sessionSpeakers: Array<string>): string => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s) => s.bio)

        if (remappedSpeakers.length === 1) {
            return remappedSpeakers[0]
        }

        return remappedSpeakers.join(' <hr/> ')
    }

    const otherSpeakerImages = (sessionSpeakers: Array<string>): Array<string> => {
        const remappedSpeakers = getSpeakerInfo(sessionSpeakers).map((s) => s.profilePicture)

        if (remappedSpeakers.length === 1) {
            return []
        }

        return remappedSpeakers.slice(1)
    }

    const singleSpeaker = (sessionSpeakers: Array<string>) => getSpeakerInfo(sessionSpeakers)[0]

    const singleSpeakerImage = (sessionSpeakers: Array<string>): string => singleSpeaker(sessionSpeakers).profilePicture

    const buildSocialBadges = (speaker: SessionizeSpeaker) => {
        const result: Array<HTMLAnchorElement> = []
        speaker.links.forEach((link) => {
            const aTag = document.createElement('a')
            aTag.target = '_blank'
            aTag.href = link.url
            const image = document.createElement('img')
            image.alt = link.title
            switch (link.title) {
                case 'Twitter': {
                    image.src = '/public/images/icons8-twitter-50.png'
                    break
                }
                case 'LinkedIn': {
                    image.src = '/public/images/icons8-linkedin-50.png'
                    break
                }
                case 'Blog': {
                    image.src = '/public/images/icons8-website-50.png'
                    break
                }
                default: {
                    image.src = '/public/images/icons8-external-link-50.png'
                    break
                }
            }
            aTag.appendChild(image)
            result.push(aTag)
        })

        return result
    }

    const getSession = (sessionId: String) => eventData!.sessions.filter((session) => session.id === sessionId)[0]

    const speakerImageCreator = (src: string, hide = false): HTMLImageElement => {
        const imageElement = document.createElement('img')
        imageElement.src = src
        imageElement.classList.add('speaker-image')
        if (hide) {
            imageElement.classList.add('hide')
        }
        return imageElement
    }

    const buildMuliSpeakerImageBlock = (primaryImage: string, otherImages: string[], isLargePopupImage = false): HTMLDivElement => {
        const imagesHolder = document.createElement('div')
        imagesHolder.setAttribute('x-imageset', '')
        imagesHolder.classList.add('multi-speaker-container')
        const firstImage = speakerImageCreator(primaryImage)
        firstImage.classList.add('multi-speaker-image')
        if (isLargePopupImage) {
            firstImage.classList.add('largePopupImage')
        }

        imagesHolder.appendChild(firstImage)

        otherImages.forEach((otherSpeaker) => {
            const nextImage = speakerImageCreator(otherSpeaker, true)
            nextImage.classList.add('multi-speaker-image')
            if (isLargePopupImage) {
                nextImage.classList.add('largePopupImage')
            }

            imagesHolder.appendChild(nextImage)
        })

        return imagesHolder
    }

    const addPopups = () => {
        addPopupHandler(document.querySelectorAll('.agenda-session'), (div) => {
            const dataSlotId = div.attributes['data-slot-id'].value
            if (!dataSlotId && dataSlotId === '0') {
                return null
            }

            const matchedSession = getSession(dataSlotId)

            if (matchedSession) {
                const speakerInfo = singleSpeaker(matchedSession.speakers)
                const socialLinks = getSpeakerInfo(matchedSession.speakers).flatMap((s) => buildSocialBadges(s))
                const contentNode = getTemplate('popupBioContent')
                const bioContent = contentNode.firstElementChild!
                const otherImages = otherSpeakerImages(matchedSession.speakers)
                if (otherImages.length > 0) {
                    const imageElement = bioContent.querySelector('img.largePopupImage')!!
                    imageElement.classList.add('hide')
                    const multiImageElement = buildMuliSpeakerImageBlock(speakerInfo.profilePicture, otherImages, true)
                    imageElement.insertAdjacentElement('afterend', multiImageElement)
                } else {
                    const imageElement = (bioContent.querySelector('img.largePopupImage')! as HTMLImageElement)
                    imageElement.src = speakerInfo.profilePicture
                }

                setText(bioContent, 'div.bio-speaker', multipleSpeakerNames(matchedSession.speakers))
                setText(bioContent, 'div.bio-subtitle', speakerSubtitle(matchedSession.speakers))
                const socialLinkPlaceholder = (bioContent.querySelector('div.bio-social')! as HTMLDivElement)
                socialLinks.forEach((link) => {
                    socialLinkPlaceholder.appendChild(link)
                })

                const bio = getSpeakerBio(matchedSession.speakers)
                if (otherImages.length === 0) {
                    setText(bioContent, 'div.bio-tagline', speakerInfo.tagLine)
                }

                setText(bioContent, 'div.bio-title', title(matchedSession))
                setText(bioContent, 'div.bio-track', theme(matchedSession))
                setText(bioContent, 'div.bio-level', level(matchedSession))
                setText(bioContent, 'div.bio-talk-description', matchedSession.description)
                setText(bioContent, 'div.bio-speaker-bio', bio)
                return bioContent
            } else {
                return null;
            }
        }, 'clickable-session', 'unclickable-session', undefined, (div) => {
            const speakerId = div.attributes["speaker-id"].value
            if (speakerId) {
                const matchedSession = getSession(speakerId)
                if (matchedSession) {
                    const speakerInfo = singleSpeaker(matchedSession.speakers)
                    window.currentSpeaker = {
                        name: speakerInfo.fullName,
                        id: speakerId
                    }
                }
            }
        })
    }

    const fadeOut = (element: HTMLElement) => {
        let opacity = 1 // initial opacity
        const decrease = () => {
            if (opacity <= 0.1) {
                element.classList.add('hide')
                return
            }

            element.style.opacity = opacity.toString()
            opacity -= opacity * 0.025
            requestAnimationFrame(decrease)
        }

        decrease()
    }

    const fadeIn = (element: HTMLElement) => {
        let opacity = 0.1 // initial opacity
        element.classList.remove('hide')
        const increase = () => {
            if (opacity >= 1) {
                return
            }

            element.style.opacity = opacity.toString()
            opacity += opacity * 0.025
            requestAnimationFrame(increase)
        }

        increase()
    }

    const rotateImages = () => {
        setInterval(() => {
            const imageSets = Array.from(document.querySelectorAll('div[x-imageSet]'))
            imageSets.forEach((imageSet) => {
                const images: NodeListOf<HTMLImageElement> = imageSet.querySelectorAll('img')
                const currentImageIndex = Array.from(images).findIndex((i) => !i.classList.contains('hide'))
                fadeOut(images[currentImageIndex])
                let next = currentImageIndex + 1
                if (next >= images.length) {
                    next = 0
                }

                fadeIn(images[next])
            })
        }, 3500)
    }

    const parseEventData = () => {
        document.querySelectorAll('.agenda-session').forEach((element) => {
            const div = element as HTMLDivElement

            div.querySelectorAll('.agenda-session-tba').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-image').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-name').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-subtitle').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-title').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-remote').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-underline').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-session-theme').forEach((child) => child.remove())
            div.querySelectorAll('.agenda-session-session-level').forEach((child) => child.remove())

            const dataSlotId = div.attributes['data-slot-id'].value
            if (dataSlotId === '999999') {
                const tbaTemplate = getTemplate('noSessionCardTemplate').querySelector('div')
                div.insertAdjacentElement('beforeend', tbaTemplate!)
            } else {
                const matchedSession = getSession(dataSlotId)

                if (!matchedSession) {
                    const tbaTemplate = getTemplate('tbaCardTemplate').querySelector('div')
                    div.insertAdjacentElement('beforeend', tbaTemplate!)
                } else {
                    const templateDivs = getTemplate('sessionCardTemplate').querySelectorAll('div')
                    templateDivs.forEach((templateElement) => {
                        switch (templateElement.className) {
                            case 'agenda-session-image': {
                                const otherImages = otherSpeakerImages(matchedSession.speakers)
                                if (otherImages.length > 0) {
                                    const imagesHolder = buildMuliSpeakerImageBlock(singleSpeakerImage(matchedSession.speakers), otherImages)
                                    templateElement.appendChild(imagesHolder)
                                } else {
                                    templateElement.appendChild(speakerImageCreator(singleSpeakerImage(matchedSession.speakers)))
                                }

                                break
                            }
                            case 'agenda-session-session-theme': {
                                templateElement.innerText = theme(matchedSession);
                                break;
                            }
                            case 'agenda-session-session-level': {
                                templateElement.innerText = level(matchedSession);
                                break;
                            }
                            case 'agenda-session-subtitle': {
                                templateElement.innerText = speakerSubtitle(matchedSession.speakers)
                                break;
                            }
                            case 'agenda-session-name': {
                                templateElement.innerText = multipleSpeakerNames(matchedSession.speakers)
                                break
                            }
                            case 'agenda-session-title': {
                                templateElement.innerText = title(matchedSession)
                                break
                            }
                        }

                        div.insertAdjacentElement('beforeend', templateElement)
                    })
                }
            }
        })

        addPopups()
        toggleUI()
        rotateImages()
    }

    eventData = await loadSessionizeData(eventId)
    if (!eventData) {
        return
    }

    const storedTitlePreference = localStorage.getItem("titlePreference");
    if (storedTitlePreference) {
        (document.getElementById("titlePreference") as HTMLSelectElement).value = storedTitlePreference;
    }

    parseEventData()

    const requestedSpeakerId = new URLSearchParams(window.location.search).get("currentSpeaker")
    if (requestedSpeakerId) {
        const speakerButton = document.querySelector(`div[data-slot-id="${requestedSpeakerId}"]`) as HTMLElement
        speakerButton.click()
    }

    (document.getElementById("titlePreference") as HTMLSelectElement).onchange = () => {
        parseEventData()

        localStorage.setItem("titlePreference", (document.getElementById("titlePreference") as HTMLSelectElement).value)
    }
}
