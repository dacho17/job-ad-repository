import { Inject, Service } from "typedi";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import IJobScraper from "./interfaces/IJobScraper";
import AdzunaScraper from "./jobScrapers/adzunaScraper";
import ArbeitNowScraper from "./jobScrapers/arbeitNowScraper";
import CareerBuilderScraper from "./jobScrapers/careerBuilderScraper";
import CareerJetScraper from "./jobScrapers/careerJetScraper";
import EuroJobSitesScraper from "./jobScrapers/euroJobSitesScraper";
import EuroJobsScraper from "./jobScrapers/euroJobsScraper";
import GraduatelandScraper from "./jobScrapers/graduatelandScraper";
import JobFluentScraper from "./jobScrapers/jobFluentScraper";
import SimplyHiredScraper from "./jobScrapers/simplyHiredScraper";
import TybaScraper from "./jobScrapers/tybaScraper";
import WeWorkRemotelyScraper from "./jobScrapers/weWorkRemotelyScraper";

@Service()
export default class JobScraperHelper {
    private adzunaScraper: AdzunaScraper;
    private arbeitNowScraper: ArbeitNowScraper;
    private careerBuilderScraper: CareerBuilderScraper;
    private careerJetScraper: CareerJetScraper;
    private euroJobScraper: EuroJobsScraper;
    private euroJobSitesScraper: EuroJobSitesScraper;
    private graduatelandScraper: GraduatelandScraper;
    private jobFluentScraper: JobFluentScraper;

    private simplyHiredScraper: SimplyHiredScraper;

    private tybaScraper: TybaScraper;
    private weWorkRemotely: WeWorkRemotelyScraper;

    constructor(
        @Inject() adzunaScraper: AdzunaScraper,
        @Inject() arbeitNowScraper: ArbeitNowScraper,
        @Inject() careerBuilderScraper: CareerBuilderScraper,
        @Inject() careerJetScraper: CareerJetScraper,
        @Inject() euroJobScraper: EuroJobsScraper,
        @Inject() euroJobSitesScraper: EuroJobSitesScraper,
        @Inject() graduatelandScraper: GraduatelandScraper,
        @Inject() jobFluentScraper: JobFluentScraper,
        
        @Inject() simplyHiredScraper: SimplyHiredScraper,

        @Inject() tybaScraper: TybaScraper,
        @Inject() weWorkRemotely: WeWorkRemotelyScraper,
    )
    {
        this.adzunaScraper = adzunaScraper;
        this.arbeitNowScraper = arbeitNowScraper;
        this.careerBuilderScraper = careerBuilderScraper;
        this.careerJetScraper = careerJetScraper;
        this.euroJobScraper = euroJobScraper;
        this.euroJobSitesScraper = euroJobSitesScraper;
        this.graduatelandScraper = graduatelandScraper;
        this.jobFluentScraper = jobFluentScraper;

        this.simplyHiredScraper = simplyHiredScraper;

        this.tybaScraper = tybaScraper;
        this.weWorkRemotely = weWorkRemotely;
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
            case JobAdSource.EURO_ENGINEER_JOBS:
            case JobAdSource.EURO_SCIENCE_JOBS:
            case JobAdSource.EURO_SPACE_CAREERS:
            case JobAdSource.EURO_TECH_JOBS:
                return this.euroJobSitesScraper;
            case JobAdSource.GRADUATELAND:
                return this.graduatelandScraper;
            case JobAdSource.JOB_FLUENT:
                return this.jobFluentScraper;

            case JobAdSource.SIMPLY_HIRED:
                return this.simplyHiredScraper;

            case JobAdSource.TYBA:
                return this.tybaScraper;
            case JobAdSource.WE_WORK_REMOTELY:
                return this.weWorkRemotely;
            default:
                return null;
        }
    }
}
