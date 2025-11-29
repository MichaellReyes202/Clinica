import type { User } from "@/interfaces/Users.response";

export interface AuthResponse {
    user: User;
    expiration: Date;
    token: string;
}
export interface Test {
    token: string;
    expiration: Date;
    user: User;
}
