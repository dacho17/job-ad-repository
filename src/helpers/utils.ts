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

    // TODO: write the doc for the method. Needs to contain the description of the parameter received (expected format)
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
}
