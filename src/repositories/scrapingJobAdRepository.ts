import 'reflect-metadata';
import { Service } from 'typedi';
import { JobAd } from '../database/models/jobAd';
import db from '../database/db';

@Service()
export class ScrapingJobAdRepository {
    /**
   * @description Retrieves a scraped job ad and returns a success message. If not found returns null. If error encountered, returns an error message.
   * @param id JobAd MAP object which is to be stored
   * @returns {Promise<JobAd | null>} Returns the promise resolving to the jobAd connected to the passed id or null.
   */
    public async get(id: number): Promise<JobAd | null> {
        const jobAdMAP = await JobAd.findByPk(id);
        return jobAdMAP;
    }

    /**
   * @description Stores a scraped job ad and returns a success message. Throws an error if encountered.
   * @param jobAd JobAd MAP object which is to be stored
   * @returns {Promise<JobAd>} Promise containing the stored job ad.
   */
    public async create(jobAd: JobAd): Promise<JobAd> {
        const res = await jobAd.save();
        return res;
    }

    /**
   * @description Stores a list of scraped job ads and returns a success message. Throws an error if encountered.
   * @param jobAds JobAd MAP objects which are to be stored
   * @returns {Promise<JobAd[]>} Promise containing the list of stored job ads.
   */
    public async createMany(jobAds: any[]): Promise<JobAd[]> {
        const res = await db.JobAd.bulkCreate(jobAds, {ignoreDuplicates: true});
        return res;
    }
}
