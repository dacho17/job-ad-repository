import Constants from "../helpers/constants";
import { Response } from "express";
import ResponseObject from "../helpers/dtos/responseObject";

export class BaseController {
     /**
   * @description Function which responds with the errorMessage.
   * @param {string} errorMessage @param {any} res
   */
    protected respondToInvalidRequest(errorMessage: string, res: Response) {
        res.status(Constants.HTTP_BAD_REQUEST).json({
            data: null,
            message: errorMessage
        } as ResponseObject<null>);
    }
}