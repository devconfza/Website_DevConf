export module Sessionize {
    export interface Session {
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

    export interface Link {
        title: string;
        url: string;
        linkType: string;
    }

    export interface Speaker {
        id: string;
        firstName: string;
        lastName: string;
        bio: string;
        tagLine: string;
        profilePicture: string;
        isTopSpeaker: boolean;
        links: Link[];
        sessions: number[];
        fullName: string;
        categoryItems: any[];
        questionAnswers: any[];
    }

    export interface Item {
        id: number;
        name: string;
        sort: number;
    }

    export interface Category {
        id: number;
        title: string;
        items: Item[];
        sort: number;
    }

    export interface Room {
        id: number;
        name: string;
        sort: number;
    }

    export interface Event {
        sessions: Session[];
        speakers: Speaker[];
        questions: any[];
        categories: Category[];
        rooms: Room[];
    }
}
