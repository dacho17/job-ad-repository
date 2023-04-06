import { Service } from "typedi";
import { Job } from "../../database/models/job";
import { Organization } from "../../database/models/organization";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import IParser from "../interfaces/IJobParser";

@Service()
export default class ArbeitNowJobParser implements IParser {
    private trie: TrieNode;

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
    }

    /**
   * @description Entry function for parsing ArbeitNow Job entry.
   * @param {Job} job
   * @param {Organization?} job
   * @returns {Job}
   */
    public parseJob(job: Job, organization?: Organization): Job {
        if (organization) {
            this.parseOrganizationName(job, organization);
        }

        this.parseJobDetails(job);
        job.organization = organization;

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

        organization.name = this.reverseString(finalCompanyNameRev);
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
            job.details = this.reverseString(finalJobDetailsRev);
            console.log(`Job details after parsing: ${job.details}`);
        }
    }

    private reverseString(str: string) {
        let reversedString = constants.EMPTY_STRING;
        for (let i = 0; i < str.length; i++) {
            reversedString = str[i] + reversedString;
        }
        return reversedString;
    }
}
