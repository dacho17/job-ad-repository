import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";
import CommonJobParser from "./commonParser";


@Service()
export default class CareerJetJobParser extends CommonJobParser implements IJobParser {
    private trie: TrieNode;

    constructor() {
        super();
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        this.trie.addEntry('(hybrid)', TrieWordType.IS_HYBRID);
        // this.trie.addEntry('|| ', TrieWordType.REDUNDANT);
        ['per year', 'per month', 'per week', 'per hour'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SALARY_PERIOD);
        });
    }

    public parseJob(job: Job): Job {
        this.formatsalary(job);
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
    private formatsalary(job: Job): void {
        // - <$x per year> or <$x per month> or <$x per hour>
        // - can be x-y instead of x
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
                    salaryPeriodRev = matchingPartRev.substring(0, matchingPartRev.indexOf(constants.WHITESPACE));
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

        if (finalSalary) {
            const finalSalaryOutput = (salaryPeriodRev ? salaryPeriodRev + constants.SLASH : constants.EMPTY_STRING)
                + reverseString(constants.USD.toUpperCase()) + constants.WHITESPACE + finalSalary;
            job.salary = reverseString(finalSalaryOutput);
        }
    }
}
