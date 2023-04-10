import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";
import CommonJobParser from "./commonParser";


@Service()
export default class WeWorkRemotelyJobParser extends CommonJobParser implements IJobParser {
    private trie: TrieNode;

    constructor() {
        super();
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        this.trie.addEntry('or more ', TrieWordType.MORE_EQUAL_COMPARATOR);
    }
    
    public parseJob(job: Job): Job {
        this.formatSalary(job);
        if (!job.salary) this.parseSalaryFrom(job, job.jobTitle);
        if (!job.salary) this.parseSalaryFrom(job, job.details);

        this.parseValue(job.jobTitle, job);
        return job;
    }

    /**
   * @description Function that accepts the job to be parsed. The function attempts to parse salary property,
   * and formats it to <x USD/timeframe> or <x-y USD/timeframe> (e.g. 3.000-4.500 USD/month).
   * @param {Job} job
   * @returns {void}
   */
    private formatSalary(job: Job): void {
        if (!job.salary) return;

        let finalSalary = null;
        let nOfDigitsBeforeDot = 0;
        let nOfDigitsAfterDot = 0;
        let dotSeen = false;
        let salaryNumberCandidateRev = constants.EMPTY_STRING;
        let matchingPartRev = constants.EMPTY_STRING;
        let wageRatePeriod = null;
        let trieMatch = null;
        let salaryPrefix = constants.EMPTY_STRING;
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

                if (trieMatch.getWordType() === TrieWordType.MORE_EQUAL_COMPARATOR) {
                    salaryPrefix = constants.PLUS_SIGN;
                    matchingPartRev = constants.EMPTY_STRING;
                    trieMatch = null;
                    continue;
                }
            }

            if (currentToken === constants.DOT || currentToken === constants.COMMA) {
                salaryNumberCandidateRev = constants.DOT + salaryNumberCandidateRev;
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
                    wageRatePeriod = isYearlyFormat 
                        ? constants.USD.toUpperCase() + constants.SLASH + constants.YEAR 
                        : constants.USD.toUpperCase() + constants.SLASH + constants.MONTH;

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
                wageRatePeriod = constants.USD + constants.SLASH + constants.HOUR;
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

        job.salary = finalSalary ? salaryPrefix + reverseString(finalSalary) + constants.WHITESPACE + wageRatePeriod : undefined;
    }


    private parseJobDetails(job: Job): void {
        // salary can be parsed $50,000 - $74,999 USD, $100,000 or more USD, 
    }
}
