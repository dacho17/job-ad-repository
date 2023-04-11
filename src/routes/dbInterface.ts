
import express from "express";
import Container from "typedi";
import DbInterfaceController from "../controllers/dbInterfaceController";

const dbInterfaceController = Container.get(DbInterfaceController);

export default (app: any) => {
    const router = express.Router();

    router.get('/get-jobs', async (req: any, res: any, next: any) => await dbInterfaceController.getJobs(req, res));
    
    app.use(router);
}
