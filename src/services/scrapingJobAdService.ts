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
import { GraduatelandAdScraper } from './scrapers/jobAdScrapers/graduatelandAdScraper';
import { JobFluentAdScraper } from './scrapers/jobAdScrapers/jobFluentAdScraper';
import { NoFluffAdScraper } from './scrapers/jobAdScrapers/noFluffJobsAdScraper';
import { QreerAdScraper } from './scrapers/jobAdScrapers/qreerAdScraper';
import { SimplyHiredAdScraper } from './scrapers/jobAdScrapers/simplyHiredAdScraper';
import { TybaAdScraper } from './scrapers/jobAdScrapers/tybaAdScraper';

@Service()
export class ScrapingJobAdService {
    @Inject()
    private scrapingJobAdRepository: ScrapingJobAdRepository;
    @Inject()
    private jobAdMapper: JobAdMapper;
    @Inject()
    private adzunaAdScraper: AdzunaAdScraper;
    @Inject()
    private arbeitNowAdScraper: ArbeitNowAdScraper;
    @Inject()
    private careerJetAdScraper: CarerJetAdScraper;
    @Inject()
    private careerBuilderScraper: CareerBuilderScraper;
    @Inject()
    private cvLibraryAdScraper: CvLibraryAdScraper;
    @Inject()
    private euroJobsAdScraper: EuroJobsAdScraper;
    @Inject()
    private graduatelandAdScraper: GraduatelandAdScraper;
    @Inject()
    private jobFluentAdScraper: JobFluentAdScraper;
    @Inject()
    private noFluffAdScraper: NoFluffAdScraper;
    @Inject()
    private qreerAdScraper: QreerAdScraper;
    @Inject()
    private simplyHiredAdScraper: SimplyHiredAdScraper;
    @Inject()
    private tybaAdScraper: TybaAdScraper;

    /**
   * @description Function accepts client form, and based on the data provided scrapes jobs across the jobsites defined in the getScrapers() function.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAdsOnAllWebsites(clientForm: ScrapeJobAdsForm): Promise<number> {
        const jobAdScrapers = this.getScrapers();

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
            this.euroJobsAdScraper, this.graduatelandAdScraper, this.jobFluentAdScraper, this.noFluffAdScraper,
            this.qreerAdScraper, this.simplyHiredAdScraper, this.tybaAdScraper
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
