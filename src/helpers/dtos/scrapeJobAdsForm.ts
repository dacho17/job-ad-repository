export class ScrapeJobAdsForm {
    jobTitle: string;
    reqNOfAds: number;
    location?: string;
    scrapeOnlyRemote?: boolean;

    constructor(jobTitle: string, reqNOfAds: number, location: string, scrapeOnlyRemote: boolean) {
        this.jobTitle = jobTitle;
        this.reqNOfAds = reqNOfAds;
        this.location = location;
        this.scrapeOnlyRemote = scrapeOnlyRemote;
    }
}
