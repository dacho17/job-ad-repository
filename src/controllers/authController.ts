import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import constants from "../helpers/constants";
import ResponseObject from "../helpers/dtos/responseObject";
import UserDTO from "../helpers/dtos/userDTO";
import DbQueryError from "../helpers/errors/dbQueryError";
import UniqueDataError from "../helpers/errors/uniqueDataError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
import { RequestValidator } from "../helpers/requestValidator";
import AuthService from "../services/authService";
import { BaseController } from "./baseController";

@Service()
export default class AuthController extends BaseController {
    @Inject()
    private requestValidator: RequestValidator;
    @Inject()
    private authService: AuthService;

    /**
   * @description This function is an entry point for registering a user. Returns UserDTO object in the ResponseObject.
   * @param req @param res
   */
    public async registerUser(req: Request, res: Response) {
        // validate request -> create a user f
        const [isValid, registrationForm, errorMessage] = await this.requestValidator.validateUserRegistration(req.body.username, req.body.password, req.body.role);
        if (!isValid) {
            this.respondToInvalidRequest(errorMessage, res);
        } else {
            let data, errorMsg, httpCode;
            try {
                data = await this.authService.registerNewUser(registrationForm!);
                httpCode = constants.HTTP_CREATED;
            } catch (err) {
                if (err instanceof UniqueDataError) {
                    errorMsg = (err as UniqueDataError).getMessage();
                    httpCode = constants.HTTP_CONFLICT;
                } else if (err instanceof DbQueryError) {
                    errorMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else {
                    console.log(`An unknown error occurred - [${err}]`);
                    errorMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }
            }

            res.status(httpCode).json({
                data: data,
                error: errorMsg
            } as ResponseObject<UserDTO | null>);
        }
    }

    /**
   * @description This function is an entry point for logging in a user. Returns a jwt token in the response object.
   * @param req @param res
   */
    public async loginUser(req: Request, res: Response) {
        const [isValid, loginForm, errorMessage] = await this.requestValidator.validateUserLogin(req.body.username, req.body.password);
        if (!isValid) {
            this.respondToInvalidRequest(errorMessage, res);
        } else {
            let data, errorMsg, httpCode;
            try {
                data = await this.authService.loginUser(loginForm!);
                httpCode = constants.HTTP_OK;
            } catch (err) {
                if (err instanceof UnrecognizedDataError) {
                    errorMsg = (err as UnrecognizedDataError).getMessage();
                    httpCode = constants.HTTP_UNAUTHORIZED;
                } else if (err instanceof DbQueryError) {
                    errorMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else {
                    console.log(`An unknown error occurred - [${err}]`);
                    errorMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }
            }

            res.status(httpCode).json({
                data: data,
                error: errorMsg
            } as ResponseObject<UserDTO | null>);
        }       
    }

    /**
   * @description This function is an entry point for logging out a user. Returns a UserDTO object in the response object.
   * @param req @param res
   */
    public async logoutUser(req: Request, res: Response) {
        const jwtToken = req.body.userJWT;  // passed through auth middleware. There must be one
        const username = req.body.username;
        let data, errMsg, httpCode;
        if (!jwtToken || !username) {
            errMsg = constants.REQUIRED_INFORMATION_NOT_PROVIDED
            httpCode = constants.HTTP_BAD_REQUEST;
        } else {
            try {
                const hasLoggedOut = await this.authService.logoutUser(username);
                if (hasLoggedOut) {
                    data = constants.SUCCESSFULLY_LOGGED_OUT;
                    httpCode = constants.HTTP_OK;
                } else {
                    errMsg = constants.INVALID_PARAMETERS;
                    httpCode = constants.HTTP_BAD_REQUEST;
                }
            } catch (err) {
                if (err instanceof DbQueryError) {
                    errMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else if (err instanceof UnrecognizedDataError) {
                    errMsg = (err as UnrecognizedDataError).getMessage();
                    httpCode = constants.HTTP_BAD_REQUEST;
                } else {
                    console.log(`An unknown error occurred - [${err}]`);
                    errMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }
            }
        }

        res.status(httpCode).json({
            data: data,
            error: errMsg
        } as ResponseObject<string | null>);
    }
}
