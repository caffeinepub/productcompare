import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Variant {
    id: bigint;
    features: Array<Feature>;
    name: string;
    productId: bigint;
    price: number;
}
export interface Feature {
    value: string;
    name: string;
    included: boolean;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
}
export interface backendInterface {
    addProduct(name: string, description: string, category: string, imageUrl: string): Promise<Product>;
    addVariant(productId: bigint, name: string, price: number, features: Array<Feature>): Promise<Variant>;
    deleteProduct(id: bigint): Promise<void>;
    deleteVariant(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product>;
    getVariant(id: bigint): Promise<Variant>;
    getVariantsByProductId(productId: bigint): Promise<Array<Variant>>;
    seedData(): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, category: string, imageUrl: string): Promise<Product>;
    updateVariant(id: bigint, productId: bigint, name: string, price: number, features: Array<Feature>): Promise<Variant>;
}
