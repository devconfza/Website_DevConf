export module Sessionize {

    export interface Session {
        id: string;
        title: string;
        description: string;
        startsAt: string;
        endsAt: string;
        isServiceSession: boolean;
        isPlenumSession: boolean;
        speakers: string[];
        categoryItems: any[];
        questionAnswers: any[];
        roomId: number;
    }

    export interface Speaker {
        id: string;
        firstName: string;
        lastName: string;
        bio: string;
        tagLine: string;
        profilePicture: string;
        isTopSpeaker: boolean;
        links: any[];
        sessions: number[];
        fullName: string;
        categoryItems: any[];
        questionAnswers: any[];
    }

    export interface Room {
        id: number;
        name: string;
        sort: number;
    }

    export interface Event {
        sessions: Session[];
        speakers: Speaker[];
        rooms: Room[];
    }

}

