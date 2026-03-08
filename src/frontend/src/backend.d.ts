import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CarModel {
    id: bigint;
    tagline: string;
    name: string;
    description: string;
    imageUrl: string;
    category: CarCategory;
}
export interface Trim {
    id: bigint;
    features: Array<Feature>;
    name: string;
    carModelId: bigint;
    price: number;
    monthlyEMI: number;
}
export interface Feature {
    value: string;
    name: string;
    included: boolean;
}
export interface UserProfile {
    name: string;
}
export enum CarCategory {
    mpv = "mpv",
    suv = "suv",
    coupe = "coupe",
    sedan = "sedan",
    hatchback = "hatchback"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCarModel(name: string, description: string, category: CarCategory, tagline: string, imageUrl: string): Promise<CarModel>;
    addTrim(carModelId: bigint, name: string, price: number, monthlyEMI: number, features: Array<Feature>): Promise<Trim>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminIfNoneExists(): Promise<boolean>;
    deleteCarModel(id: bigint): Promise<void>;
    deleteTrim(id: bigint): Promise<void>;
    getAllCarModels(): Promise<Array<CarModel>>;
    getCallerPrincipal(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCarModel(id: bigint): Promise<CarModel>;
    getNextCarModelId(): Promise<bigint>;
    getNextTrimId(): Promise<bigint>;
    getTrim(id: bigint): Promise<Trim>;
    getTrimsByCarModelId(carModelId: bigint): Promise<Array<Trim>>;
    getTrimsByIds(trimIds: Array<bigint>): Promise<Array<Trim>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isSeeded(): Promise<boolean>;
    resetAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    updateCarModel(id: bigint, name: string, description: string, category: CarCategory, tagline: string, imageUrl: string): Promise<CarModel>;
    updateTrim(id: bigint, carModelId: bigint, name: string, price: number, monthlyEMI: number, features: Array<Feature>): Promise<Trim>;
}
