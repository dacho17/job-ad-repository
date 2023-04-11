import { UserRole } from "../enums/userRole";

export default class UserRegistrationForm {

    private username: string;
    private passwordEncoded: string;
    private role: UserRole;

    constructor(username: string, passwordEncoded: string, role: UserRole) {
        this.username = username;
        this.passwordEncoded = passwordEncoded;
        this.role = role;
    }

    public getUsername() {
        return this.username;
    }

    public getPasswordEncoded() {
        return this.passwordEncoded;
    }

    public getRole() {
        return this.role;
    }
}