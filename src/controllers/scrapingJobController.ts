import { Inject, Service } from "typedi";
import { ScrapingJobService } from "../services/scrapingJobService";
import { BaseController } from "./baseController";

@Service()
export default class ScrapingJobController extends BaseController {
    @Inject()
    private scrapingJobService: ScrapingJobService;

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
}
