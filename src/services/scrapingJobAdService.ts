import 'reflect-metadata';
import { Service, Inject } from 'typedi';
import { JobAdDTO } from '../helpers/dtos/jobAdDTO';
import { JobAdMapper } from '../helpers/mappers/jobAdMapper';
import { ScrapingJobAdRepository } from '../repositories/scrapingJobAdRepository';
import { ScrapeJobAdsForm }  from './../helpers/dtos/scrapeJobAdsForm';
import { AdzunaAdScraper } from './scrapers/adzunaAdScraper';

@Service()
export class ScrapingJobAdService {
    @Inject()
    private scrapingJobAdRepository: ScrapingJobAdRepository;
    @Inject()
    private jobAdMapper: JobAdMapper;
    @Inject()
    private adzunaAdScraper: AdzunaAdScraper;

    /**
   * @description Function accepts client form, and based on the data provided scrapes jobs across the predefined jobsites.
   * @param {ScrapeJobAdsForm} clientForm Client form containing the data based on which job ads are collected.
   * @returns {Promise<number>} Promise resolving to the number of stored job ads.
   */
    public async scrapeJobAds(clientForm: ScrapeJobAdsForm): Promise<number> {
        const scrapedJobAds = await this.adzunaAdScraper.scrape(clientForm);
        console.log(scrapedJobAds.length + ' ads have been scraped.');

        if (scrapedJobAds?.length == 0) {
            return 0;
        }

        const numberOfStoredAds = await this.storeJobAds(scrapedJobAds);
        console.log(`${numberOfStoredAds} ads have been stored`);

        return numberOfStoredAds;
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
