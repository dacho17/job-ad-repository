import { Service } from "typedi";
import { addMinutes, addHours, addDays, addWeeks, addMonths} from 'date-fns';
import Constants from "./constants";
import { JobAdPostedAgoTimeframe } from "./enums/jobAdPostedAgoTimeframe";
import { JobAdSource } from "./enums/jobAdSource";

@Service()
export default class Utils {
    public transformToTimestamp(date: string): number {
        const timestamp = Date.parse(date);
        if (isNaN(timestamp)) return Date.parse((new Date().toString()));

        return timestamp;
    }

    /**
     * @description Function that formats postedAgo property from JobFluent ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4JobFluent(textContainingPostedAgo: string): Date {
        const [_, firstPart, secondPart] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);

        if (firstPart.includes(JobAdPostedAgoTimeframe.YESTERDAY)) {
            return addDays(Date.now(), -1);
        } else if (secondPart.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -parseInt(firstPart));
        } else {
            return new Date();
        }
    }

    /**
     * @description Function that formats postedAgo property from CareerBuilder ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4CareerBuilder(textContainingPostedAgo: string): Date {
        const [postedAgoText, timeframe, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);
        const postedAgo = parseInt(postedAgoText);
        if (textContainingPostedAgo.trim().toLowerCase() == JobAdPostedAgoTimeframe.TODAY) {
            return new Date(Date.now());
        } else if (!isNaN(postedAgo)) {
            const timeframeCheck = timeframe.trim().toLowerCase();
            if (timeframeCheck.includes(JobAdPostedAgoTimeframe.DAY)) return addDays(Date.now(), -postedAgo);
            else if (timeframeCheck.includes(JobAdPostedAgoTimeframe.MONTH)) return addMonths(Date.now(), -postedAgo);
            else return new Date();
        }
    
        return new Date();
    }

    /**
     * @description Function that formats postedAgo property from EuroJobSites ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4EuroJobSites(textContainingPostedAgo: string): Date {
        const [firstPart, secondPart, thirdPart, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);
        
        if (thirdPart.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -parseInt(secondPart));
        } else {
            return new Date();
        }
    }
}
