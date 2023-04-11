import express from "express";
import Container from "typedi";
import { ScrapingJobAdController } from "../controllers/scrapingJobAdController";
import ScrapingJobController from "../controllers/scrapingJobController";

const jobAdScrapingController = Container.get(ScrapingJobAdController);
const jobScrapingController = Container.get(ScrapingJobController);

export default (app: any) => {
    const router = express.Router();

    // TODO: these routes are to be protected with jwtAuth middleware
    router.post('/scrape-job-ads', async (req: any, res: any, next: any) => await jobAdScrapingController.scrapeJobAds(req, res));
    router.get('/scrape-jobs', async (req: any, res: any, next: any) => await jobScrapingController.scrapeJobs(req, res));
    router.post('/scrape-from-url', async (req: any, res: any, next: any) => await jobScrapingController.scrapeUrl(req, res));
    
    app.use(router);
}
