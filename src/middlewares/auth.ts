import dotenv from 'dotenv';
dotenv.config();
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import constants from '../helpers/constants';
import ResponseObject from '../helpers/dtos/responseObject';

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
export default function (req: Request, res: Response, next: NextFunction) {
    const token =
        req.body.jwt || req.query.jwt || req.headers["x-access-token"];

    if (!token) {
        console.log(`An attempt was made to access resources which require authentication with jwt.`);
        res.status(constants.HTTP_UNAUTHORIZED).json({
            data: null,
            error: constants.LOGIN_REQUIRED
        } as ResponseObject<null>);
    } else {
        try {
            const decodedUsername = jwt.verify(token, process.env.JWT_SECRET!);
            req.body.username = decodedUsername;
            req.body.userJWT = token;
            console.log(`DecodedUsername value is =${decodedUsername}`);
            next();
        } catch (err) {
            console.log(`An attempt was made to authenticate with the invalid jwt. - [${err}]`);
            res.status(constants.HTTP_UNAUTHORIZED).json({
                data: null,
                error: constants.LOGIN_REQUIRED
            } as ResponseObject<null>);
        }
    }
};
