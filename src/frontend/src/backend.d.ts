import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Member {
    id: string;
    feeAmount: bigint;
    expiryDate: bigint;
    joiningDate: bigint;
    fullName: string;
    planDuration: bigint;
    paymentDate: bigint;
    phone: string;
}
export interface DashboardStats {
    expiringSoon: bigint;
    expiredMembers: bigint;
    totalMembers: bigint;
    activeMembers: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMember(id: string, fullName: string, phone: string, planDuration: bigint, feeAmount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMember(id: string): Promise<void>;
    getAllMembers(): Promise<Array<Member>>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMember(id: string): Promise<Member>;
    isCallerAdmin(): Promise<boolean>;
    updateMember(updates: Member): Promise<void>;
}
