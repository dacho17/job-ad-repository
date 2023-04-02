import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { JobAdDTO } from '../helpers/dtos/jobAdDTO';
import { JobAdMapper } from '../helpers/mappers/jobAdMapper';
import { ScrapingJobAdRepository } from '../repositories/scrapingJobAdRepository';
import { ScrapeJobAdsForm }  from './../helpers/dtos/scrapeJobAdsForm';
import IJobAdScraper from './scrapers/interfaces/IJobAdScraper';
import { AdzunaAdScraper } from './scrapers/jobAdScrapers/adzunaAdScraper';
import { ArbeitNowAdScraper } from './scrapers/jobAdScrapers/arbeitNowAdScraper';
import { CareerBuilderScraper } from './scrapers/jobAdScrapers/careerBuilder';
import { CarerJetAdScraper } from './scrapers/jobAdScrapers/careerJetAdScraper';
import { CvLibraryAdScraper } from './scrapers/jobAdScrapers/cvLibraryAdScraper';
import { EuroJobsAdScraper } from './scrapers/jobAdScrapers/euroJobsAdScraper';
import { EuroJobSitesAdScraper } from './scrapers/jobAdScrapers/euroJobSitesAdScraper';
import { GraduatelandAdScraper } from './scrapers/jobAdScrapers/graduatelandAdScraper';
import { JobFluentAdScraper } from './scrapers/jobAdScrapers/jobFluentAdScraper';
import LinkedInAdScraper from './scrapers/jobAdScrapers/linkedinAdScraper';
import { NoFluffAdScraper } from './scrapers/jobAdScrapers/noFluffJobsAdScraper';
import { QreerAdScraper } from './scrapers/jobAdScrapers/qreerAdScraper';
import { SimplyHiredAdScraper } from './scrapers/jobAdScrapers/simplyHiredAdScraper';
import SnaphuntAdScraper from './scrapers/jobAdScrapers/snaphuntScraper';
import { TybaAdScraper } from './scrapers/jobAdScrapers/tybaAdScraper';
import { WeWorkRemotelyAdScraper } from './scrapers/jobAdScrapers/weWorkRemotelyAdScraper';

@Service()
export class ScrapingJobAdService {
    private scrapingJobAdRepository: ScrapingJobAdRepository;
    private jobAdMapper: JobAdMapper;

    private adzunaAdScraper: AdzunaAdScraper;
    private arbeitNowAdScraper: ArbeitNowAdScraper;
    private careerJetAdScraper: CarerJetAdScraper;
    private careerBuilderScraper: CareerBuilderScraper;
    private cvLibraryAdScraper: CvLibraryAdScraper;
    private euroJobsAdScraper: EuroJobsAdScraper;
    private euroJobSitesAdScraper: EuroJobSitesAdScraper;
    private graduatelandAdScraper: GraduatelandAdScraper;
    private jobFluentAdScraper: JobFluentAdScraper;
    private linkedinAdScraper: LinkedInAdScraper;
    private noFluffAdScraper: NoFluffAdScraper;
    private qreerAdScraper: QreerAdScraper;
    private simplyHiredAdScraper: SimplyHiredAdScraper;
    private snaphuntAdScraper: SnaphuntAdScraper;
    private tybaAdScraper: TybaAdScraper;
    private weWorkRemotelyAdScraper: WeWorkRemotelyAdScraper;

