import 'reflect-metadata';
import { Service } from 'typedi';
import { JobAd } from '../database/models/jobAd';
import db from '../database/db';
import { Op, Transaction } from 'sequelize';
import { JobAdSource } from '../helpers/enums/jobAdSource';

@Service()
export class ScrapingJobAdRepository {
    private FETCH_JOB_AD_BATCH: number = 200;
    
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

     /**
   * @description Retrieves a list of job ads for which the jobs have not been scraped. If an error is encountered,
   * an empty list is returned. -> TODO: float a message to the client on what went wrong
   * @param {number} offset offset used for the purpose of not fetching the same entries, when querying batches of unscraped job ads.
   * @returns {Promise<JobAd[]>} Returns the promise resolving to the list of jobAds.
   */
    public async getAdsWithUnscrapedJobs(offset: number): Promise<JobAd[]> {
        console.log('about to fetch entries')
        try {
            const jobAdsWithoutScrapedDetails = await JobAd.findAll({
                where: {
                    areDetailsScraped: false,
                    // source: { [Op.not]: [JobAdSource.CV_LIBRARY.valueOf(), JobAdSource.NO_FLUFF_JOBS.valueOf()] },
                },
                limit: this.FETCH_JOB_AD_BATCH,
                offset: offset
            });
            console.log(jobAdsWithoutScrapedDetails.length +' entries fetched');
    
            return jobAdsWithoutScrapedDetails;
        } catch (exception) {
            console.error(`getAdsWithoutScrapedDetails unsuccessful - [${exception}]`);
            return [];
        }
    }

    /**
   * @description Marks job ad as scraped and sets the detailsScrapedDate. Throws an error if encountered.
   * @param {JobAd} jobAd JobAd MAP object which is to be stored
   * @param {Transaction} t This function is executed as a part of a transaction t.
   * @returns {Promise<JobAd>} Promise containing the updated job ad.
   */
    public async markAsScraped(jobAd: JobAd, t: Transaction): Promise<JobAd> {
        try {
            const updatedJobAd = await jobAd.update({
                areDetailsScraped: true,
                detailsScrapedDate: new Date(Date.now())
            }, { transaction: t });
            return updatedJobAd;    
        } catch (exception) {
            throw `An exception occurred while updating the jobAd with id=${jobAd.id}. - [${exception}]`;
        }
    }
}
