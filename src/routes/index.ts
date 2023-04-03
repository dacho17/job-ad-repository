import setJobScrapingRoutes from '../routes/jobScraping';
import setJobRoutes from '../routes/job';

export default (app: any) => {
    setJobScrapingRoutes(app);
    setJobRoutes(app);
}
