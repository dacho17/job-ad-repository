import { Inject, Service } from "typedi";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import IJobScraper from "./interfaces/IJobScraper";
import AdzunaScraper from "./jobScrapers/adzunaScraper";
import ArbeitNowScraper from "./jobScrapers/arbeitNowScraper";
import CareerBuilderScraper from "./jobScrapers/careerBuilderScraper";
import CareerJetScraper from "./jobScrapers/careerJetScraper";
import EuroJobsScraper from "./jobScrapers/euroJobsScraper";

@Service()
export default class JobScraperHelper {
    private adzunaScraper: AdzunaScraper;
    private arbeitNowScraper: ArbeitNowScraper;
    private careerBuilderScraper: CareerBuilderScraper;
    private careerJetScraper: CareerJetScraper;
    private euroJobScraper: EuroJobsScraper;

    constructor(
        @Inject() adzunaScraper: AdzunaScraper,
        @Inject() arbeitNowScraper: ArbeitNowScraper,
        @Inject() careerBuilderScraper: CareerBuilderScraper,
        @Inject() careerJetScraper: CareerJetScraper,
        @Inject() euroJobScraper: EuroJobsScraper,
    )
    {
        this.adzunaScraper = adzunaScraper;
        this.arbeitNowScraper = arbeitNowScraper;
        this.careerBuilderScraper = careerBuilderScraper;
        this.careerJetScraper = careerJetScraper;
        this.euroJobScraper = euroJobScraper;
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
            case JobAdSource.ARBEIT_NOW:
                return this.arbeitNowScraper;
            case JobAdSource.CAREER_BUILDER:
                return this.careerBuilderScraper;
            case JobAdSource.CAREER_JET:
                return this.careerJetScraper;
            case JobAdSource.EURO_JOBS:
                return this.euroJobScraper;
            default:
                return null;
        }
    }
}
