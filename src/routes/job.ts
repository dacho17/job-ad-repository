import express from "express";
import Container from "typedi";
import ScrapingJobController from "../controllers/scrapingJobController";

const jobScrapingController = Container.get(ScrapingJobController);

export default (app: any) => {
    const router = express.Router();

    router.get('/get-jobs', async (req: any, res: any, next: any) => await jobScrapingController.getJobs(req, res));
    app.use(router);
}
