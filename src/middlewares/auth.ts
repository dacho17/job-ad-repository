import dotenv from 'dotenv';
dotenv.config();
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Container from 'typedi';
import constants from '../helpers/constants';
import ResponseObject from '../helpers/dtos/responseObject';
import AuthenticationError from '../helpers/errors/authenticationError';
import DbQueryError from '../helpers/errors/dbQueryError';
import UserRepository from '../repositories/userRepository';

/**
 * @description Middleware function protecting the routes.
 * The function checks whether jwt token is present in the request (body,queryParams, or x-access-token header).
 * If the jwt token is present, it is verfied. If the verification is successfull, the user is considered
 * authenticated.
 * @param {Request} req 
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {string}
 */
export default async function (req: Request, res: Response, next: NextFunction) {
    const token =
        req.body.jwt || req.query.jwt || req.headers["x-access-token"];

    if (!token) {
        console.log(`An attempt was made to access resources which require authentication with jwt.`);
        res.status(constants.HTTP_UNAUTHORIZED).json({
            data: null,
            error: constants.LOGIN_REQUIRED
        } as ResponseObject<null>);
    } else {
        const userRepo = Container.get(UserRepository);
        
        let errMsg;
        try {
            const decodedUsername = jwt.verify(token, process.env.JWT_SECRET!);
            let user;
            try {
                user = await userRepo.getByJWT(token);
            } catch (err) {
                console.log(`An error occurred while attempting to fetch the user with jwt=${token} from the db.`);
                throw new DbQueryError('Please log in to proceed.');
            }
            
            if (!user) {
                console.log(`An attempt was register to access a resource protected by authMiddleware.\n
                The user connected to the provided jwtToken=${token} was not found.`);
                throw new AuthenticationError('You are not logged in.');
            }

            req.body.username = user.username;
            req.body.userRole = user.role;
            req.body.userJWT = token;
            console.log(`DecodedUsername value is =${decodedUsername}`);
            next();
        } catch (err) {
            console.log(`An unsuccessful attempt was made to authenticate with the jwt=${token}. - [${err}]`);
            if (err instanceof AuthenticationError) {
                errMsg = err.getMessage();
            } else if (err instanceof DbQueryError) {
                errMsg = err.getMessage();
            } else {
                try {
                    await userRepo.markAsLoggedOut(token);
                } catch (err) {
                    console.log(`An error occurred while attempting to log out the user with token=${token} - [${err}]`);
                    errMsg = constants.ERROR_WHILE_PROCESSING_REQ;
                }
            }

            res.status(constants.HTTP_UNAUTHORIZED).json({
                data: null,
                error: constants.LOGIN_REQUIRED
            } as ResponseObject<null>);
        }
    }
};
