import { JobAdDTO } from "./jobAdDTO";

export class AdScraperTracker {
    nOfScrapedAds: number;
    scrapedAds: JobAdDTO[];
    url?: string;
    currentPage: number;
}
