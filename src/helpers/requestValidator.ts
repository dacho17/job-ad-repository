import { Service } from "typedi";
import Constants from "./constants";
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
}
