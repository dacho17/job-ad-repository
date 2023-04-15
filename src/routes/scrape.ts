import express from "express";
import Container from "typedi";
import { ScrapingJobAdController } from "../controllers/scrapingJobAdController";
import ScrapingJobController from "../controllers/scrapingJobController";
import jwtAuth from '../middlewares/auth';

const jobAdScrapingController = Container.get(ScrapingJobAdController);
const jobScrapingController = Container.get(ScrapingJobController);



export default (app: any) => {
    const router = express.Router();

    router.post('/scrape-job-ads', jwtAuth, async (req: any, res: any, next: any) => await jobAdScrapingController.scrapeJobAds(req, res));
    router.post('/get-job-ad-scraping-tasks', jwtAuth, async (req: any, res: any, next: any) => await jobAdScrapingController.getJobAdScrapingTasks(req, res));

    router.get('/scrape-jobs', jwtAuth, async (req: any, res: any, next: any) => await jobScrapingController.scrapeJobs(req, res));
    router.post('/scrape-from-url', jwtAuth, async (req: any, res: any, next: any) => await jobScrapingController.scrapeUrl(req, res));
    router.post('/get-job-scraping-tasks', jwtAuth, async (req: any, res: any, next: any) => await jobScrapingController.getJobScrapingTasks(req, res));

    app.use(router);
}
