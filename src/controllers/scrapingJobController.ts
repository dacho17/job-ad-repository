import { Inject, Service } from "typedi";
import constants from "../helpers/constants";
import JobDTO from "../helpers/dtos/jobDTO";
import JobScrapingTaskDTO from "../helpers/dtos/jobScrapingTaskDTO";
import ResponseObject from "../helpers/dtos/responseObject";
import DbQueryError from "../helpers/errors/dbQueryError";
import PuppeteerError from "../helpers/errors/puppeteerError";
import ScrapeError from "../helpers/errors/scrapeError";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";
import Utils from "../helpers/utils";
import { ScrapingJobService } from "../services/scrapingJobService";
import { BaseController } from "./baseController";

@Service()
export default class ScrapingJobController extends BaseController {
    @Inject()
    private scrapingJobService: ScrapingJobService;
    @Inject()
    private utils: Utils;

    /**
   * @description This function is an entry point for scraping Jobs based on the jobAds stored so far.
   * @param req @param res
   * @returns {[number, number]} Returns a pair of numbers. The number of stored Jobs and the number of unsuccessfully scraped/stored jobs.
   */
    public async scrapeJobs(req: any, res: any) {
        const taskInitiatorId = this.getLoggedInUserJWT(req);
        let succMsg, errMsg, httpCode;
        try {
            // const [numberOfJobsScraped, numberOfJobsUnscraped] = 
            await this.scrapingJobService.scrapeJobs(taskInitiatorId);
            // data = {
            //     scrapedJobs: numberOfJobsScraped,
            //     unscrapedJobs: numberOfJobsUnscraped
            // }
            succMsg = constants.TASK_SUCCESSFULLY_STARTED;
            httpCode = constants.HTTP_OK;
        } catch (err) {
            if (err instanceof DbQueryError) {
                errMsg = err.getMessage();
                httpCode = constants.HTTP_SERVER_ERROR
            } else {
                errMsg = constants.UNKNOWN_ERROR_OCCURED;
                httpCode = constants.HTTP_SERVER_ERROR;
            }
        }
        
        res.status(httpCode).json({
            data: succMsg,
            error: errMsg
        } as ResponseObject<string>);
    }

    /**
   * @description This function is an entry point for scraping a job based on a passed url.
   * @param req @param res
   * @returns {[number, number]} Returns a scraped jobDTO.
   */
    public async scrapeUrl(req: any, res: any) {
        const isUrlValid = this.utils.validateUrl(req.body.url);
        if (!isUrlValid) {
            this.respondToInvalidRequest(constants.URL_INVALID, res);
        } else {
            let data, errorMsg, httpCode;
            try {
                data = await this.scrapingJobService.scrapeAndFetchJobFromUrl(req.body.url.trim());
                httpCode = constants.HTTP_OK;
                if (!data) {
                    errorMsg = `Job is not available to be scraped at the moment`;
                    httpCode = constants.HTTP_SERVICE_UNAVAILABLE;
                }
            } catch (err) {
                console.log(`Error caught in JobController.scrapeUrl - [${err}]`);
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
   * @description This function is an entry point for fetching jobScrapingTasks.
   * @param req @param res
   * @returns {number} Returns the offset list of jobScrapingTasks
   */
    public async getJobScrapingTasks(req: any, res: any) {
        const taskListOffset = req.body.offset;
        if (isNaN(taskListOffset) || taskListOffset < 0) {
            this.respondToInvalidRequest(constants.INVALID_PARAMETERS, res);
        } else {
            let data, errorMsg, httpCode;
            try {
                data = await this.scrapingJobService.getJobScrapingTasks(taskListOffset, this.getLoggedInUserJWT(req));
                httpCode = constants.HTTP_OK;
            } catch (err) {
                if (err instanceof DbQueryError) {
                    errorMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else {
                    errorMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }
            }

            res.status(httpCode).json({
                data: data,
                errorMsg: errorMsg
            } as ResponseObject<JobScrapingTaskDTO[] | null>); 
        }
    }
}
