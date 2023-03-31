import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { JobAdDTO } from '../helpers/dtos/jobAdDTO';
import { JobAdMapper } from '../helpers/mappers/jobAdMapper';
import { ScrapingJobAdRepository } from '../repositories/scrapingJobAdRepository';
import { ScrapeJobAdsForm }  from './../helpers/dtos/scrapeJobAdsForm';
import { AdzunaAdScraper } from './scrapers/adzunaAdScraper';
import { ArbeitNowAdScraper } from './scrapers/arbeitNowAdScraper';
import { BaseAdScraper } from './scrapers/baseAdScraper';
import { CarerJetAdScraper } from './scrapers/careerJetAdScraper';
import { CvLibraryAdScraper } from './scrapers/cvLibraryAdScraper';
import { EuroJobsAdScraper } from './scrapers/euroJobsAdScraper';
import { GraduatelandAdScraper } from './scrapers/graduatelandAdScraper';
import { JobFluentAdScraper } from './scrapers/jobFluentAdScraper';
import { NoFluffAdScraper } from './scrapers/noFluffJobsAdScraper';
import { QreerAdScraper } from './scrapers/qreerAdScraper';
import { SimplyHiredAdScraper } from './scrapers/simplyHiredAdScraper';
import { TybaAdScraper } from './scrapers/tybaAdScraper';

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

    public async scrapeJobAdsOnAllWebsites(clientForm: ScrapeJobAdsForm): Promise<number> {
        const allScrapers = this.getScrapers();
        let totalAdsScraped = 0;

        for (let i = 0; i < allScrapers.length; i++) {
            totalAdsScraped += await this.scrapeJobAds(clientForm, allScrapers[i]);
        }

        return totalAdsScraped;
    }

    /**
   * @description Function accepts client form, and based on the data provided scrapes jobs across the predefined jobsites.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAds(clientForm: ScrapeJobAdsForm, scraper: BaseAdScraper): Promise<number> {
        const scrapedJobAds = await scraper.scrape(clientForm);
        console.log(scrapedJobAds.length + ' ads have been scraped.');

        if (scrapedJobAds?.length == 0) {
            return 0;
        }

        const numberOfStoredAds = await this.storeJobAds(scrapedJobAds);
        console.log(`${numberOfStoredAds} ads have been stored`);

        return numberOfStoredAds;
    }

    private getScrapers(): BaseAdScraper[] {
        return [
            this.adzunaAdScraper, this.arbeitNowAdScraper, this.careerJetAdScraper, this.cvLibraryAdScraper,
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
