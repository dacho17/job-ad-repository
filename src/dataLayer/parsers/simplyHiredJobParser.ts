import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";


@Service()
export default class SimplyhiredJobParser implements IJobParser {
    private trie: TrieNode;

    constructor() {
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        this.trie.addEntry('up to ', TrieWordType.LESS_EQUAL_COMPARATOR);
        this.trie.addEntry('from ', TrieWordType.MORE_EQUAL_COMPARATOR);
        this.trie.addEntry('estimated: ', TrieWordType.REDUNDANT);
        ['a year', 'a month', 'a week', 'an hour'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SALARY_PERIOD);
        });
    }
    
    public parseJob(job: Job): Job {
        this.formatsalary(job);

        return job;
    }

        /**
   * @description Function that accepts the job to be parsed. The function attempts to parse salary property,
   * and formats it to <x USD/timeframe> or <x-y USD/timeframe> (e.g. 3.000-4.500 USD/month).
   * @param {Job} job
   * @returns {void}
   */
    private formatsalary(job: Job): void {
        if (!job.salary) return;

        let finalSalary = constants.EMPTY_STRING;
        let nOfDigitsBeforeDot = 0;
        let nOfDigitsAfterDot = 0;
        let dotSeen = false;
        let matchingPartRev = constants.EMPTY_STRING;
        let salaryNumberCandidateRev = constants.EMPTY_STRING;
        let trieMatch = null;
        let salaryPeriodRev = null;
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

                switch (trieMatch.getWordType()) {
                    case TrieWordType.SALARY_PERIOD:
                        salaryPeriodRev = matchingPartRev.substring(0, matchingPartRev.indexOf(constants.WHITESPACE));
                        matchingPartRev = constants.EMPTY_STRING;
                        trieMatch = null;
                        break;
                    case TrieWordType.MORE_EQUAL_COMPARATOR:
                        salaryPrefix = constants.PLUS_SIGN;
                        matchingPartRev = constants.EMPTY_STRING;
                        trieMatch = null;
                        break;
                    case TrieWordType.LESS_EQUAL_COMPARATOR:
                        salaryPrefix = constants.EQUALS + constants.LESS_SIGN;
                        matchingPartRev = constants.EMPTY_STRING;
                        trieMatch = null;
                        break;
                }
            }

            if (job.salary[i] === 'K' && i > 0 && !isNaN(parseInt(job.salary[i - 1]))) {
                if (i > 1 && (job.salary[i - 2] === constants.DOT || job.salary[i - 2] === constants.COMMA)) {
                    salaryNumberCandidateRev = '00' + salaryNumberCandidateRev;
                    nOfDigitsAfterDot += 2;

                } else {
                    salaryNumberCandidateRev = '000.' + salaryNumberCandidateRev;
                    nOfDigitsAfterDot += 3;
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
                        finalSalary = salaryNumberCandidateRev + finalSalary;
                    }
                }
            }

            salaryNumberCandidateRev = constants.EMPTY_STRING;
            nOfDigitsBeforeDot = 0;
            nOfDigitsAfterDot = 0;
            dotSeen = false;
            
        }

        const finalSalaryOutput = (salaryPeriodRev ? salaryPeriodRev + '/' : constants.EMPTY_STRING)
            + 'DSU' + constants.WHITESPACE + finalSalary + salaryPrefix;
        job.salary = finalSalary ? reverseString(finalSalaryOutput) : undefined;
    }
}
