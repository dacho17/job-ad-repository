import { Service } from "typedi";
import { Job } from "../../database/models/job";
import constants from "../../helpers/constants";
import { TrieWordType } from "../../helpers/enums/trieWordType";
import TrieNode from "../../helpers/parser/trieNode";
import { reverseString } from "../../helpers/stringUtils";
import IJobParser from "../interfaces/IJobParser";


@Service()
export default class CvLibraryJobParser implements IJobParser {
    private trie: TrieNode;

    constructor() {
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        this.trie.addEntry('remote', TrieWordType.IS_REMOTE);
        this.trie.addEntry('hybrid', TrieWordType.IS_HYBRID);
    }

    public parseJob(job: Job): Job {
        this.parseJobTitle(job);

        return job;
    }

    /**
   * @description Function that accepts the job to be scraped. The function attempts to scrape properties:
   * isHybrid and isRemote from the jobtitle, and update the job title to the value without those flags.
   * @param {Job} job
   * @returns {void}
   */
    private parseJobTitle(job: Job): void {
        let finalJobTitleRev = constants.EMPTY_STRING;
        let matchingPartRev = constants.EMPTY_STRING;
        let trieMatch = null;
        for (let i = 0; i < job.jobTitle.length; i++) {
            const currentLowerCasedToken = job.jobTitle[i].toLowerCase();
            
            if (trieMatch) {    // attempting to continue with the current matching sequence
                trieMatch = trieMatch.matchToken(currentLowerCasedToken);
            }
            if (!trieMatch) {   // current matching sequence unmatched further. Attempting to match a new one
                finalJobTitleRev = matchingPartRev + finalJobTitleRev;
                matchingPartRev = constants.EMPTY_STRING;
                trieMatch = this.trie.matchToken(currentLowerCasedToken);
            }

            if (!trieMatch) {
                finalJobTitleRev = job.jobTitle[i] + finalJobTitleRev;
                matchingPartRev = constants.EMPTY_STRING;
            } else {
                matchingPartRev = job.jobTitle[i] + matchingPartRev;

                switch(trieMatch.getWordType()) {
                    case TrieWordType.IS_HYBRID:
                        job.isHybrid = true;
                        break;
                    case TrieWordType.IS_REMOTE:
                        job.isRemote = true;
                        break;
                }
            }
        }

        job.jobTitle = reverseString(finalJobTitleRev.trimStart());
    }
}
