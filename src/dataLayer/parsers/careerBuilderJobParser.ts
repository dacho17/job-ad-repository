import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";
import CommonJobParser from "./commonParser";

@Service()
export default class CareerBuilderJobParser extends CommonJobParser implements IJobParser {
    private trie: TrieNode;

    constructor() {
        super()
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        this.trie.addEntry('onsite', TrieWordType.REDUNDANT);
        this.trie.addEntry('100% ', TrieWordType.REDUNDANT);
        this.trie.addEntry('hybrid', TrieWordType.IS_HYBRID);
        this.trie.addEntry('work from home, ', TrieWordType.IS_HYBRID);
        this.trie.addEntry('remote', TrieWordType.IS_REMOTE);
        this.trie.addEntry('(', TrieWordType.REDUNDANT);
        this.trie.addEntry(')', TrieWordType.REDUNDANT);
        this.trie.addEntry('.', TrieWordType.REDUNDANT);
        this.trie.addEntry('- eligible', TrieWordType.REDUNDANT);
        ['year', 'month', 'week', 'hour'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SALARY_PERIOD);
        });
    }

    public parseJob(job: Job): Job {
        this.parseSalary(job);
        if (!job.salary) this.parseSalaryFrom(job, job.jobTitle);
        if (!job.salary) this.parseSalaryFrom(job, job.details);
        
        this.parseOrganizationLocation(job);

        this.parseValue(job.jobTitle, job);
        return job;
    }

    /**
   * @description Function that accepts the job to be parsed. The function attempts to parse properties:
   * isRemote and isHybrid and update the organization location to the value without the remote flag.
   * @param {Job} job
   * @returns {void}
   */
    private parseOrganizationLocation(job: Job): void {
        if (!job.organization?.location) return;

        let finalCompanyLocRev = constants.EMPTY_STRING;
        let matchingPartRev = constants.EMPTY_STRING;
        let trieMatch = null;
        let stopParsing = false;    // stop parsing when (Remote) || (Onsite) || (Hybrid) is found
        for (let i = 0; i < job.organization.location.length; i++) {
            const currentLowerCasedToken = job.organization.location[i].toLowerCase();
            if (trieMatch) {    // attempting to continue with the current matching sequence
                trieMatch = trieMatch.matchToken(currentLowerCasedToken);
            }
            if (!trieMatch) {   // current matching sequence unmatched further. Attempting to match a new one
                finalCompanyLocRev = matchingPartRev + finalCompanyLocRev;
                matchingPartRev = constants.EMPTY_STRING;
                trieMatch = this.trie.matchToken(currentLowerCasedToken);
            }

            
            if (!trieMatch) {
                finalCompanyLocRev = job.organization.location[i] + finalCompanyLocRev;
                matchingPartRev = constants.EMPTY_STRING;
            } else {
                matchingPartRev = job.organization.location[i] + matchingPartRev;

                switch(trieMatch.getWordType()) {
                    case TrieWordType.IS_REMOTE:
                        stopParsing = true;
                        job.isRemote = true;
                        matchingPartRev = constants.EMPTY_STRING;
                        break;
                    case TrieWordType.IS_HYBRID:
                        stopParsing = true;
                        job.isHybrid = true;
                        matchingPartRev = constants.EMPTY_STRING;
                        break;
                    case TrieWordType.REDUNDANT:
                        stopParsing = true;
                        matchingPartRev = constants.EMPTY_STRING;
                        break;
                }

                // if (stopParsing) break;
            }
        }

        job.organization.location = reverseString(matchingPartRev + finalCompanyLocRev.trimStart());
    }

    /**
   * @description Function that accepts the job to be parsed. The function attempts to parse salary property,
   * and formats it to <x USD/timeframe> or <x-y USD/timeframe> (e.g. 3.000-4.500 USD/month).
   * @param {Job} job
   * @returns {void}
   */
    private parseSalary(job: Job): void {
        if (!job.salary) return;

        let finalSalary = null;
        let nOfDigitsBeforeDot = 0;
        let nOfDigitsAfterDot = 0;
        let dotSeen = false;
        let matchingPartRev = constants.EMPTY_STRING;
        let salaryNumberCandidateRev = constants.EMPTY_STRING;
        let trieMatch = null;
        let salaryPeriodRev = null;
        for (let i = 0; i < job.salary.length; i++) {
            const currentToken = job.salary[i].toLowerCase();
            if (trieMatch) {
                trieMatch = trieMatch.matchToken(currentToken);
            } else {
                trieMatch = this.trie.matchToken(currentToken);
            }

            if (!trieMatch) {
                matchingPartRev = constants.EMPTY_STRING;
            } else {
                matchingPartRev = currentToken + matchingPartRev;

                if (trieMatch.getWordType() === TrieWordType.SALARY_PERIOD) {
                    salaryPeriodRev = matchingPartRev;
                    matchingPartRev = constants.EMPTY_STRING;
                    trieMatch = null;
                }
            }

            if (currentToken === constants.DOT || currentToken === constants.COMMA) {
                salaryNumberCandidateRev = constants.DOT + salaryNumberCandidateRev;
                dotSeen = true;
                trieMatch = null;
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
                continue;
            }

            if (isNaN(numCurrentToken)) {
                if (nOfDigitsBeforeDot || nOfDigitsAfterDot) {  // the number is found
                    if (nOfDigitsAfterDot === 2) {
                        salaryNumberCandidateRev = salaryNumberCandidateRev.slice(3);   // remove . and decimal digits
                    }
                    if (finalSalary) {
                        finalSalary = salaryNumberCandidateRev + constants.MINUS_SIGN + finalSalary;
                    } else {
                        finalSalary = salaryNumberCandidateRev;
                    }
                }
            }

            salaryNumberCandidateRev = constants.EMPTY_STRING;
            nOfDigitsBeforeDot = 0;
            nOfDigitsAfterDot = 0;
            dotSeen = false;
            
        }

        const finalSalaryOutput = (salaryPeriodRev ? salaryPeriodRev + constants.SLASH : constants.EMPTY_STRING)
            + reverseString(constants.USD.toUpperCase()) + constants.WHITESPACE + finalSalary;
        job.salary = finalSalary ? reverseString(finalSalaryOutput) : undefined;
    }
}
