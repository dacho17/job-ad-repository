import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import setRoutes from '../routes/index';

// About master-worker arch: https://www.arubacloud.com/tutorial/how-to-use-cluster-to-increase-node-js-performance.aspx
export default class ServerCluster {
    private port: string = process.env.PORT || '1700';
    private host: string = process.env.HOST || 'localhost';
    private env: string = process.env.ENV!;

    public run() {
        if (cluster.isPrimary) {
            const cpuCount = os.cpus().length;
            for (let i = 0; i < 2; i++) {    // NOTE: due to free tier, cpuConunt is not used. 2 Workers are used
                cluster.fork();
            }

            cluster.on('online', function (worker) {
                console.log('Worker ' + worker.process.pid + ' is online');
            });

            cluster.on('exit', function (worker, code, signal) {
                console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);

                console.log('Starting a new worker');
                cluster.fork();
            });
        } else {
            const app = this.configureServer();

            app.listen(this.port, () => {
                // logger.info(`Server is listening at ${host}:${port} in env=${env}`);
                console.log(`Process ${process.pid} is acting as a server and is listening at ${this.host}:${this.port} in env=${this.env}`);
            });
        }
    }

    private configureServer() {
        const app = express();
    
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(cookieParser());
    
        app.use((req: any, res: any, next: any) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-access-token');
            next();
        });
        
        setRoutes(app);
        return app;
    }
}
