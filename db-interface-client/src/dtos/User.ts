import { UserRole } from "../enums/userRole";

export default interface User {
    username: string;
    password?: string;
    role: UserRole;
    jwt: string;
}
