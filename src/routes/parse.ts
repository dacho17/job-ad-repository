import express from "express";
import Container from "typedi";
import ParseController from "../controllers/parseController";
import jwtAuth from "../middlewares/auth";

const parseController = Container.get(ParseController);

export default (app: any) => {
    const router = express.Router();

    // TODO: both these routes are to be protected with jwtAuth middleware
    router.post('/parse-job', async (req: any, res: any, next: any) => await parseController.scrapeAndParseJobFromUrl(req, res))
    router.get('/parse-jobs', async (req: any, res: any, next: any) => await parseController.parseJobs(req, res))

    app.use(router);
}
