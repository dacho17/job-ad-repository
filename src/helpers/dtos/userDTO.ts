import { UserRole } from "../enums/userRole";

export default class UserDTO {
    username: string;
    role: UserRole;
    jwt: string;
}
