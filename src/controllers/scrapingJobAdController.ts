import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { ScrapingJobAdService } from '../services/scrapingJobAdService';
import { RequestValidator } from '../helpers/requestValidator';
import { BaseController } from './baseController';
import ResponseObject from '../helpers/dtos/responseObject';
import constants from '../helpers/constants';
import DbQueryError from '../helpers/errors/dbQueryError';
import { JobAdScrapingTask } from '../database/models/jobAdScrapingTask';
import JobAdScrapingTaskDTO from '../helpers/dtos/jobAdScrapingTaskDTO';

@Service()
export class ScrapingJobAdController extends BaseController {
    @Inject()
    private scrapingJobAdService: ScrapingJobAdService;
    @Inject()
    private requestValidator: RequestValidator;

    /**
   * @description This function is an entry point for scraping JobAds across the webistes.
   * @param req @param res
   * @returns {number} Returns the number of stored JobAds
   */
    public async scrapeJobAds(req: any, res: any) {
        const [isValid, data, errorMessage] = this.requestValidator.validateScrapeJobAdsForm(req.body.jobTitle, req.body.numberOfAds, req.body.location, req.body.workFromHome);
        if (!isValid) {
            this.respondToInvalidRequest(errorMessage, res);
        } else {
            let succMsg, errMsg, httpCode;
            const taskInitiatorJwt = this.getLoggedInUserJWT(req);
            try {
                await this.scrapingJobAdService.scrapeJobAdsOnAllWebsites(data!, taskInitiatorJwt);
                succMsg = constants.TASK_SUCCESSFULLY_STARTED
                httpCode = constants.HTTP_OK;
            } catch (err) {
                if (err instanceof DbQueryError) {
                    errMsg = (err as DbQueryError).getMessage();
                    httpCode = constants.HTTP_SERVER_ERROR;
                } else {
                    errMsg = constants.UNKNOWN_ERROR_OCCURED;
                    httpCode = constants.HTTP_SERVER_ERROR;
                }
            }
            res.status(httpCode).json({
                data: succMsg,
                errorMessage: errMsg
            } as ResponseObject<string>);
        }
    }

    /**
   * @description This function is an entry point for fetching jobAdScrapingTasks.
   * @param req @param res
   * @returns {number} Returns the offset list of jobAdScrapingTasks
   */
    public async getJobAdScrapingTasks(req: any, res: any) {
        const taskListOffset = req.body.offset;
        if (isNaN(taskListOffset) || taskListOffset < 0) {
            this.respondToInvalidRequest(constants.INVALID_PARAMETERS, res);
        } else {
            let data, errorMsg, httpCode;
            try {
                data = await this.scrapingJobAdService.getJobAdScrapingTasks(taskListOffset, this.getLoggedInUserJWT(req));
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
            } as ResponseObject<JobAdScrapingTaskDTO[] | null>); 
        }
    }
}
