export const getTemplate = (templateId: string) => ((document.getElementById(templateId) as HTMLTemplateElement)
    ?.cloneNode(true) as HTMLTemplateElement)
    ?.content

export const setText = (parent: Element, query: string, value: string) => {
    (parent.querySelector(query) as HTMLDivElement).innerText = value
}

export const addPopupHandler = (
    elementsToAddPopupTo: NodeListOf<HTMLDivElement>,
    popupContentBuilder: (div: HTMLDivElement) => Element | null,
    clickableClass?: string,
    unclickableClass?: string,
    onCloseHandler?: () => void,
    onOpenHandler?: (content: Element) => void,
) => {
    const closePopup = () => {
        document.querySelector('div.popupBackdrop')!.classList.add('popupBackdropHidden')
        // eslint-disable-next-line no-use-before-define
        document.removeEventListener('keydown', handleCloseKeyPress)
        const contentToRemove = document.querySelector('div[data-popup-content="yes"]')
        contentToRemove?.parentNode?.removeChild(contentToRemove)
        onCloseHandler?.call(this)
    }

    const handleCloseKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closePopup()
        }
    }

    const popupClose = document.querySelector('div.popupClose')! as HTMLDivElement
    popupClose.onclick = () => {
        closePopup()
    }

    const backdrop = document.querySelector('div.popupBackdropHidden')!
    backdrop.addEventListener('click', closePopup)

    elementsToAddPopupTo.forEach((div) => {
        const popupContent = popupContentBuilder(div)
        if (popupContent) {
            if (clickableClass) {
                div.classList.add(clickableClass)
            }

            div.onclick = () => {
                backdrop.classList.remove('popupBackdropHidden')
                document.addEventListener('keydown', handleCloseKeyPress)

                const popupContentStage = document.querySelector('div.popupContent')!
                popupContentStage.querySelectorAll('div.popupBio').forEach((value) => {
                    popupContentStage.removeChild(value)
                })

                popupContent.setAttribute('data-popup-content', 'yes')
                popupContentStage.insertAdjacentElement('beforeend', popupContent)
                onOpenHandler?.call(this, popupContentStage)
            }
        } else {
            if (unclickableClass) {
                div.classList.add(unclickableClass)
            }
        }
    })
}
