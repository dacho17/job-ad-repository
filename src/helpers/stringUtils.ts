import constants from "./constants";

/**
* @description Function that reverses the passed string and returns it.
* @param {string} str
* @returns {string}
*/
export function reverseString(str: string): string {
    let reversedString = constants.EMPTY_STRING;
    for (let i = 0; i < str.length; i++) {
        reversedString = str[i] + reversedString;
    }
    return reversedString;
}
