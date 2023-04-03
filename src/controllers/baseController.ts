import Constants from "../helpers/constants";

export class BaseController {
     /**
   * @description Function which responds with the errorMessage.
   * @param {string} errorMessage @param {any} res
   */
    protected respondToInvalidRequest(errorMessage: string, res: any) {
        res.status(Constants.BAD_REQUEST).json({
            message: errorMessage
        });
    }
}