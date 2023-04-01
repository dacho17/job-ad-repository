import express from "express";
import Container from "typedi";
import { ScrapingJobAdController } from "../controllers/scrapingJobAdController";
import ScrapingJobController from "../controllers/scrapingJobController";

const jobAdScrapingController = Container.get(ScrapingJobAdController);
const jobScrapingController = Container.get(ScrapingJobController);

export default (app: any) => {
    const router = express.Router();

    router.post('/scrape-job-ads', async (req: any, res: any, next: any) => await jobAdScrapingController.scrapeJobAds(req, res));
    router.get('/scrape-jobs', async (req: any, res: any, next: any) => await jobScrapingController.scrapeJobs(req, res));
    app.use(router);
}
