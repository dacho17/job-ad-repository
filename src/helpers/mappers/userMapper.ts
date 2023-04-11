import { Service } from "typedi";
import db from "../../database/db";
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
}