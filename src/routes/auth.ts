import express from 'express';
import Container from 'typedi';
import AuthController from '../controllers/authController';

const authController = Container.get(AuthController);

export default (app: any) => {
    const router = express.Router();

    router.post('/register', async (req: any, res: any, next: any) => await authController.registerUser(req, res));    
    router.post('/login', async (req: any, res: any, next: any) => await authController.loginUser(req, res));

    app.use(router);
}
