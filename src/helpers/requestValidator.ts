import { Service } from "typedi";
import Constants from "./constants";
import { GetJobsRequest } from "./dtos/getJobsRequest";
import { ScrapeJobAdsForm } from "./dtos/scrapeJobAdsForm";

@Service()
export class RequestValidator {
    /**
   * @description Function which accepts data from the client scrape request form. If the data sent in client's form is invalid the client will be notified with the message.
   * @param {string} jobTitle @param {string} nOfAds @param {string} location @param {string} workFromHome
   * @returns {[boolean, ScrapeJobAdsForm | null, string]} Triplet (isFormValid, validScrapeJobAdsForm, errorMessage)
   */
    public validateScrapeJobAdsForm(jobTitle: string, nOfAds: number, location: string, workFromHome: boolean): [boolean, ScrapeJobAdsForm | null, string] {
        if (!jobTitle || jobTitle.trim() === Constants.EMPTY_STRING) {
            return [false, null, Constants.JOB_TITLE_INVALID];
        }
        if (!nOfAds || isNaN(nOfAds) || nOfAds < 1) {
            return [false, null, Constants.NUMBER_OF_ADS_INVALID];
        }
        if (workFromHome && (workFromHome !== true && workFromHome !== false)) {
            return [false, null, Constants.WORK_FROM_HOME_INVALID];
        }
        // location is not being validated

        const validScrapeJobAdsForm: ScrapeJobAdsForm = {
            jobTitle: jobTitle.trim(),
            reqNOfAds: nOfAds,
            location: location?.trim(),
            scrapeOnlyRemote: workFromHome
        };

        return [true, validScrapeJobAdsForm, Constants.EMPTY_STRING];
    }

    /**
   * @description Function which accepts data from the client getJobs request. If the data sent in client's form is invalid the client will be notified with the message.
   * Query parameters expected in the request are searchWord, offset and batchSize
   * @param {any} queryParams
   * @returns {[boolean, GetJobsRequest | null, string]} Triplet (isFormValid, validGetJobsRequest, errorMessage)
   */
    public validateGetJobsRequest(queryParams: any): [boolean, GetJobsRequest | null, string] {
        console.log(queryParams);
        let { companyNameSearch, jobTitleSearch, offset, batchSize } = queryParams;
        console.log(companyNameSearch); console.log(jobTitleSearch);
        
        let companyNameQueryWord = companyNameSearch?.trim() || Constants.EMPTY_STRING;
        let jobTitleQueryWord = jobTitleSearch?.trim() || Constants.EMPTY_STRING;
        console.log(companyNameQueryWord); console.log(jobTitleQueryWord);
        
        const offsetNum = offset ? parseInt(offset) : 0;
        const batchSizeNum = batchSize ? parseInt(batchSize) : Constants.DEFAULT_GET_JOBS_BATCH_SIZE;

        const getJobAdRequest: GetJobsRequest
            = new GetJobsRequest(jobTitleQueryWord, companyNameQueryWord, offsetNum, batchSizeNum);
        return [true, getJobAdRequest, Constants.EMPTY_STRING];
    }
}
