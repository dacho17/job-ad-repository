import Constants from "../helpers/constants";

export class BaseController {
     /**
   * @description Function which responds with the errorMessage if the client's form sent in request for scraping job ads is invalid.
   * @param {boolean} isValid @param {string} errorMessage @param {any} res
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   */
    protected respondIfRequestInvalid(isValid: boolean, errorMessage: string, res: any) {
        if (!isValid) {
            res.status(Constants.BAD_REQUEST).json({
                message: errorMessage
            });
        }
    }
}