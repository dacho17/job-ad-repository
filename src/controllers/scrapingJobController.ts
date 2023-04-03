import { Inject, Service } from "typedi";
import JobDTO from "../helpers/dtos/jobDTO";
import { RequestValidator } from "../helpers/requestValidator";
import { ScrapingJobService } from "../services/scrapingJobService";
import { BaseController } from "./baseController";

@Service()
export default class ScrapingJobController extends BaseController {
    @Inject()
    private scrapingJobService: ScrapingJobService;
    @Inject()
    private requestValidator: RequestValidator;

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
   * @description This function is an entry point for returning the jobs from repository to the client.
   * @param req @param res
   * @returns {JobDTO[]} Returns a list of jobDTOs.
   */
    public async getJobs(req: any, res: any) {
        // 
        console.log(`Attempt to getJobs with queryParams=${req.query.searchWord} ${req.query.batchSize} ${req.query.offset}!`);
        const [isValid, getJobsReq, errorMessage] = this.requestValidator.validateGetJobsRequest(req.query);
        if (!isValid) {
            this.respondToInvalidRequest(errorMessage, res);
        } else {
            try {
                const jobs = await this.scrapingJobService.getJobsPaginated(getJobsReq!);
                res.status(200).json({jobs: jobs});    
            } catch (exception) {
                res.status(500).json({message: 'an error occurred'});
            }
        }
    }
}
