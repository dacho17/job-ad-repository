import { Inject, Service } from "typedi";
import { Job } from "../../database/models/job";
import { Organization } from "../../database/models/organization";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from '../../helpers/stringUtils';
import IJobParser from "../interfaces/IJobParser";

@Service()
export default class CommonJobParser implements IJobParser {
    protected commonTrie: TrieNode;
    protected DOUBLE_ZERO: string = '00';
    protected ZEROES_DOT: string = '000.';
    protected K: string = 'k';

    // within the constructor, the commonTrie which parser uses is constructed
    constructor() {
        this.commonTrie = new TrieNode(constants.EMPTY_STRING, []);
        this.commonTrie.addEntry('remote', TrieWordType.IS_REMOTE);
        this.commonTrie.addEntry('graduat', TrieWordType.IS_STUDENT);
        this.commonTrie.addEntry('student', TrieWordType.IS_STUDENT);
        this.commonTrie.addEntry('training', TrieWordType.IS_TRAINING_PROVIDED);
        this.commonTrie.addEntry('hybrid', TrieWordType.IS_HYBRID);
        this.commonTrie.addEntry('intern', TrieWordType.IS_INTERNSHIP);
        this.commonTrie.addEntry('|| ', TrieWordType.REDUNDANT);  // redundant element for careerJet
        ['mid-senior', 'junior', 'senior'].forEach(entry => {
            this.commonTrie.addEntry(entry, TrieWordType.SENIORITY);
        });
        ['full time', 'full-time', 'permanent', 'part time', 'part-time', 'contract', 'temporary', 'seasonal'].forEach(entry => {
            this.commonTrie.addEntry(entry, TrieWordType.TIME_ENGAGEMENT);
        });
    }

    /**
   * @description Entry function for parsing ArbeitNow Job entry.
   * @param {Job} job
   * @param {Organization?} job
   * @returns {Job}
   */
    public parseJob(job: Job): Job {
        this.parseValue(job.jobTitle, job);

        if (job.details) {
            this.parseValue(job.details, job);
        }

        if (!job.salary) this.parseSalaryFrom(job, job.jobTitle);
        if (!job.salary) this.parseSalaryFrom(job, job.details);

        return job;
    }

    /**
   * @description Function that accepts the job to be parsed. The function attempts to parse properties:
   * isHybrid, isRemote, isStudent, isInternship, requiredExperience and salary. Further, 
   * with these values parsed it updates the corresponding properties.
   * @param {Job} job
   * @returns {void}
   */
    protected parseValue(valueToParse: string, job: Job): void {
        let matchingPartRev = constants.EMPTY_STRING;
        let seniorities = [];
        let timeEngagements = [];
        let commonTrieMatch = null;
        for (let i = 0; i < valueToParse.length; i++) {
            const currentLowerCasedToken = valueToParse[i].toLowerCase();
            
            if (commonTrieMatch) {    // attempting to continue with the current matching sequence
                commonTrieMatch = commonTrieMatch.matchToken(currentLowerCasedToken);
            }
            if (!commonTrieMatch) {   // current matching sequence unmatched further. Attempting to match a new one
                matchingPartRev = constants.EMPTY_STRING;
                commonTrieMatch = this.commonTrie.matchToken(currentLowerCasedToken);
            }

            if (!commonTrieMatch) {
                matchingPartRev = constants.EMPTY_STRING;
            } else {
                matchingPartRev = job.jobTitle[i] + matchingPartRev;

                switch(commonTrieMatch.getWordType()) {
                    case TrieWordType.IS_HYBRID:
                        job.isHybrid = true;
                        matchingPartRev = constants.EMPTY_STRING
                        break;
                    case TrieWordType.IS_INTERNSHIP:
                        job.isInternship = true;
                        matchingPartRev = constants.EMPTY_STRING
                        break;
                    case TrieWordType.IS_REMOTE:
                        job.isRemote = true;
                        matchingPartRev = constants.EMPTY_STRING
                        break;
                    case TrieWordType.IS_STUDENT:
                        job.isStudentPosition = true;
                        matchingPartRev = constants.EMPTY_STRING
                        break;
                    case TrieWordType.SENIORITY:
                        seniorities.push(reverseString(matchingPartRev));
                        matchingPartRev = constants.EMPTY_STRING;
                        break;
                    case TrieWordType.TIME_ENGAGEMENT:
                        timeEngagements.push(reverseString(matchingPartRev));
                        matchingPartRev = constants.EMPTY_STRING;
                        break;
                }
            }
        }

        job.requiredExperience = this.attachParsedValues(job.requiredExperience, seniorities);
        job.timeEngagement = this.attachParsedValues(job.timeEngagement, timeEngagements);
    }

    // could be divided into a separate 'Salary parser' with its own tracking properties
    protected parseSalaryFrom(job: Job, valueToParse?: string): void {
        if (!valueToParse) return;

        let finalSalary = constants.EMPTY_STRING;
        let nOfDigitsBeforeDot = 0;
        let nOfDigitsAfterDot = 0;
        let dotSeen = false;
        let matchingPartRev = constants.EMPTY_STRING;
        let salaryNumberCandidateRev = constants.EMPTY_STRING;
        let trieMatch: TrieNode | null = null;
        let salaryPeriodRev = null;
        let salaryPrefix = constants.EMPTY_STRING;
        for (let i = 0; i < valueToParse.length; i++) {
            const currentToken = valueToParse[i].toLowerCase();
            if (trieMatch) {
                trieMatch = trieMatch.matchToken(currentToken);
            }
            if (!trieMatch) {
                matchingPartRev = constants.EMPTY_STRING;
                trieMatch = this.commonTrie.matchToken(currentToken);
            }

            if (trieMatch) {
                matchingPartRev = currentToken + matchingPartRev;
            }

            if (currentToken === this.K && i > 0 && !isNaN(parseInt(valueToParse[i - 1]))) {
                if (i > 1 && (valueToParse[i - 2] === constants.DOT || valueToParse[i - 2] === constants.COMMA)) {
                    salaryNumberCandidateRev = this.DOUBLE_ZERO + salaryNumberCandidateRev;
                    nOfDigitsAfterDot += 2;

                } else {
                    salaryNumberCandidateRev = this.ZEROES_DOT + salaryNumberCandidateRev;
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

        const finalSalaryOutput = (salaryPeriodRev ? salaryPeriodRev + constants.SLASH : constants.EMPTY_STRING)
            + reverseString(constants.USD.toUpperCase()) + constants.WHITESPACE + finalSalary + salaryPrefix;
        job.salary = finalSalary ? reverseString(finalSalaryOutput) : undefined;
    }

    private attachParsedValues(stem: string | undefined, values: string[]): string {
        if (!stem) return values.join(constants.COMPOSITION_DELIMITER);
        let compositeValue = stem;
        values.forEach(element => {
            if (!compositeValue?.indexOf(element)) {
                compositeValue += constants.COMPOSITION_DELIMITER + element;
            }
        });

        return compositeValue;
    }
}
