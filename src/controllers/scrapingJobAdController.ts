import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { ScrapingJobAdService } from '../services/scrapingJobAdService';
import { RequestValidator } from '../helpers/requestValidator';
import { BaseController } from './baseController';
import ResponseObject from '../helpers/dtos/responseObject';
import constants from '../helpers/constants';

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
            const result = await this.scrapingJobAdService.scrapeJobAdsOnAllWebsites(data!);
            res.status(constants.HTTP_OK).json({
                data: {
                    numberOfScrapedAds: result
                },
                errorMessage: null
            } as ResponseObject<object>);
        }
    }
}
