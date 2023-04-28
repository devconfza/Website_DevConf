interface SessionizeSession {
    id: string;
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date;
    isServiceSession: boolean;
    isPlenumSession: boolean;
    speakers: string[];
    categoryItems: number[];
    questionAnswers: any[];
    roomId: number;
}

interface SessionizeLink {
    title: string;
    url: string;
    linkType: string;
}

export interface SessionizeSpeaker {
    id: string;
    firstName: string;
    lastName: string;
    bio: string;
    tagLine: string;
    profilePicture: string;
    isTopSpeaker: boolean;
    links: SessionizeLink[];
    sessions: number[];
    fullName: string;
    categoryItems: any[];
    questionAnswers: any[];
}

interface SessionizeItem {
    id: number;
    name: string;
    sort: number;
}

interface SessionizeCategory {
    id: number;
    title: string;
    items: SessionizeItem[];
    sort: number;
}

interface SessionizeRoom {
    id: number;
    name: string;
    sort: number;
}

export interface SessionizeEvent {
    sessions: SessionizeSession[];
    speakers: SessionizeSpeaker[];
    questions: any[];
    categories: SessionizeCategory[];
    rooms: SessionizeRoom[];
}

const loadStoredData = (id: string): SessionizeEvent | undefined => {
    const sessionData = window.sessionStorage.getItem(`event${id}`)
    if (sessionData) {
        try {
           return JSON.parse(sessionData) as SessionizeEvent
        } catch {
            alert('Oh no! Something has gone horribly wrong. Please close and reopen your browser and try again.')
            return undefined
        }
    }
    
    return undefined
}

export const loadSessionizeData = async (eventId: string): Promise<SessionizeEvent | undefined> => {
    let result: SessionizeEvent | undefined

    const existingData = loadStoredData(eventId)
    if (existingData) {
        return existingData
    }

    if (navigator.onLine) {
        try {
            const response = await fetch(`https://sessionize.com/api/v2/${eventId}/view/all`)
            if (response.ok) {
                result = await response.json() as SessionizeEvent
                window.sessionStorage.setItem(`event${eventId}`, JSON.stringify(result))
            }
        } catch {
            alert('Oh no! Something has gone horribly wrong. Please reload your browser and try again.')
        }
    }

    return result
}
