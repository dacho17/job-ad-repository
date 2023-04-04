import { Inject, Service } from "typedi";
import constants from "../helpers/constants";
import JobDTO from "../helpers/dtos/jobDTO";
import { RequestValidator } from "../helpers/requestValidator";
import Utils from "../helpers/utils";
import { ScrapingJobService } from "../services/scrapingJobService";
import { BaseController } from "./baseController";

@Service()
export default class ScrapingJobController extends BaseController {
    @Inject()
    private scrapingJobService: ScrapingJobService;
    @Inject()
    private requestValidator: RequestValidator;
    @Inject()
    private utils: Utils;

    /**
   * @description This function is an entry point for scraping Jobs based on the jobAds stored so far.
   * @param req @param res
   * @returns {[number, number]} Returns a pair of numbers. The number of stored Jobs and the number of unsuccessfully scraped/stored jobs.
   */
    public async scrapeJobs(req: any, res: any) {
        const [numberOfJobsScraped, numberOfJobsUnscraped] = await this.scrapingJobService.scrapeJobs();
        res.status(200).json({
            scrapedJobs: numberOfJobsScraped,
            unscrapedJobs: numberOfJobsUnscraped
        });
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
            const jobDTO = await this.scrapingJobService.scrapeJobFromUrl(req.body.url.trim())
            res.status(200).json({scrapedJob: jobDTO});
        }
    }

    /**
   * @description This function is an entry point for returning the jobs from repository to the client.
   * @param req @param res
   * @returns {JobDTO[]} Returns a list of jobDTOs.
   */
    public async getJobs(req: any, res: any) {
        // 
        const [_, getJobsReq, __] = this.requestValidator.validateGetJobsRequest(req.query);
        console.log(`Attempt to getJobs with queryParams=${getJobsReq?.jobTitleSearchWord} ${getJobsReq?.companyNameSearchWord}!`);

        try {
            const jobs = await this.scrapingJobService.getJobsPaginated(getJobsReq!);
            res.status(200).json({jobs: jobs});    
        } catch (exception) {
            res.status(500).json({message: 'an error occurred'});
        }
    }
}
