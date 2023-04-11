import setScrapingRoutes from './scrape';
import setParsingRoutes from './parse';
import setDbInterfaceRoutes from './dbInterface';
import setAuthRoutes from './auth';

export default (app: any) => {
    setAuthRoutes(app);
    setScrapingRoutes(app);
    setParsingRoutes(app);
    setDbInterfaceRoutes(app);
}
