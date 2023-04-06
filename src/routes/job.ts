import express from "express";
import Container from "typedi";
import ParseController from "../controllers/parseController";
import ScrapingJobController from "../controllers/scrapingJobController";

const jobScrapingController = Container.get(ScrapingJobController);
const parseController = Container.get(ParseController);

export default (app: any) => {
    const router = express.Router();

    router.get('/get-jobs', async (req: any, res: any, next: any) => await jobScrapingController.getJobs(req, res));
    router.post('/parse-job', async (req: any, res: any, next: any) => await parseController.scrapeAndParseJobFromUrl(req, res))
    app.use(router);
}
