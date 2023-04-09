import { Inject, InjectMany, Service } from "typedi";
import IJobParser from "../dataLayer/interfaces/IJobParser";
import ArbeitNowParser from "../dataLayer/parsers/arbeitNowJobParser";
import CareerBuilderJobParser from "../dataLayer/parsers/careerBuilderJobParser";
import CareerJetJobParser from "../dataLayer/parsers/careerJetJobParser";
import CommonJobParser from "../dataLayer/parsers/commonParser";
import CvLibraryJobParser from "../dataLayer/parsers/cvLibraryJobParser";
import SimplyhiredJobParser from "../dataLayer/parsers/simplyHiredJobParser";
import WeWorkRemotelyJobParser from "../dataLayer/parsers/weWorkRemotelyJobParser";
import { JobAdSource } from "../helpers/enums/jobAdSource";

@Service()
export default class JobParserHelper {
    private commonParser: CommonJobParser;
    private arbeitNowParser: ArbeitNowParser;
    private careerBuilderParser: CareerBuilderJobParser;
    private careerJetParser: CareerJetJobParser;
    private cvLibraryParser: CvLibraryJobParser;
    private simplyHiredParser: SimplyhiredJobParser;
    private weWorkRemotelyParser: WeWorkRemotelyJobParser;

    constructor(
        @Inject() commonParser: CommonJobParser,
        @Inject() arbeitNowParser: ArbeitNowParser,
        @Inject() careerBuilderParser: CareerBuilderJobParser,
        @Inject() careerJetParser: CareerJetJobParser,
        @Inject() cvLibraryParser: CvLibraryJobParser,
        @Inject() simplyHiredParser: SimplyhiredJobParser,
        @Inject() weWorkRemotelyParser: WeWorkRemotelyJobParser,
    ) {
        this.commonParser = commonParser;
        this.arbeitNowParser = arbeitNowParser;
        this.careerBuilderParser = careerBuilderParser;
        this.careerJetParser = careerJetParser;
        this.cvLibraryParser = cvLibraryParser;
        this.simplyHiredParser = simplyHiredParser;
        this.weWorkRemotelyParser = weWorkRemotelyParser;
    }

    /**
   * @description Function which returns a jobParser based on the JobAdSource value.
   * @param {JobAdSource} adSource
   * @returns {IJobParser | null}
   */
    public getParserFor(jobAdSource: JobAdSource): IJobParser | null {
        switch (jobAdSource) {
            case JobAdSource.ARBEIT_NOW:
                return this.arbeitNowParser;
            case JobAdSource.CAREER_BUILDER:
                return this.careerBuilderParser;
            case JobAdSource.CAREER_JET:
                return this.careerJetParser;
            case JobAdSource.CV_LIBRARY:
                return this.cvLibraryParser;
            case JobAdSource.SIMPLY_HIRED:
                return this.simplyHiredParser;
            case JobAdSource.WE_WORK_REMOTELY:
                return this.weWorkRemotelyParser;            
            default:
                return this.commonParser;
        }
    }

    /**
   * @description Function which returns whether the job requires parsing based on its JobAdSource value.
   * @param {JobAdSource} adSource
   * @returns {boolean}
   */
    public requiresParsing(jobAdSource: JobAdSource): boolean {
        switch (jobAdSource) {
            case JobAdSource.ARBEIT_NOW:
            case JobAdSource.CAREER_BUILDER:
            case JobAdSource.CAREER_JET:
            case JobAdSource.CV_LIBRARY:
            case JobAdSource.SIMPLY_HIRED:
            case JobAdSource.WE_WORK_REMOTELY:
                return true;
            default:
                return false;
        }
    }
}
