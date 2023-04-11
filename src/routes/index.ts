import setScrapingRoutes from './scrape';
import setParsingRoutes from './parse';
import setDbInterfaceRoutes from './dbInterface';

export default (app: any) => {
    setScrapingRoutes(app);
    setParsingRoutes(app);
    setDbInterfaceRoutes(app);
}
