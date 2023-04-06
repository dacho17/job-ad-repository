import { Inject, Service } from "typedi";
import { Job } from "../../database/models/job";
import { Organization } from "../../database/models/organization";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import Utils from "../../helpers/utils";
import IParser from "../interfaces/IJobParser";

@Service()
export default class ArbeitNowJobParser implements IParser {
    private trie: TrieNode;
    @Inject()
    private utils: Utils;

    // within the constructor, the trie which parser uses is constructed
    constructor() {
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        ['- remote', 'remote'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.IS_REMOTE);
        });
        this.trie.addEntry('student', TrieWordType.IS_STUDENT);
        ['mid-senior', 'junior', 'senior'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SENIORITY);
        });
        ['full time', 'full-time', 'permanent', 'part time', 'part-time'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.TIME_ENGAGEMENT);
        });
        this.trie.addEntry('salary icon', TrieWordType.REDUNDANT);
        this.trie.addEntry(' (eur)', TrieWordType.REDUNDANT);
    }

    /**
   * @description Entry function for parsing ArbeitNow Job entry.
   * @param {Job} job
   * @param {Organization?} job
   * @returns {Job}
   */
    public parseJob(job: Job): Job {
        if (job.organization) {
            this.parseOrganizationName(job, job.organization);
        }

        this.parseJobDetails(job);
        job.organization = job.organization;

        this.parseSalary(job);

        return job;
    }

    /**
   * @description Function that accepts the job to be scraped. The function attempts to scrape properties:
   * isRemote from organizationName and update the organization name to the value without the remote flag.
   * @param {Job} job
   * @returns {void}
   */
    private parseOrganizationName(job: Job, organization: Organization): void {
        let finalCompanyNameRev = constants.EMPTY_STRING;
        let matchingPartRev = constants.EMPTY_STRING;
        let trieMatch = null;
        for (let i = 0; i < organization.name.length; i++) {
            const currentLowerCasedToken = organization.name[i].toLowerCase();
            if (trieMatch) {
                trieMatch = trieMatch.matchToken(currentLowerCasedToken);
            } else {
                trieMatch = this.trie.matchToken(currentLowerCasedToken);
            }

            if (!trieMatch) {
                finalCompanyNameRev = matchingPartRev + finalCompanyNameRev;
                matchingPartRev = constants.EMPTY_STRING;
            } else {
                matchingPartRev = organization.name[i] + matchingPartRev;

                if (trieMatch.getWordType() === TrieWordType.IS_REMOTE) {   // remote found and resetting all values
                    matchingPartRev = constants.EMPTY_STRING;
                    trieMatch = null;
                    job.isRemote = true;
                }
            }
        }

        organization.name = this.utils.reverseString(finalCompanyNameRev);
    }

    /**
   * @description Function that accepts the job to be scraped. The function attempts to scrape properties:
   * isRemote, isStudentPosition, requiredSkills and timeEngagement.
   * @param {Job} job
   * @returns {void}
   */
    private parseJobDetails(job: Job): void {
        let finalJobDetailsRev = constants.EMPTY_STRING;
        let matchingPartRev = constants.EMPTY_STRING;
        let keyWordCandidate = constants.EMPTY_STRING;  // in this case looking at '- remote'
        let trieMatch = null;
        let isPrevTokenWhitespace = false;
        const timeEngagementLabels = [];
        const requiredExperienceLabels = [];
        let salaryIconDetected = false; // when this part is detected the scraping ends
        let jobDetails = job.details;
        console.log(`job details before parsing = ${jobDetails}`);
        if (jobDetails) {
            for (let i = 0; i < jobDetails.length; i++) {
                const curToken = jobDetails[i].toLowerCase();
                const tokenToSet = jobDetails[i] === '\n' ? constants.WHITESPACE : jobDetails[i];
                if (curToken)
                if (curToken === constants.WHITESPACE) {
                    if (isPrevTokenWhitespace) {
                        matchingPartRev = constants.EMPTY_STRING;
                        keyWordCandidate = constants.EMPTY_STRING;
                        trieMatch = null;
                        continue;
                    }
                    isPrevTokenWhitespace = true;
                }
                isPrevTokenWhitespace = false;
                
                if (trieMatch) {
                    trieMatch = trieMatch.matchToken(curToken);
                } else {
                    trieMatch = this.trie.matchToken(curToken);
                }
    
                
                if (!trieMatch) {
                    finalJobDetailsRev = tokenToSet + matchingPartRev + finalJobDetailsRev;
                    matchingPartRev = constants.EMPTY_STRING;
                    keyWordCandidate = constants.EMPTY_STRING;
                } else {
                    matchingPartRev = tokenToSet + matchingPartRev;
                    keyWordCandidate += trieMatch.getValue();
    
                    let matched = false;
                    switch(trieMatch.getWordType()) {
                        case TrieWordType.IS_REMOTE:
                            job.isRemote = true;
                            matched = true;
                            break;
                        case TrieWordType.IS_STUDENT:
                            job.isStudentPosition = true;
                            matched = true;
                            break;
                        case TrieWordType.SENIORITY:
                            requiredExperienceLabels.push(keyWordCandidate);
                            matched = true;
                            break;
                        case TrieWordType.TIME_ENGAGEMENT:
                            timeEngagementLabels.push(keyWordCandidate.replace(constants.WHITESPACE, constants.MINUS_SIGN));
                            matched = true;
                            break;
                        case TrieWordType.REDUNDANT:
                            salaryIconDetected = true;
                            break;
                        default:
                            matched = false;
                    }

                    if (salaryIconDetected) break;

                    if (matched) {
                        matchingPartRev = constants.EMPTY_STRING;
                        keyWordCandidate = constants.EMPTY_STRING;
                        trieMatch = null;
                    }
                }
            }

            job.timeEngagement = timeEngagementLabels.join(constants.COMMA + constants.WHITESPACE);
            job.requiredExperience = requiredExperienceLabels.join(constants.COMMA + constants.WHITESPACE);
            job.details = this.utils.reverseString(finalJobDetailsRev);
            console.log(`Job details after parsing: ${job.details}`);
        }
    }

    /**
   * @description Function that accepts the job to be scraped. The function attempts to scrape salary property,
   * and formats it to <x EUR/timeframe> or <x-y EUR/timeframe> (e.g. 3.000-4.500 EUR/month).
   * @param {Job} job
   * @returns {void}
   */
    private parseSalary(job: Job): void {
        if (!job.salary) return;

        let finalSalary = null;
        let nOfDigitsBeforeDot = 0;
        let nOfDigitsAfterDot = 0;
        let dotSeen = false;
        let salaryNumberCandidateRev = constants.EMPTY_STRING;
        let wageRatePeriod = null;
        for (let i = 0; i < job.salary.length; i++) {
            const currentToken = job.salary[i].toLowerCase();
            if (currentToken === '(') break;

            if (currentToken === constants.DOT) {
                salaryNumberCandidateRev = currentToken + salaryNumberCandidateRev;
                dotSeen = true;
                continue;
            }

            const numCurrentToken = parseInt(currentToken);
            if (!isNaN(numCurrentToken)) {
                if(!dotSeen) {
                    nOfDigitsBeforeDot += 1;
                } else {
                    nOfDigitsAfterDot += 1;
                }
                salaryNumberCandidateRev = currentToken + salaryNumberCandidateRev;

                let isYearlyFormat = nOfDigitsBeforeDot > 1 && nOfDigitsAfterDot === 3;
                let isMonthlyFormat = nOfDigitsBeforeDot === 1 && nOfDigitsAfterDot === 3;
                if (isYearlyFormat || isMonthlyFormat) {
                    wageRatePeriod = isYearlyFormat ? 'EUR/year' : 'EUR/month';
                    console.log(`finalSalary is updated on: ${nOfDigitsBeforeDot}, ${nOfDigitsAfterDot}`);
                    if (finalSalary) {
                        finalSalary = salaryNumberCandidateRev + constants.MINUS_SIGN + finalSalary;
                    } else {
                        finalSalary = salaryNumberCandidateRev;
                    }

                    salaryNumberCandidateRev = constants.EMPTY_STRING;
                    nOfDigitsBeforeDot = 0;
                    nOfDigitsAfterDot = 0;
                    dotSeen = false;
                }

                continue;
            }

            if (isNaN(numCurrentToken) && nOfDigitsBeforeDot > 0) {
                wageRatePeriod = 'hour';
                if (finalSalary) {
                    finalSalary = salaryNumberCandidateRev + constants.MINUS_SIGN + finalSalary;
                } else {
                    finalSalary = salaryNumberCandidateRev;
                }
            }

            salaryNumberCandidateRev = constants.EMPTY_STRING;
            nOfDigitsBeforeDot = 0;
            nOfDigitsAfterDot = 0;
            dotSeen = false;
            
        }

        job.salary = finalSalary ? this.utils.reverseString(finalSalary) + constants.WHITESPACE + wageRatePeriod : undefined;
    }
}
