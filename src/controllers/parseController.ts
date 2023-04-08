import { Inject, Service } from "typedi";
import constants from "../helpers/constants";
import { JobAdDTO } from "../helpers/dtos/jobAdDTO";
import JobDTO from "../helpers/dtos/jobDTO";
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
    public async scrapeAndParseJobFromUrl(req: any, res: any) {
        const isUrlValid = this.utils.validateUrl(req.body.url);
        if (!isUrlValid) {
            this.respondToInvalidRequest(constants.URL_INVALID, res);
        } else {
            const jobDTO = await this.jobParserService.scrapeAndParseJobFromUrl(req.body.url.trim())
            res.status(200).json({scrapedJob: jobDTO});
        }
    }

    /**
   * @description This function is an entry point for parsing unparsed Jobs in the database.
   * @param req @param res
   * @returns {[number, number]} Returns a pair of numbers. The number of stored Jobs and the number of unsuccessfully scraped/stored jobs.
   */
    public async parseJobs(req: any, res: any) {
        const [numberOfJobsScraped, numberOfJobsUnscraped] = await this.jobParserService.fetchAndParseUnparsedJobs();
        res.status(200).json({
            scrapedJobs: numberOfJobsScraped,
            unscrapedJobs: numberOfJobsUnscraped
        });
    }
}
