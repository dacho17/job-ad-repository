import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { BaseController } from "./baseController";
import db from "../database/db";
import { RequestValidator } from "../helpers/requestValidator";
import { ScrapingJobService } from "../services/scrapingJobService";
import Constants from '../helpers/constants';
import DbQueryError from "../helpers/errors/dbQueryError";
import ResponseObject from "../helpers/dtos/responseObject";
import JobDTO from "../helpers/dtos/jobDTO";
import UnrecognizedDataError from "../helpers/errors/unrecognizedData";

@Service()
export default class DbInterfaceController extends BaseController {
    @Inject()
    private requestValidator: RequestValidator;
    @Inject()
    private scrapingJobService: ScrapingJobService;
    
    /**
   * @description This function is an entry point for returning the jobs from repository to the client.
   * @param req @param res
   * @returns {JobDTO[]} Returns a list of jobDTOs.
   */
    public async getJobs(req: Request, res: Response) {
        const [_, getJobsReq, __] = this.requestValidator.validateGetJobsRequest(req.query);
        let data, httpCode, errMsg;
        try {
            data = await this.scrapingJobService.getJobsPaginated(getJobsReq!);
            httpCode = Constants.HTTP_OK;
        } catch (err) {
            if (err instanceof DbQueryError) {
                httpCode = Constants.HTTP_SERVER_ERROR;
                errMsg = (err as DbQueryError).getMessage();
            } else {
                httpCode = Constants.HTTP_SERVER_ERROR;
                errMsg = Constants.UNKNOWN_ERROR_OCCURED;
            }
        }

        res.status(httpCode).json({
            data: data,
            error: errMsg
        } as ResponseObject<JobDTO[] | null>);
    }

     /**
   * @description This function is an entry point for returning the job based on id from repository to the client.
   * @param req @param res
   * @returns {JobDTO} Returns the matching jobDTO.
   */
     public async getJobById(req: Request, res: Response) {
        const jobId = req.body.jobId;
        console.log(`body=${JSON.stringify(req.body)}`);
        console.log(`JobId=${jobId}`);
        if (isNaN(jobId) || jobId < 1) {
            this.respondToInvalidRequest('Error in input data', res);
        } else {
            let data, httpCode, errMsg;
            try {
                data = await this.scrapingJobService.getJobById(jobId);
                httpCode = Constants.HTTP_OK;
            } catch (err) {
                if (err instanceof DbQueryError) {
                    httpCode = Constants.HTTP_SERVER_ERROR;
                    errMsg = (err as DbQueryError).getMessage();
                } else if (err instanceof UnrecognizedDataError) {
                    httpCode = Constants.HTTP_BAD_REQUEST;
                    errMsg = (err as UnrecognizedDataError).getMessage();
                }  
                else {
                    httpCode = Constants.HTTP_SERVER_ERROR;
                    errMsg = Constants.UNKNOWN_ERROR_OCCURED;
                }
            }

            res.status(httpCode).json({
                data: data,
                error: errMsg
            } as ResponseObject<JobDTO | null>);
        }
    }
}
