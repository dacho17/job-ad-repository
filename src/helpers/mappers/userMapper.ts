import { Service } from "typedi";
import db from "../../database/db";
import { User } from "../../database/models/user";
import UserDTO from "../dtos/userDTO";
import UserRegistrationForm from "../dtos/userRegistrationForm";

@Service()
export default class UserMapper {

    public registrationFormToUserMAP(registrationForm: UserRegistrationForm) {
        return db.User.build({
            username: registrationForm.getUsername(),
            passwordEncoded: registrationForm.getPasswordEncoded(),
            role: registrationForm.getRole().valueOf()
        });
    }

    public toDTO(user: User) {
        return {
            username: user.username,
            role: user.role,
            jwt: user.jwtAuthToken,
        } as UserDTO;
    }

    // public toMAP(user: UserDTO) {
    //     return {
    //         username: user.username,
    //         role: user.role,
    //         jwtAuthToken: user.jwt,
    //     } as User;
    // }
}
