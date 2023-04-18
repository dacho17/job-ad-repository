import { NextFunction, Request, Response } from "express";
import constants from "../helpers/constants";
import ResponseObject from "../helpers/dtos/responseObject";
import { UserRole } from "../helpers/enums/userRole";

/**
 * @description Function which authorizes currently logged in user and responds to the client if the authorization fails.
 * @param {any} req 
 * @param {any} res
 * @param {UserRole} userRole
 */
export default async function (req: Request, res: Response, next: NextFunction) {
    console.log(`User role is ${req.body.userRole}`);
    if (req.body.userRole !== UserRole.ADMIN) {
        res.status(constants.HTTP_FORBIDDEN).json({
            data: null,
            error: constants.UNAUTHORIZED_TO_PERFROM_OPERATION
        } as ResponseObject<null>);
    } else {
        next();
    }
}
