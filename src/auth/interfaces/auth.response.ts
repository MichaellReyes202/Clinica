import type { User } from "@/interfaces/User.interface";

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
