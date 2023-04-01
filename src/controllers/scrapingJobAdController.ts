import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { ScrapingJobAdService } from '../services/scrapingJobAdService';
import { RequestValidator } from '../helpers/requestValidator';
import { BaseController } from './baseController';

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
        this.respondIfRequestInvalid(isValid, errorMessage, res);

        const result = await this.scrapingJobAdService.scrapeJobAdsOnAllWebsites(data!);
        res.status(200).json({
            numberOfScrapedAds: result
        });
    }
}
