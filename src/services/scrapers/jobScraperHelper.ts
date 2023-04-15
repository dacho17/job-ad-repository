import { Inject, Service } from "typedi";
import db from "../../database/db";
import { Job } from "../../database/models/job";
import { JobAd } from "../../database/models/jobAd";
import JobDTO from "../../helpers/dtos/jobDTO";
import { JobAdSource } from "../../helpers/enums/jobAdSource";
import JobMapper from "../../helpers/mappers/jobMapper";
import Utils from "../../helpers/utils";
import OrganizationRepository from "../../repositories/organizationRepository";
import { ScrapingJobAdRepository } from "../../repositories/scrapingJobAdRepository";
import ScrapingJobRepository from "../../repositories/scrapingJobRepository";
import JobParserHelper from "../jobParserHelper";
import IJobScraper from "./interfaces/IJobScraper";
import AdzunaScraper from "./jobScrapers/adzunaScraper";
import ArbeitNowScraper from "./jobScrapers/arbeitNowScraper";
import CareerBuilderScraper from "./jobScrapers/careerBuilderScraper";
import CareerJetScraper from "./jobScrapers/careerJetScraper";
import CvLibraryScraper from "./jobScrapers/cvLibrary";
import EuroJobSitesScraper from "./jobScrapers/euroJobSitesScraper";
import EuroJobsScraper from "./jobScrapers/euroJobsScraper";
import GraduatelandScraper from "./jobScrapers/graduatelandScraper";
import JobFluentScraper from "./jobScrapers/jobFluentScraper";
import LinkedInScraper from "./jobScrapers/linkedinScraper";
import NoFluffScraper from "./jobScrapers/noFluffScraper";
import QreerScraper from "./jobScrapers/qreerScraper";
import SimplyHiredScraper from "./jobScrapers/simplyHiredScraper";
import SnaphuntScraper from "./jobScrapers/snaphuntDetailsAPIScraper";
import TybaScraper from "./jobScrapers/tybaScraper";
import WeWorkRemotelyScraper from "./jobScrapers/weWorkRemotelyScraper";

@Service()
export default class JobScraperHelper {
    private adzunaScraper: AdzunaScraper;
    private arbeitNowScraper: ArbeitNowScraper;
    private careerBuilderScraper: CareerBuilderScraper;
    private careerJetScraper: CareerJetScraper;
    private cvLibraryScraper: CvLibraryScraper;
    private euroJobScraper: EuroJobsScraper;
    private euroJobSitesScraper: EuroJobSitesScraper;
    private graduatelandScraper: GraduatelandScraper;
    private jobFluentScraper: JobFluentScraper;
    private linkedinScraper: LinkedInScraper;
    private noFluffScraper: NoFluffScraper;
    private qreerScraper: QreerScraper;
    private simplyHiredScraper: SimplyHiredScraper;
    private snaphuntScraper: SnaphuntScraper;
    private tybaScraper: TybaScraper;
    private weWorkRemotely: WeWorkRemotelyScraper;

    private jobAdRepository: ScrapingJobAdRepository;
    private jobRepository: ScrapingJobRepository;
    private organizationRepository: OrganizationRepository;

    private jobMapper: JobMapper;
    private jobParserHelper: JobParserHelper;
    private utils: Utils;

    constructor(
        @Inject() adzunaScraper: AdzunaScraper,
        @Inject() arbeitNowScraper: ArbeitNowScraper,
        @Inject() careerBuilderScraper: CareerBuilderScraper,
        @Inject() careerJetScraper: CareerJetScraper,
        @Inject() cvLibraryScraper: CvLibraryScraper,
        @Inject() euroJobScraper: EuroJobsScraper,
        @Inject() euroJobSitesScraper: EuroJobSitesScraper,
        @Inject() graduatelandScraper: GraduatelandScraper,
        @Inject() jobFluentScraper: JobFluentScraper,
        @Inject() linkedinScraper: LinkedInScraper,
        @Inject() noFluffScraper: NoFluffScraper,
        @Inject() qreerScraper: QreerScraper,
        @Inject() simplyHiredScraper: SimplyHiredScraper,
        @Inject() snaphuntScraper: SnaphuntScraper,
        @Inject() tybaScraper: TybaScraper,
        @Inject() weWorkRemotely: WeWorkRemotelyScraper,

        @Inject() jobAdRepository: ScrapingJobAdRepository,
        @Inject() jobRepository: ScrapingJobRepository,
        @Inject() organizationRepository: OrganizationRepository,
        @Inject() jobMapper: JobMapper,
        @Inject() jobParserHelper: JobParserHelper,
        @Inject() utils: Utils,
    )
    {
        this.adzunaScraper = adzunaScraper;
        this.arbeitNowScraper = arbeitNowScraper;
        this.careerBuilderScraper = careerBuilderScraper;
        this.careerJetScraper = careerJetScraper;
        this.cvLibraryScraper = cvLibraryScraper;
        this.euroJobScraper = euroJobScraper;
        this.euroJobSitesScraper = euroJobSitesScraper;
        this.graduatelandScraper = graduatelandScraper;
        this.jobFluentScraper = jobFluentScraper;
        this.linkedinScraper = linkedinScraper;
        this.noFluffScraper = noFluffScraper;
        this.qreerScraper = qreerScraper;
        this.simplyHiredScraper = simplyHiredScraper;
        this.snaphuntScraper = snaphuntScraper;
        this.tybaScraper = tybaScraper;
        this.weWorkRemotely = weWorkRemotely;

        this.jobAdRepository = jobAdRepository;
        this.jobRepository = jobRepository;
        this.organizationRepository = organizationRepository;
        this.jobMapper = jobMapper;
        this.jobParserHelper = jobParserHelper;
        this.utils = utils;
    }

