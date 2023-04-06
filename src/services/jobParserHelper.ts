import { Inject, InjectMany, Service } from "typedi";
import IJobParser from "../dataLayer/interfaces/IJobParser";
import ArbeitNowParser from "../dataLayer/parsers/arbeitNowJobParser";
import CareerBuilderJobParser from "../dataLayer/parsers/careerBuilderJobParser";
import { JobAdSource } from "../helpers/enums/jobAdSource";

@Service()
export default class JobParserHelper {
    private arbeitNowParser: ArbeitNowParser;
    private careerBuilderParser: CareerBuilderJobParser;

    constructor(
        @Inject() arbeitNowParser: ArbeitNowParser,
        @Inject() careerBuilderParser: CareerBuilderJobParser,
    ) {
        this.arbeitNowParser = arbeitNowParser;
        this.careerBuilderParser = careerBuilderParser;
    }

    /**
   * @description Function which returns a jobParser based on the JobAdSource value.
   * @param {JobAdSource} adSource
   * @returns {IJobParser | null}
   */
    public getParserFor(jobAdSource: JobAdSource): IJobParser | null {
        switch (jobAdSource) {
            // case JobAdSource.ADZUNA:
            //     return this.adzunaScraper;
            case JobAdSource.ARBEIT_NOW:
                return this.arbeitNowParser;
            case JobAdSource.CAREER_BUILDER:
                return this.careerBuilderParser;
            // case JobAdSource.CAREER_JET:
            //     return this.careerJetScraper;
            // case JobAdSource.CV_LIBRARY:
            //     return this.cvLibraryScraper;
            // case JobAdSource.EURO_JOBS:
            //     return this.euroJobScraper;
            // case JobAdSource.EURO_ENGINEER_JOBS:
            // case JobAdSource.EURO_SCIENCE_JOBS:
            // case JobAdSource.EURO_SPACE_CAREERS:
            // case JobAdSource.EURO_TECH_JOBS:
            //     return this.euroJobSitesScraper;
            // case JobAdSource.GRADUATELAND:
            //     return this.graduatelandScraper;
            // case JobAdSource.JOB_FLUENT:
            //     return this.jobFluentScraper;
            // case JobAdSource.LINKEDIN:
            //     return this.linkedinScraper;
            // case JobAdSource.NO_FLUFF_JOBS:
            //     return this.noFluffScraper;
            // case JobAdSource.QREER:
            //     return this.qreerScraper;
            // case JobAdSource.SIMPLY_HIRED:
            //     return this.simplyHiredScraper;
            // case JobAdSource.TYBA:
            //     return this.tybaScraper;
            // case JobAdSource.WE_WORK_REMOTELY:
            //     return this.weWorkRemotely;
            default:
                return null;
        }
    }
}
