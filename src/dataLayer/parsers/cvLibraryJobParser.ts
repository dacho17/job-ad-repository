import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";
import CommonJobParser from "./commonParser";


@Service()
export default class CvLibraryJobParser extends CommonJobParser implements IJobParser {
    private trie: TrieNode;
    private M: string = 'm';

    constructor() {
        super();
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        // this.trie.addEntry('remote', TrieWordType.IS_REMOTE);
        // this.trie.addEntry('hybrid', TrieWordType.IS_HYBRID);
        ['annum', 'day'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.SALARY_PERIOD);
        });
    }

    public parseJob(job: Job): Job {
        this.parseSalaryAndBenefits(job);
        if (!job.salary) this.parseSalaryFrom(job, job.jobTitle);
        if (!job.salary) this.parseSalaryFrom(job, job.details);

        this.parseValue(job.jobTitle, job);
        return job;
    }

//     /**
//    * @description Function that accepts the job to be parsed. The function attempts to parsepe properties:
//    * isHybrid and isRemote from the jobtitle, and update the job title to the value without those flags.
//    * @param {Job} job
//    * @returns {void}
//    */
//     private parseJobTitle(job: Job): void {
//         let finalJobTitleRev = constants.EMPTY_STRING;
//         let matchingPartRev = constants.EMPTY_STRING;
//         let trieMatch = null;
//         for (let i = 0; i < job.jobTitle.length; i++) {
//             const currentLowerCasedToken = job.jobTitle[i].toLowerCase();
            
//             if (trieMatch) {    // attempting to continue with the current matching sequence
//                 trieMatch = trieMatch.matchToken(currentLowerCasedToken);
//             }
//             if (!trieMatch) {   // current matching sequence unmatched further. Attempting to match a new one
//                 finalJobTitleRev = matchingPartRev + finalJobTitleRev;
//                 matchingPartRev = constants.EMPTY_STRING;
//                 trieMatch = this.trie.matchToken(currentLowerCasedToken);
//             }

//             if (!trieMatch) {
//                 finalJobTitleRev = job.jobTitle[i] + finalJobTitleRev;
//                 matchingPartRev = constants.EMPTY_STRING;
//             } else {
//                 matchingPartRev = job.jobTitle[i] + matchingPartRev;

//                 switch(trieMatch.getWordType()) {
//                     case TrieWordType.IS_HYBRID:
//                         job.isHybrid = true;
//                         matchingPartRev = constants.EMPTY_STRING
//                         break;
//                     case TrieWordType.IS_REMOTE:
//                         job.isRemote = true;
//                         matchingPartRev = constants.EMPTY_STRING
//                         break;
//                 }
//             }
//         }

//         job.jobTitle = reverseString(matchingPartRev + finalJobTitleRev.trimStart());
//     }

     /**
   * @description Function that accepts the job to be parsed. The function attempts to parse salary property,
   * and formats it to <x GBP/timeframe> or <x-y GBP/timeframe> (e.g. 3.000-4.500 GBP/year). If there is an 
   * addition to the usual salary format, it is added to the benefits property.
   * @param {Job} job
   * @returns {void}
   */
    private parseSalaryAndBenefits(job: Job): void {
        // - <$x/annum> or <$x/day>
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
        let benefitsRev = constants.EMPTY_STRING;
        for (let i = 0; i < job.salary.length; i++) {
            const currentToken = job.salary[i].toLowerCase();
            if (salaryPeriodRev) {
                if (!(job.salary[i] === constants.WHITESPACE && constants.EMPTY_STRING === benefitsRev)) {
                    benefitsRev = job.salary[i] + benefitsRev;
                }
                continue;
            }
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
                    if (salaryPeriodRev[0] === this.M) salaryPeriodRev = reverseString(constants.YEAR);
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
            + reverseString(constants.GBP.toUpperCase()) + constants.WHITESPACE + finalSalary;
        job.salary = finalSalary ? reverseString(finalSalaryOutput) : undefined;
        job.benefits = benefitsRev ? reverseString(benefitsRev) : undefined;
    }
}
