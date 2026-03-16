import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GamePrompt {
    prompt: string;
    gameType: string;
}
export type Time = bigint;
export interface SpecialDate {
    title: string;
    date: Time;
    description: string;
    emoji: string;
    category: string;
}
export interface Moment {
    id: bigint;
    date: Time;
    caption: string;
    photo: ExternalBlob;
}
export interface Message {
    sender: string;
    message: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGamePrompt(prompt: string, gameType: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMoment(caption: string, date: Time, photo: ExternalBlob): Promise<bigint>;
    createSpecialDate(title: string, date: Time, description: string, emoji: string, category: string): Promise<bigint>;
    deleteMoment(id: bigint): Promise<void>;
    deleteSpecialDate(id: bigint): Promise<void>;
    getAllMoments(): Promise<Array<Moment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLoveNote(): Promise<string>;
    getMessages(): Promise<Array<Message>>;
    getRandomPrompt(gameType: string): Promise<GamePrompt | null>;
    getUpcomingSpecialDates(): Promise<Array<SpecialDate>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedGamePrompts(): Promise<void>;
    sendMessage(sender: string, message: string): Promise<void>;
    updateLoveNote(note: string): Promise<void>;
    updateMoment(id: bigint, caption: string, date: Time): Promise<void>;
    updateSpecialDate(id: bigint, title: string, date: Time, description: string, emoji: string, category: string): Promise<void>;
}
