import dotenv from 'dotenv';
dotenv.config();
import { Inject, Service } from "typedi";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserLoginForm from "../helpers/dtos/userLoginForm";
import UserRegistrationForm from "../helpers/dtos/userRegistrationForm";
import UniqueDataError from "../helpers/errors/uniqueDataError";
import UserMapper from "../helpers/mappers/userMapper";
import UserRepository from "../repositories/userRepository";
import { User } from "../database/models/user";
import DbQueryError from '../helpers/errors/dbQueryError';
import UnrecognizedDataError from '../helpers/errors/unrecognizedData';
import UserDTO from '../helpers/dtos/userDTO';

@Service()
export default class AuthService {
    @Inject()
    private userRepository: UserRepository;
    @Inject()
    private userMapper: UserMapper;

     /**
   * @description Function checks if the user with the requested username exists. If it does it throws a UniqueDataError.
   * If the user with the given username does not exist, it is created and a jwt is attached to the user.
   * Promise resolving to the DTO of the created user is returned.
   * @param {UserRegistrationForm} registrationForm
   * @returns {Promise<UserDTO>}
   */
    public async registerNewUser(registrationForm: UserRegistrationForm): Promise<UserDTO> {
        let existingUser;
        try {
            existingUser = await this.userRepository.getByUsername(registrationForm.getUsername());
        } catch (err) {
            console.log(`An error occurred while trying to fetch a user with username=${registrationForm.getUsername()} - [${err}]`);
            throw new DbQueryError('An error occurred while registering the new user.');
        }

        if (existingUser) {
            console.log(`Attempted to create a user with already existing username=${existingUser.username}`);
            throw new UniqueDataError('Unable to create a user with the provided username.');
        }

        const userToCreate = this.userMapper.registrationFormToUserMAP(registrationForm);
        const jwt = this.createJwtToken(userToCreate);
        userToCreate.jwtAuthToken = jwt;

        try {
            const newUser = await this.userRepository.create(userToCreate);
            const newUserDTO = this.userMapper.toDTO(newUser);
            return newUserDTO;
        } catch (err) {
            console.log(`An error occurred while trying to store the new user in the database username=${userToCreate.username} - [${err}]`);
            throw new DbQueryError('An error occurred while attempting to create a user.');
        }
    }

    /**
   * @description Function checks if the user with the requested username exists. If it does not, it throws a UnrecognizedDataError.
   * If the user with the given username does exist, the provided password is compared with the true one.
   * If the passwords match, the user is given jwt and updated in the database.
   * Promise resolving to the DTO of the created user is returned.
   * @param {UserLoginForm} loginForm
   * @returns {Promise<UserDTO>}
   */
    public async loginUser(loginForm: UserLoginForm): Promise<UserDTO> {
        let existingUser;
        try {
            existingUser = await this.userRepository.getByUsername(loginForm.getUsername());
        } catch (err) {
            console.log(`An error occurred while trying to fetch a user with username=${loginForm.getUsername()} - [${err}]`);
            throw new DbQueryError('An error occurred while logging in with the user .');
        }

        if (!existingUser) {
            console.log(`Attempted to login with a non- existing user. username=${loginForm.getUsername()}`);
            throw new UnrecognizedDataError('Unable to login with the provided credentials.');
        }
        
        if (!await this.comparePasswords(loginForm.getPassword(), existingUser.passwordEncoded)) {
            console.log(`The user with username=${existingUser.username} attempted to log in with an invalid password.`);
            // NOTE: As an extension, I can count how many unsuccessful attempts of login have been made and store this to the User table
            // NOTE: account can then be blocked, or user notified if the attempts reach a certain threshold
            throw new UnrecognizedDataError('Unable to login with the provided credentials.');
        }
        
        const jwt = this.createJwtToken(existingUser);
        existingUser.jwtAuthToken = jwt;
        try {
            const updatedUserMAP = await this.userRepository.update(existingUser);
            const updatedUser = this.userMapper.toDTO(updatedUserMAP);

            return updatedUser;
        } catch (err) {
            console.log(`An error occurred while trying to attach a jwt token on the user with username=${existingUser.username} - [${err}]`);
            throw new DbQueryError('An error occurred while trying to login the user.');
        }
    }


    /**
   * @description Function attempts to log out the user with the requested username.
   * If the user does not exist, an UnrecognizedDataError is thrown.
   * If the user with the given username does exist, their jwtToken is removed and they are considered to be logged out.
   * The return value is boolean depending on whether the user has been successfully logged out.
   * @param {string} username
   * @returns {Promise<boolean>}
   */
    public async logoutUser(username: string): Promise<boolean> {
        try {
            const hasLoggedOut = await this.userRepository.markAsLoggedOut(username);
            if (!hasLoggedOut) {
                console.log(`Attempted to log out the user with username = ${username}. The user has not been found`);
                throw new UnrecognizedDataError('An error occurred while attempting to log out');
            }
            return hasLoggedOut
        } catch (err) {
            if (err instanceof UnrecognizedDataError) {
                throw err;
            } else {
                console.log(`An error occurred while logging out the user with username=${username} - [${err}]`);
                throw new DbQueryError('An error occurred');
            }
        }
    }

    /**
   * @description Function creates a jwt token lasting 1 day, encoding the {username: user.username} payload.
   * @param {User} user
   * @returns {string}
   */
    private createJwtToken(user: User): string {
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET!,
            {
                expiresIn: "1d",
            }
        );

        return token;
    }

    /**
   * @description Function compares the password provided from the loginForm with the encodedPassword of the
   * user matched by the username.
   * @param {string} providedPassword
   * @param {string} truePasswordEncoded
   * @returns {Promise<boolean>}
   */
    private async comparePasswords(providedPassword: string, truePasswordEncoded: string): Promise<boolean> {
        const providedPassEncoded = await bcrypt.hash(providedPassword, 10);

        console.log(`ProvidedPassEncoded=${providedPassEncoded}, TruePassEncoded=${truePasswordEncoded}`);
        return await bcrypt.compare(providedPassword, truePasswordEncoded);
    }
}
