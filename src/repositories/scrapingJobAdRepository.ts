import 'reflect-metadata';
import { Service } from 'typedi';
import { JobAd } from '../database/models/jobAd';
import db from '../database/db';
import { Transaction } from 'sequelize';

@Service()
export class ScrapingJobAdRepository {
    private FETCH_JOB_AD_BATCH: number = 200;

    /**
   * @description Retrieves a scraped job ad and returns a success message. If not found returns null.
   * @param id JobAd MAP object which is to be stored
   * @returns {Promise<JobAd | null>} Returns the promise resolving to the jobAd connected to the passed id or null.
   */
    public async get(id: number): Promise<JobAd | null> {
        return await JobAd.findByPk(id);
    }

    /**
   * @description Stores a scraped job ad and returns a success message.
   * @param jobAd JobAd MAP object which is to be stored
   * @param {Transaction} t transaction as part of which the insert query is executed
   * @returns {Promise<JobAd>} Promise containing the stored job ad.
   */
    public async create(jobAd: JobAd): Promise<JobAd> {
        return await jobAd.save();
    }

    /**
   * @description Stores a list of scraped job ads and returns a success message.
   * @param jobAds JobAd MAP objects which are to be stored
   * @returns {Promise<JobAd[]>} Promise containing the list of stored job ads.
   */
    public async createMany(jobAds: any[]): Promise<JobAd[]> {
        return await db.JobAd.bulkCreate(jobAds, { ignoreDuplicates: true });
    }

    /**
  * @description Retrieves a list of job ads for which the jobs have not been scraped.
  * @param {number} offset offset used for the purpose of not fetching the same entries, when querying batches of unscraped job ads.
  * @returns {Promise<JobAd[]>} Returns the promise resolving to the list of jobAds.
  */
    public async getAdsWithUnscrapedJobs(offset: number): Promise<JobAd[]> {
        const jobAdsWithoutScrapedDetails = await JobAd.findAll({
            where: {
                areDetailsScraped: false,
                isAdPresentOnline: true,
                // source: { [Op.not]: [JobAdSource.CV_LIBRARY.valueOf(), JobAdSource.NO_FLUFF_JOBS.valueOf()] },
            },
            limit: this.FETCH_JOB_AD_BATCH,
            offset: offset
        });
        return jobAdsWithoutScrapedDetails;
    }

    /**
   * @description Marks job ad as scraped and sets the detailsScrapedDate.
   * @param {JobAd} jobAd JobAd MAP object which is to be stored
   * @param {Transaction} t This function is executed as a part of a transaction t.
   * @returns {Promise<JobAd>} Promise containing the updated job ad.
   */
    public async markAsScraped(jobAd: JobAd, t: Transaction): Promise<JobAd> {
        const updatedJobAd = await jobAd.update({
            jobTitle: jobAd.jobTitle,
            postedDate: jobAd.postedDate,
            postedDateTimestamp: jobAd.postedDateTimestamp,
            areDetailsScraped: true,
            detailsScrapedDate: new Date(Date.now()),
        }, { transaction: t }
        );
        return updatedJobAd;
    }

    /**
   * @description Updates the jobAd and returns it.
   * @param {JobAd} jobAd JobAd MAP object which is to be updated
   * @param {Transaction?} t transaction as part of which the update query is executed
   * @returns {Promise<JobAd>} Promise containing the updated jobAd.
   */
    public async update(jobAd: JobAd, t?: Transaction): Promise<JobAd> {
        return await jobAd.save({ transaction: t });
    }

    /**
   * @description Updates the jobAd and returns it.
   * @param {JobAd} jobAd JobAd MAP object which is to be updated
   * @returns {Promise<JobAd>} Promise containing the updated jobAd.
   */
    public async updateAsExpired(jobAd: JobAd): Promise<JobAd> {
        jobAd.isAdPresentOnline = false;
        return await this.update(jobAd);
    }
}
