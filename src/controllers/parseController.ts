import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import constants from "../helpers/constants";
import JobDTO from "../helpers/dtos/jobDTO";
import ResponseObject from "../helpers/dtos/responseObject";
import DbQueryError from "../helpers/errors/dbQueryError";
import ParseError from "../helpers/errors/parseError";
import PuppeteerError from "../helpers/errors/puppeteerError";
import ScrapeError from "../helpers/errors/scrapeError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
import Utils from "../helpers/utils";
import JobParserService from "../services/jobParserService";
import { BaseController } from "./baseController";

@Service()
export default class ParseController extends BaseController {
    @Inject()
    private jobParserService: JobParserService;
    @Inject()
    private utils: Utils;

    /**
   * @description This function is an entry point for scraping and parsing a job from the given url.
   * @param req @param res
   */
    public async scrapeAndParseJobFromUrl(req: Request, res: Response) {
        const isUrlValid = this.utils.validateUrl(req.body.url);
        let data, httpCode, errorMsg;
        if (!isUrlValid) {
            this.respondToInvalidRequest(constants.URL_INVALID, res);
        } else {
            try {
                data = await this.jobParserService.scrapeAndParseJobFromUrl(req.body.url.trim());
                httpCode = constants.HTTP_OK;
                if (!data){
                    errorMsg = constants.JOB_UNAVAILABLE;
                    httpCode = constants.HTTP_SERVICE_UNAVAILABLE;
                }
            } catch (err) {
                console.log(`Error caught in scrapeAndParseJobFromUrl - [${err}]`);
                if (err instanceof ScrapeError) {
                    errorMsg = (err as ScrapeError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else if (err instanceof UnrecognizedDataError) {
                    errorMsg = (err as UnrecognizedDataError).getMessage();
                    httpCode = constants.HTTP_NOT_FOUND;
                } else if (err instanceof PuppeteerError) {
                    errorMsg = (err as PuppeteerError).getMessage();
                    httpCode = err.getHttpCode();
                } else if (err instanceof DbQueryError) {
                    errorMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else if (err instanceof ParseError) {
                    errorMsg = (err as ParseError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else {
                    errorMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }

                data = null;
            }

            res.status(httpCode).json({
                data: data,
                error: errorMsg
            } as ResponseObject<JobDTO | null>);
        }
    }

    /**
   * @description This function is an entry point for parsing unparsed Jobs in the database.
   * @param req @param res
   * @returns {[number, number]} Returns a pair of numbers. The number of stored Jobs and the number of unsuccessfully scraped/stored jobs.
   */
    public async parseJobs(req: any, res: any) {
        let data, errorMsg, httpCode;
        try {
            const [sucParsed, unsucParsed] = await this.jobParserService.fetchAndParseUnparsedJobs();
            data = {
                successfullyParsed: sucParsed,
                unsuccessfullyParsed: unsucParsed
            };
            httpCode = constants.HTTP_OK;
        } catch (err) {
            console.log(`Error caught in parseJobs - [${err}]`);
            if (err instanceof DbQueryError) {
                errorMsg = (err as DbQueryError).getMessage();
            }
            else errorMsg = constants.UNKNOWN_ERROR_OCCURED;
            httpCode = constants.HTTP_SERVER_ERROR;
            data = null;
        }

        res.status(httpCode).json({
            data: data,
            error: errorMsg
        } as ResponseObject<JobDTO | null>);
    }
}
