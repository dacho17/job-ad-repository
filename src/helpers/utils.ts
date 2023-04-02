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
     * @description Function which expects string in format DD.MM.YYYY and transforms it to the date object.
     * @param {string} strDate
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getDateFromDottedDateString(strDate: string | null): Date {
        const dividedDate = strDate?.trim().split(Constants.DOT);
        if (dividedDate?.length === 3) {
            const numericDividedDate = dividedDate.map(part => parseInt(part));
            const monthIndex = numericDividedDate[1] - 1;
            return new Date(numericDividedDate[2], monthIndex, numericDividedDate[0]);
        }
        return new Date();
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
     * @description Function that formats postedAgo property from CareerJet ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4CareerJet(textContainingPostedAgo: string): Date {
        const [postedAgoText, timeframe, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE)
        const postedAgo = parseInt(postedAgoText);

        if (timeframe.includes(JobAdPostedAgoTimeframe.NOW)) {
            return new Date(Date.now());
        }

        if (isNaN(postedAgo)) {
            return new Date();
        } else if (timeframe.includes(JobAdPostedAgoTimeframe.HOUR)) {
            return addHours(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.MONTH)) {
            return addMonths(Date.now(), -postedAgo);
        }
        else {
            return new Date();
        }
    }

    /**
     * @description Function that formats postedAgo property from EuroJobSites ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4EuroJobSites(textContainingPostedAgo: string): Date {
        const [firstPart, secondPart, thirdPart, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);
        
        if (thirdPart.includes(JobAdPostedAgoTimeframe.TODAY)) {
            return new Date(Date.now());
        } else if (thirdPart.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -parseInt(secondPart));
        } else {
            return new Date();
        }
    }

    /**
     * @description Function that formats postedAgo property from Graduateland ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4Graduateland(textContainingPostedAgo: string): Date {
        const [_, firstPart, secondPart] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);

        if (!secondPart) return new Date();

        if (secondPart.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -parseInt(firstPart))
        } else if (secondPart.includes(JobAdPostedAgoTimeframe.WEEK)) {
            return addWeeks(Date.now(), -parseInt(firstPart));
        } else {
            return new Date();
        }
    }

    /**
     * @description Function that formats postedAgo property from LinkedIn ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4LinkedIn(textContainingPostedAgo: string): Date {
        const [postedAgoText, timeframe, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE)
        const postedAgo = parseInt(postedAgoText);
    
        if (isNaN(postedAgo)) return new Date();
    
        if (timeframe.includes(JobAdPostedAgoTimeframe.HOUR)) {
            return addHours(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.WEEK)) {
            return addWeeks(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.MONTH)) {
            return addMonths(Date.now(), -postedAgo);
        }
        else {
            return new Date();
        }
    }

    /**
     * @description Function that formats postedAgo property from Simplyhired ad (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4SimplyHired(textContainingPostedAgo: string): Date {
        const [postedAgoText, timeframe, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE)
        const postedAgo = parseInt(postedAgoText);
    
        if (isNaN(postedAgo)) return new Date();
    
        if (timeframe.includes(JobAdPostedAgoTimeframe.HOUR)) {
            return addHours(Date.now(), -postedAgo);
        } else if (timeframe.includes(JobAdPostedAgoTimeframe.DAY)) {
            return addDays(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.WEEK)) {
            return addWeeks(Date.now(), -postedAgo);
        }
        else if (timeframe.includes(JobAdPostedAgoTimeframe.MONTH)) {
            return addMonths(Date.now(), -postedAgo);
        }
        else {
            return new Date();
        }
    }

    /**
     * @description Function that formats and returns data on the number of applicants for a job at WeWorkRemotely site.
     * @param {string} textContainingNofApplicants
     * @returns {string} Returns information on number of applicants as a string.
     */
    public getNumberOfApplicantsWWR(textContainingNofApplicants: string): string {
        const [numberCandidate, numberCandidateTwo, _] = textContainingNofApplicants.trim().split(Constants.WHITESPACE);

        const nOfApplicantsCandidate = parseInt(numberCandidate);
        const nOfApplicantsCandidateTwo = parseInt(numberCandidateTwo);
        if (isNaN(nOfApplicantsCandidate) && isNaN(nOfApplicantsCandidateTwo))  return Constants.UNKNOWN_NUMBER_OF_APPLICANTS;
        if (isNaN(nOfApplicantsCandidate))
            return nOfApplicantsCandidateTwo.toString();

        return nOfApplicantsCandidateTwo.toString();
    }

    /**
     * @description Function that accepts a date in string format (e.g. 2nd June 2023) and returns the date object.
     * @param {string} qreerDate
     * @returns {Date}
     */
    public transformQreerDate(qreerDate: string): Date {
        const partsOfDate = qreerDate.trim().split(Constants.WHITESPACE);
        const tranformedDay = this.transformStrDayToNumber(partsOfDate[0]);
        const transformedMonth = this.transformStrMonthToNumber(partsOfDate[1]);
        const transformedYear = parseInt(partsOfDate[2]);

        if (tranformedDay && transformedMonth && transformedYear) {
            return new Date(transformedYear, transformedMonth - 1, tranformedDay); 
        }

        return new Date();
    }

    /**
     * @description Function that accepts a day in string format and returns its ordinary number.
     * @param {string} day
     * @returns {number | null}
     */
    private transformStrDayToNumber(day: string): number | null {
        let dayNum = parseInt(day.slice(0, -2));

        return isNaN(dayNum) ? null : dayNum;
    }
    
    /**
     * @description Function that accepts a month in string format and returns its ordinary number.
     * @param {string} month
     * @returns {number | null}
     */
    private transformStrMonthToNumber(month: string): number | null {
        switch (month) {
            case 'Jan':
            case 'January':
                return 1
            case 'Feb':
            case 'February':
                return 2
            case 'Mar':
            case 'March':
                return 3
            case 'Apr':
            case 'April':
                return 4
            case 'May':
                return 5
            case 'Jun':
            case 'June':
                return 6
            case 'Jul':
            case 'July':
                return 7
            case 'Aug':
            case 'August':
                return 8
            case 'Sep':
            case 'September':
                return 9
            case 'Oct':
            case 'October':
                return 10
            case 'Nov':
            case 'November':
                return 11
            case 'Dec':
            case 'December':
                return 12
            default:
                return null;
        }
    }
}
