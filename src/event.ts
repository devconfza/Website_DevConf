import { addPopupHandler, getTemplate, setText } from './common'
import { SessionizeEvent, SessionizeSpeaker, loadSessionizeData } from './sessionize'

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

    const speakerSubtitle = (sessionSpeakers: Array<string>): string => {
        const speakers = getSpeakerInfo(sessionSpeakers)

        if (speakers.length === 1) {
            const speaker = speakers[0]
            let country = ''
            if (speaker.categoryItems.indexOf(204593) >= 0) {
                country = 'South Africa'
            } else {
                debugger
                country = speaker.questionAnswers.find(i => i.questionId === 59078)?.answerValue
            }

            let pronoun = ''
            if (speaker.categoryItems.indexOf(204689) >= 0) {
                pronoun = 'He/Him'
            }

            if (speaker.categoryItems.indexOf(204687) >= 0) {
                pronoun = 'She/Her'
            }

            if (speaker.categoryItems.indexOf(204688) >= 0) {
                pronoun = 'They/Them'
            }

            const seperator = seperatorSet[Math.floor(Math.random() * seperatorSet.length)]

            if (pronoun) {
                return `${pronoun} ${seperator} ${country}`
            } else {
                return country
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

                setText(bioContent, 'div.bio-title', matchedSession.title)
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
                            case 'agenda-session-subtitle': {
                                templateElement.innerText = speakerSubtitle(matchedSession.speakers)
                                break;
                            }
                            case 'agenda-session-name': {
                                templateElement.innerText = multipleSpeakerNames(matchedSession.speakers)
                                break
                            }
                            case 'agenda-session-title': {
                                templateElement.innerText = matchedSession.title
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

    parseEventData()

    const requestedSpeakerId = new URLSearchParams(window.location.search).get("currentSpeaker")
    if (requestedSpeakerId) {
        const speakerButton = document.querySelector(`div[data-slot-id="${requestedSpeakerId}"]`) as HTMLElement
        speakerButton.click()
    }
}
