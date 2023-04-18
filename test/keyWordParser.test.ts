import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from '../src/database/models/job';
import constants from '../src/helpers/constants';
import KeyWordParser from '../src/dataLayer/parsers/valueParsers/keyWordParser';

_chai.should();

@suite
class KeyWordParserTests {
    private keyWordParser: KeyWordParser = new KeyWordParser();

    private getTestData() {
        return {
            jobTitle: 'Some job title',
            description: 'This is a job description: david@david.com. There are also some skills present:\n \
                Python,react.js,node.js,c#,c,.david2@david.com'
        } as Job;
    }

    /**
   * @description Checks if two string sets contain the same elements, and only those.
   * @param {Set<string>} xs
   * @param {Set<string>} ys
   * @returns {boolean}
   */
    private eqEmailSet = (xs: Set<string>, ys: Set<string>): boolean =>
        xs.size === ys.size &&
        [...xs].every((x) => ys.has(x));

    

    @test
    parseEmailAndSkillsFromDescription() {
        let testData = this.getTestData();

        this.keyWordParser.parseKeyWords(testData.description, testData);
        let contactEmails = testData.contactEmails?.split(constants.COMPOSITION_DELIMITER);
        let techTags = testData.techTags?.split(constants.COMPOSITION_DELIMITER);

        expect(this.eqEmailSet(new Set(contactEmails), new Set(['david@david.com', 'david2@david.com']))).to.be.equal(true);
        expect(this.eqEmailSet(new Set(techTags), new Set(['python', 'react.js', 'node.js', 'c#']))).to.be.equal(true);
    }

    @test
    parseEmailAndSkillsFromDescription2() {
        let testData = this.getTestData();
        testData.description = 'This is a job description:.david@david.com. There are also some skills present:\n \
        Python,react,react.js,node.js,c#,c,angularjs,angular,angular4. david2@david.com.'

        this.keyWordParser.parseKeyWords(testData.description, testData);
        let contactEmails = testData.contactEmails?.split(constants.COMPOSITION_DELIMITER);
        let techTags = testData.techTags?.split(constants.COMPOSITION_DELIMITER);

        expect(this.eqEmailSet(new Set(contactEmails), new Set(['david@david.com', 'david2@david.com']))).to.be.equal(true);
        expect(this.eqEmailSet(new Set(techTags), new Set(
            ['python', 'react.js', 'react', 'angularjs', 'angular4', 'angular', 'node.js', 'c#']
        ))).to.be.equal(true);
    }

    @test
    parseAreasOfInterestFromDescription() {
        let testData = this.getTestData();
        testData.description = 'This is a job description:.david@david.com. There are also some skills present:\n \
        Python,react,react.js,node.js,c#,c,angularjs,angular,angular4. david2@david.com. quantitative software engineer';

        this.keyWordParser.parseKeyWords(testData.description, testData);
        let contactEmails = testData.contactEmails?.split(constants.COMPOSITION_DELIMITER);
        let techTags = testData.techTags?.split(constants.COMPOSITION_DELIMITER);
        let areasOfInterest = testData.interestTags?.split(constants.COMPOSITION_DELIMITER);

        expect(this.eqEmailSet(new Set(contactEmails), new Set(['david@david.com', 'david2@david.com']))).to.be.equal(true);
        expect(this.eqEmailSet(new Set(techTags), new Set(
            ['python', 'react.js', 'react', 'angularjs', 'angular4', 'angular', 'node.js', 'c#']
        ))).to.be.equal(true);
        expect(this.eqEmailSet(new Set(areasOfInterest), new Set(['quantitative', 'software engineer']))).to.be.equal(true);
    }
}
