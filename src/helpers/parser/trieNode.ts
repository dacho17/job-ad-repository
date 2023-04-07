import constants from "../constants";
import { TrieWordType } from "../enums/trieWordType";

export default class TrieNode {
    private children: TrieNode[];
    private value: string;
    private wordType: TrieWordType = TrieWordType.NONE;
    
    constructor(value: string, children: TrieNode[]) {
        this.value = value;
        this.children = children;
    }

    /**
   * @description Getter for the value property
   * @returns {string}
   */
    public getValue(): string {
        return this.value;
    }

    /**
   * @description Getter for the wordType property
   * @returns {TrieWordType}
   */
    public getWordType(): TrieWordType {
        return this.wordType;
    }

    public setWordType(wordType: TrieWordType): void {
        this.wordType = wordType;
    }

    /**
   * @description Checks among children whether there is a node whose value matches the nodeValue.
   * @param {string} nodeValue
   * @returns {TrieNode | null}
   */
    public matchNextNode(nodeValue: string): TrieNode | null {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].getValue() === nodeValue) {
                return this.children[i];
            }
        }

        return null;
    }

    /**
   * @description A recursive function which ads word to this Trie and sets its wordType once added.
   * @param {string} word
   * @param {TrieWordType} wordType
   * @returns {void}
   */
    public addEntry(word: string, wordType: TrieWordType): void {
        const currLetter = word[0];
        let matchingChild = this.matchNextNode(currLetter);
        if (!matchingChild) {
            matchingChild = new TrieNode(currLetter, []);
            this.children.push(matchingChild);
        }

        if (currLetter === word) {
            matchingChild.setWordType(wordType);
            return;
        };

        matchingChild.addEntry(word.substring(1), wordType);
    }

    /**
   * @description A function which returns the child node of the Trie on which this function is called, and
   * such that the child's value matches the passed token.
   * @param {string} token
   * @returns {TrieNode | null}
   */
    public matchToken(token: string): TrieNode | null {
        let nextNode = this.matchNextNode(token);
        return nextNode;
    }

    public checkIfEntryPresent(word: string): [string, TrieWordType] {
        const curNodeValue = this.getValue();
        if (word === constants.EMPTY_STRING){
            return [curNodeValue, this.getWordType()];
        }
        let nextChild = this.matchNextNode(word[0]);
        if (!nextChild) return [curNodeValue, TrieWordType.NONE];

        const [aggVal, wordType] = nextChild.checkIfEntryPresent(word.substring(1));
        return [curNodeValue + aggVal, wordType];
    }
}
