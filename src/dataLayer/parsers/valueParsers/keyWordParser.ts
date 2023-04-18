import { Service } from "typedi";
import { Job } from "../../../database/models/job";
import constants from "../../../helpers/constants";
import { TrieWordType } from "../../../helpers/enums/trieWordType";
import TrieNode from "../../../helpers/parser/trieNode";
import IKeyWordParser from "../../interfaces/IKeyWordParser";

interface WordMatch {
    word: string;
    type: TrieWordType;
    indexOfMatch: number;
}

@Service()
export default class KeyWordParser implements IKeyWordParser {
    private trie: TrieNode;

    constructor() {
        // adding "techTags"
        this.trie = new TrieNode(constants.EMPTY_STRING, []);
        ['nodejs', 'kubernetes', 'mongodb', 'redis', 'ansible', 'azure', 'powershell',
        'terraform', 'kafka', 'rabbitmq', 'spark', 'hadoop', 'golang', 'pyspark', 'nosql',
        'jenkins', 'groovy', 'power bi', 'php', 'kotlin', 'clojure', 'bigquery', 'redshift', 
        'gcp', 'json', 'elasticsearch', 'bigquery', 'airflow', 'graphql', 'cassandra', 'vue.js',
        'tensorflow', 'pytorch', 'mlops', 'mysql', 'postgresql', 'sql', 'jira', 'swift', 'ios', 'flutter',
        'ruby', 'angular4', 'docker', 'jquery', 'ajax', 'bash', 'reactjs', 'amazon dynamo', 'amazon s3', 'xml',
        'json', 'js', 'typescript', 'type script', 'visual basic', 'j2ee', 'c#', 'c #', 'c sharp', '.net', 'css',
        'html', 'angular', 'angularjs', 'angular.js', 'linux', 'power bi', 'scala', 'javascript', 'amazon web services',
        'bitbucket', 'node.js', 'python', 'react', 'react.js', 'c++', 'git', 'django', 'flask', 'java', 'devops', 'oracle', 
        'tabelau', 'algorithm', 'artifactory', 'database', 'embedded', 'snowflake', 'etl', 'aws', 'ssis'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.TECH_SKILL);
        });

        // adding "interestTags"
        ['software engineer', 'computer science', 'data engineer', 'data scientist', 'developer', 'cloud engineer',
        'cloud computing', 'cloud infrastructure', 'deep learning', 'machine learning', 'architect', 'artificial intelligence',
        'computer vision', 'ml', 'qa', 'big data', 'network security', 'cyber security', 'quant', 'quantitative',
        'data management', 'data warehouse', 'oop', 'agile', 'iot'].forEach(entry => {
            this.trie.addEntry(entry, TrieWordType.AREA_OF_INTEREST);
        });

        // adding "devStack"
        // ['backend', 'back end', 'back-end', 'frontend', 'front end', 'front-end', 'full stack', 'fullstack', 'full-stack']
        // .forEach(entry => {
        //     this.trie.addEntry(entry, TrieWordType.DEV_STACK);
        // })
    }

    /**
   * @description Function parses and collects contactEmails, techTags, and interestTags from the string passed as an argument.
   * The function sets those properties for the job passed as an argument.
   * @param {string} inputString
   * @param {Job} job
   * @returns {void}
   */
    public parseKeyWords(inputString: string, job: Job): void {
        if (!inputString) return;
        
        let skills = new Set<string>();
        let emails = new Set<string>();
        let areasOfInterest = new Set<string>();
        
        let curMatch = null;
        let passedWordMatch: WordMatch | null = null;
        let matchedWordRev = constants.EMPTY_STRING;
        for(let i = 0; i < inputString.length; i++) {
            if (inputString[i] === '@') {
                const [email, continueIndex] = this.parseTheEmail(i, inputString);
                emails.add(email);
                i = continueIndex;
                continue;
            }

            const curToken = inputString[i].toLowerCase();
            if (!curMatch) {
                curMatch = this.trie.matchToken(curToken);
                matchedWordRev = curToken;
                continue;
            } 
            
            curMatch = curMatch.matchToken(curToken);

            if (!curMatch) {
                matchedWordRev = constants.EMPTY_STRING;
                if (passedWordMatch) {
                    switch(passedWordMatch.type) {
                        case TrieWordType.TECH_SKILL:
                            skills.add(passedWordMatch.word);
                            break;
                        case TrieWordType.AREA_OF_INTEREST:
                            areasOfInterest.add(passedWordMatch.word);
                            break;
                    }

                    i = passedWordMatch.indexOfMatch;
                    passedWordMatch = null;
                } else {
                    curMatch = this.trie.matchToken(curToken);
                    matchedWordRev = curToken;
                }

                continue;
            }

            if (curMatch) {
                matchedWordRev = curToken + matchedWordRev;
                const wordType = curMatch.getWordType();
                switch (wordType) {
                    case TrieWordType.NONE:
                        break;
                    case TrieWordType.TECH_SKILL:
                    case TrieWordType.AREA_OF_INTEREST:
                        passedWordMatch = {
                            word: this.reverseString(matchedWordRev),
                            type: wordType,
                            indexOfMatch: i
                        };
                        break;    
                }
            }
        }

        // if there is a remaining word which matched but was not added to the sets
        if (passedWordMatch) {
            switch(passedWordMatch.type) {
                case TrieWordType.TECH_SKILL:
                    skills.add(passedWordMatch.word);
                    break;
                case TrieWordType.AREA_OF_INTEREST:
                    areasOfInterest.add(passedWordMatch.word);
                    break;
            }
        }

        job.contactEmails = Array.from(emails).join(constants.COMPOSITION_DELIMITER);
        job.techTags = Array.from(skills).join(constants.COMPOSITION_DELIMITER);
        job.interestTags = Array.from(areasOfInterest).join(constants.COMPOSITION_DELIMITER);
    }

     /**
   * @description Function calls two string traversal functions going forwards or backwards from the symbol '@'.
   * The function returns the parsed email and the index of the passed in string (description) on which the email ends.
   * @param {number} curIndex
   * @param {string} description
   * @returns {[string, number]}
   */
    private parseTheEmail(curIndex: number, description: string): [string, number] {
        const partBeforeAt = this.parseEmailPart(curIndex - 1, -1, description);
        const partAfterAt = this.parseEmailPart(curIndex + 1, 1, description);

        return [`${partBeforeAt}@${partAfterAt}`, curIndex + partAfterAt.length];
    }

    /**
   * @description Function traverses the string forwards or backwards while not crossing the beginning/end of the string.
   * It looks at the current character, if unallowed character the traverse stops, and checks if the invalid dot is present
   * at the end side of the string. The function returns the part of the email from '@' to the beginning/end of the email.
   * @param {number} startIndex
   * @param {number} increment
   * @param {string} jobDesription
   * @returns {string}
   */
    private parseEmailPart(startIndex: number, increment: number, jobDesription: string): string {
        const descriptionLength = jobDesription.length;
        const allowedChars = new Set(['!', '#', '$', '%', '&', '\'', '*', '+', '-', '/', '=', '?', '^', '_', '`', '{', '|', '}', '~', '.']);
        let canContinue = (curIndex: number, value: string) => {
            let withinAllowedIndices = 0 <= curIndex && curIndex < descriptionLength;
            let isAllowedChar = /[a-zA-Z]/.test(value) || /[0-9]/.test(value) || allowedChars.has(value);
            return withinAllowedIndices && isAllowedChar;
        }
        let emailPart = "";
        for (let i = startIndex; canContinue(i, jobDesription[i]); i += increment) {
                emailPart = jobDesription[i] + emailPart;
        }

        if (emailPart[0] === '.') {
            emailPart = emailPart.replace(".", "");
        }
        if (increment === 1) {
            emailPart = this.reverseString(emailPart);
        }
        
        return emailPart;
    }

    /**
     * @description Function that reverses the passed string and returns it.
     * @param {string} str
     * @returns {string}
     */
    private reverseString(str: string): string {
        let reversedString = constants.EMPTY_STRING;
        for (let i = 0; i < str.length; i++) {
            reversedString = str[i] + reversedString;
        }
        return reversedString;
    }
}