    /**
   * @description Function that accepts jobAdSource and returns the browser scraper to scrape the job from that source.
   * If no scraper is connected to the provided jobAdSource, the function returns null. 
   * @param {JobAdSource} jobAdSouce
   * @returns {IJobBrowserScraper | null}
   */
    private getBrowserScraperFor(jobAdSouce: JobAdSource): IJobScraper | null {
        switch (jobAdSouce) {
            case JobAdSource.ADZUNA:
                return this.adzunaScraper;
            case JobAdSource.ARBEIT_NOW:
                return this.arbeitNowScraper;
            case JobAdSource.CAREER_BUILDER:
                return this.careerBuilderScraper;
            case JobAdSource.CAREER_JET:
                return this.careerJetScraper;
            case JobAdSource.CV_LIBRARY:
                return this.cvLibraryScraper;
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
            case JobAdSource.LINKEDIN:
                return this.linkedinScraper;
            case JobAdSource.NO_FLUFF_JOBS:
                return this.noFluffScraper;
            case JobAdSource.QREER:
                return this.qreerScraper;
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

    /**
   * @description Function that accepts jobAdSource and returns the api scraper to scrape the job from that source.
   * If no scraper is connected to the provided jobAdSource, the function returns null. 
   * @param {JobAdSource} jobAdSouce
   * @returns {IJobApiScraper | null}
   */
    private getApiScraperFor(jobAdSource: JobAdSource): IJobScraper | null {
        switch (jobAdSource) {
            case JobAdSource.SNAPHUNT:
                return this.snaphuntScraper;
            default:
                return null;
        }
    }

    /**
   * @description Function which returns a jobScraper based on the JobAdSource value.
   * @param {JobAdSource} adSource
   * @returns {IJobScraper | null}
   */
    public getScraperFor(adSource: JobAdSource): IJobScraper | null {
        // first attempt to get a browserScraper
        let jobScraper = this.getBrowserScraperFor(adSource);
        // if browser scraper is not found try getting apiScraper
        if (!jobScraper) {
            jobScraper = this.getApiScraperFor(adSource);
        }

        return jobScraper;
    }

    /**
 * @description Function which starts a transaction and interacts with jobRepository, organizationRepository, 
 * and jobAdRepository if the newJobAd has been passed as an argument to the function.
 * Within the transaction a new job will be created, along with the company (TODO: if it already does not exist),
 * and the detailsScraped on the corresponding jobAd will set to true - if the jobAd has been passed.
 * @param {Job} newJob job to be stored.
 * @param {Organization} newOrganization organization to be stored.
 * @param {JobAd?} newJobAd optional parameter, since Job can be scraped directly from the jobLink
 * @returns {Promise<boolean>} Promise resolving to the boolean signifying whether the SQL transaction was successful
 */
    public async sendScrapedJobForStoring(newJob: Job): Promise<Job | null> {
        const transaction = await db.sequelize.transaction();
        try {
            const createdOrganization = await this.organizationRepository.create(newJob.organization!, transaction);
            newJob.organizationId = createdOrganization.id;

            if (newJob.jobAd) { // job can be scraped without ad reference. This is the check if it has the reference to the ad.
                const scrapedJobAd = await this.jobAdRepository.markAsScraped(newJob.jobAd, transaction);
                newJob.jobAdId = scrapedJobAd.id;
            }

            const storedJob = await this.jobRepository.create(newJob, transaction);
            // const storedJob = await this.jobRepository.attachJobToOrganization(createdOrganization, newJob, transaction);

            await transaction.commit();
            return storedJob;
        } catch (exception) {
            console.log(`An exception occurred in sendScrapedJobForStoring() for url=${newJob.url}
                    ${newJob.jobAd ? 'triplet (job, org, jobAd)' : 'pair (job, org)'} - [${exception}]`);
            await transaction.rollback();
            return null;
        }
    }

    /**
     * @description Function which sets JobAd properties postedDate and postedDateTimestamp from the connected Job object,
     * if they do not exist and returns the updated JobAd object.
     * @param {JobAd} jobAd jobAd which inherits the properties.
     * @param {Job} job job scraped based on the jobAd
     * @returns {Promise<JobAd>}
     */
    public inheritPropsFromJob(jobAd: JobAd, job: Job): JobAd {
        if (!jobAd.postedDate && job.postedDate) {
            jobAd.postedDate = job.postedDate;
            jobAd.postedDateTimestamp = this.utils.transformToTimestamp(jobAd.postedDate.toString()) ?? undefined;
        }

        jobAd.jobTitle = job.jobTitle;
        return jobAd;
    }

    /**
     * @description Function which sets creates a Job based on JobDTO and determines whether the job object
     * needs to be parsed in the future.
     * @param {JobDTO} newJob
     * @param {string} jobUrl
     * @returns {Promise<Job>}
     */
    public buildJobMap(newJob: JobDTO, jobUrl: string): Job {
        let newJobMAP = this.jobMapper.toMap(newJob);
        const jobSource = this.utils.getJobAdSourceBasedOnTheUrl(jobUrl);

        newJobMAP.requiresParsing = this.jobParserHelper.requiresParsing(jobSource);

        return newJobMAP;
    }
}
