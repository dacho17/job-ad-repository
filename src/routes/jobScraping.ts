import express from "express";
import Container from "typedi";
import { ScrapingJobAdController } from "../controllers/scrapingJobAdController";

const jobAdScrapingController = Container.get(ScrapingJobAdController);

export default (app: any) => {
    const router = express.Router();

    router.post('/route-one', async (req: any, res: any, next: any) => await jobAdScrapingController.scrapeJobAds(req, res));
    app.use(router);
}