    constructor(
        @Inject() scrapingJobAdRepository: ScrapingJobAdRepository,
        @Inject() jobAdMapper: JobAdMapper,
        @Inject() adzunaAdScraper: AdzunaAdScraper,
        @Inject() arbeitNowAdScraper: ArbeitNowAdScraper,
        @Inject() careerJetAdScraper: CarerJetAdScraper,
        @Inject() careerBuilderScraper: CareerBuilderScraper,
        @Inject() cvLibraryAdScraper: CvLibraryAdScraper,
        @Inject() euroJobsAdScraper: EuroJobsAdScraper,
        @Inject() euroJobSitesAdScraper: EuroJobSitesAdScraper,
        @Inject() graduatelandAdScraper: GraduatelandAdScraper,
        @Inject() jobFluentAdScraper: JobFluentAdScraper,
        @Inject() linkedinAdScraper: LinkedInAdScraper,
        @Inject() noFluffAdScraper: NoFluffAdScraper,
        @Inject() qreerAdScraper: QreerAdScraper,
        @Inject() simplyHiredAdScraper: SimplyHiredAdScraper,
        @Inject() snaphuntAdScraper: SnaphuntAdScraper,
        @Inject() tybaAdScraper: TybaAdScraper,
        @Inject() weWorkRemotelyAdScraper: WeWorkRemotelyAdScraper,
    )
    {
        this.scrapingJobAdRepository = scrapingJobAdRepository;
        this.jobAdMapper = jobAdMapper;
        this.adzunaAdScraper = adzunaAdScraper;
        this.arbeitNowAdScraper = arbeitNowAdScraper;
        this.careerJetAdScraper = careerJetAdScraper;
        this.careerBuilderScraper = careerBuilderScraper;
        this.cvLibraryAdScraper = cvLibraryAdScraper;
        this.euroJobsAdScraper = euroJobsAdScraper;
        this.euroJobSitesAdScraper = euroJobSitesAdScraper;
        this.graduatelandAdScraper = graduatelandAdScraper;
        this.jobFluentAdScraper = jobFluentAdScraper;
        this.linkedinAdScraper = linkedinAdScraper;
        this.noFluffAdScraper = noFluffAdScraper;
        this.qreerAdScraper = qreerAdScraper;
        this.simplyHiredAdScraper = simplyHiredAdScraper;
        this.snaphuntAdScraper = snaphuntAdScraper;
        this.tybaAdScraper = tybaAdScraper;
        this.weWorkRemotelyAdScraper = weWorkRemotelyAdScraper;
    }

    /**
   * @description Function accepts client form, and based on the data provided scrapes jobs across the jobsites defined in the getScrapers() function.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAdsOnAllWebsites(clientForm: ScrapeJobAdsForm): Promise<number> {
        // const jobAdScrapers = this.getScrapers();
        const jobAdScrapers = [this.noFluffAdScraper];

        let totalAdsScraped = 0;

        for (let i = 0; i < jobAdScrapers.length; i++) {
            totalAdsScraped += await this.scrapeJobAds(clientForm, jobAdScrapers[i]);
        }

        return totalAdsScraped;
    }

    /**
   * @description Function accepts client form, and a scraper. Based on the two, it will start scraping jobs from the website determined by the provided scraper.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAds(clientForm: ScrapeJobAdsForm, scraper: IJobAdScraper): Promise<number> {
        const scrapedJobAds = await scraper.scrape(clientForm);
        console.log(scrapedJobAds.length + ' ads have been scraped.');

        if (scrapedJobAds?.length == 0) {
            return 0;
        }

        const numberOfStoredAds = await this.storeJobAds(scrapedJobAds);
        console.log(`${numberOfStoredAds} ads have been stored`);

        return numberOfStoredAds;
    }

     /**
   * @description Function returns the list of implemented jobAd scrapers.
   * @returns {IJobAdScraper[]}
   */
    private getScrapers(): IJobAdScraper[] {
        return [
            this.adzunaAdScraper, this.arbeitNowAdScraper, this.careerBuilderScraper, this.careerJetAdScraper, this.cvLibraryAdScraper,
            this.euroJobsAdScraper, this.euroJobSitesAdScraper, this.graduatelandAdScraper, this.jobFluentAdScraper, 
            this.linkedinAdScraper, this.noFluffAdScraper,
            this.qreerAdScraper, this.simplyHiredAdScraper, this.snaphuntAdScraper, this.tybaAdScraper, this.weWorkRemotelyAdScraper
        ];
    }

    /**
   * @description Function maps jobAd DTOs to MAP objects and passes them to the repository to be stored.
   * @param jobAds JobAdDTO[] List of JobAd DTO objects
   * @returns {Promise<number>} Promise resolving to the number of stored entries
   */
    private async storeJobAds(jobAds: JobAdDTO[]): Promise<number> {
        // const jobAdsMAP = jobAds.map(jobAd => this.jobAdMapper.toMap(jobAd));
        
        const res = await this.scrapingJobAdRepository.createMany(jobAds);  // NOTE: I am passing DTOs to the function!
        return res.length;
    }

    /**
   * @description Function maps jobAd DTO to its MAP object and passes it to the repository to be stored.
   * @param jobAd JobAdDTO A JobAd DTO object
   * @returns {Promise<boolean>} Promise resolving to the boolean depending on whether the entry was stored successfully. 
   */
    private async storeJobAd(jobAd: JobAdDTO): Promise<boolean> {
        const jobAdMAP = this.jobAdMapper.toMap(jobAd);

        const res = await this.scrapingJobAdRepository.create(jobAdMAP);
        return !!res;
    }
}
