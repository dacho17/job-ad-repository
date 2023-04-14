import express from 'express';
import Container from 'typedi';
import AuthController from '../controllers/authController';
import jwtAuth from '../middlewares/auth';

const authController = Container.get(AuthController);

export default (app: any) => {
    const router = express.Router();

    router.post('/register', async (req: any, res: any, next: any) => await authController.registerUser(req, res));    
    router.post('/login', async (req: any, res: any, next: any) => await authController.loginUser(req, res));
    router.post('/logout', jwtAuth, async (req: any, res: any, next: any) => await authController.logoutUser(req, res));

    app.use(router);
}
