import { Inject, Service } from "typedi";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import IJobScraper from "./interfaces/IJobScraper";
import AdzunaScraper from "./jobScrapers/adzunaScraper";

@Service()
export default class JobScraperHelper {
    private adzunaScraper: AdzunaScraper;

    constructor(
        @Inject() adzunaScraper: AdzunaScraper
    )
    {
        this.adzunaScraper = adzunaScraper;
    }

    /**
   * @description Function that accepts jobAdSource and returns the scraper to scrape the job from that source.
   * If no scraper is connected to the provided jobAdSource, the function returns null. 
   * @param {JobAdSource} jobAdSouce
   * @returns {IJobScraper | null}
   */
    public getScraperFor(jobAdSouce: JobAdSource): IJobScraper | null {
        switch (jobAdSouce) {
            case JobAdSource.ADZUNA:
                return this.adzunaScraper;
            default:
                return null;
        }
    }
}
