import Container, { Service } from "typedi";
import { addMinutes, addHours, addDays, addWeeks, addMonths} from 'date-fns';
import Constants from "./constants";
import { JobAdPostedAgoTimeframe } from "./enums/jobAdPostedAgoTimeframe";
import { JobAdSource } from "./enums/jobAdSource";

@Service()
export default class Utils {
    private urlValidationRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

    public transformToTimestamp(date: string| null): number | null {
        if (date === null) return null;
        const timestamp = Date.parse(date);
        if (isNaN(timestamp)) return null;

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
     * @description Function that formats postedAgo property from CvLibrary job page (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public getPostedDate4CvLibrary(textContainingPostedAgo: string): Date {
        const [firstPart, secondPart, _] = textContainingPostedAgo.trim().split(Constants.WHITESPACE);
        
        // check if textContainingPostedAgo is string of format DD/MM/YYYY
        const candidateDate = firstPart.split('/');
        if (candidateDate.length === 3) {
            return new Date(parseInt(candidateDate[2]), parseInt(candidateDate[1]) - 1, parseInt(candidateDate[0]));
        }

        if (!isNaN(Date.parse(firstPart))) {
            return new Date(Date.parse(firstPart));
        } else if (firstPart.includes(JobAdPostedAgoTimeframe.TODAY)) {
            return new Date(Date.now());
        } else if (firstPart.includes(JobAdPostedAgoTimeframe.YESTERDAY)) {
            return addDays(Date.now(), -1);
        } else if (firstPart.includes('a')) {
            console.log('about to read addweeks');
            const newDate =  addWeeks(Date.now(), -1);
            console.log(newDate)
            return newDate;
        } else if (!isNaN(parseInt(firstPart))) {
            if (secondPart.includes(JobAdPostedAgoTimeframe.DAY)) {
                return addDays(Date.now(), -parseInt(firstPart))
            } else if (secondPart.includes(JobAdPostedAgoTimeframe.WEEK)) {
                return addWeeks(Date.now(), -parseInt(firstPart));
            } else {
                return new Date();
            }
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
     * @description Function that formats postedAgo property from NoFluff job page (Format=TODO).
     * @param {string} textContainingPostedAgo
     * @returns {Date} Returns Date object based on the string, or a default Date object.
     */
    public  getPostedDate4NoFluff(textContainingPostedAgo: string): Date {
        const splitEntry = textContainingPostedAgo.trim().split(Constants.WHITESPACE)

        if (splitEntry.length < 6) return new Date();
        const postedAgoText = splitEntry[4];
        const timeframe = splitEntry[5];
        const postedAgo = parseInt(postedAgoText);

        if (isNaN(postedAgo)) return new Date();
    
        if (timeframe.includes(JobAdPostedAgoTimeframe.DAY)) {
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
     * @description Function that expects startDate (in format yyyy-mm-dd) 
     * from CvLibrary job details page formats it to the Date object, and return it as string.
     * @param {string} textContainingStartDate
     * @returns {Date} Returns string based on the constructed Date, argument, or value 'Unknown'.
     */
    public getStartDate4CvLibrary(textContainingStartDate: string): string {
        const [year, month, day] = textContainingStartDate.split(Constants.MINUS_SIGN);
        if (year && month && day){
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);
            const dayNum = parseInt(day);
            if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum))
                return (new Date(yearNum, monthNum - 1, dayNum).toString());
        }
        
        return textContainingStartDate || Constants.UNKNOWN;
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
     * @description Function that validates the url and returns boolean depending on whether the url is a valid url.
     * @param {string} url
     * @returns {boolean}
     */
    public validateUrl(url: string): boolean {
        return url !== null && url !==undefined && this.urlValidationRegex.test(url.trim());
    }

    /**
     * @description Function that returns the JobAdSource corresponding to the url which has been provided.
     * @param {string} url
     * @returns {JobAdSource}
     */
    public getJobAdSourceBasedOnTheUrl(url: string): JobAdSource {
        switch(true) {
            case url.includes(Constants.ADZUNA):
                return JobAdSource.ADZUNA;
            case url.includes(Constants.ARBEIT_NOW):
                return JobAdSource.ARBEIT_NOW;
            case url.includes(Constants.CAREER_BUILDER):
                return JobAdSource.CAREER_BUILDER;
            case url.includes(Constants.CAREER_JET):
                return JobAdSource.CAREER_JET;
            case url.includes(Constants.CV_LIBRARY):
                return JobAdSource.CV_LIBRARY;
            case url.includes(Constants.EURO_JOBS):
                return JobAdSource.EURO_JOBS;
            case url.includes(Constants.EURO_ENGINEERING):
                return JobAdSource.EURO_ENGINEER_JOBS;
            case url.includes(Constants.EURO_SCIENCE):
                return JobAdSource.EURO_SCIENCE_JOBS;
            case url.includes(Constants.EURO_SPACE_CAREERS):
                return JobAdSource.EURO_SPACE_CAREERS;
            case url.includes(Constants.EURO_TECH):
                return JobAdSource.EURO_TECH_JOBS;
            case url.includes(Constants.GRADUATELAND):
                return JobAdSource.GRADUATELAND;
            case url.includes(Constants.JOB_FLUENT):
                return JobAdSource.JOB_FLUENT;
            case url.includes(Constants.LINKEDIN):
                return JobAdSource.LINKEDIN;
            case url.includes(Constants.NO_FLUFF_JOBS):
                return JobAdSource.NO_FLUFF_JOBS;
            case url.includes(Constants.QREER):
                return JobAdSource.QREER;
            case url.includes(Constants.SIMPLY_HIRED):
                return JobAdSource.SIMPLY_HIRED;
            case url.includes(Constants.SNAPHUNT):
                return JobAdSource.SNAPHUNT;
            case url.includes(Constants.TYBA):
                return JobAdSource.TYBA;
            case url.includes(Constants.WE_WORK_REMOTELY):
                return JobAdSource.WE_WORK_REMOTELY;
            default:
                return JobAdSource.UNKNOWN;
        }
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
