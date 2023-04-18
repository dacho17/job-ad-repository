import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
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

        const [skills, emails] = this.keyWordParser.parseEmailAndSkills(testData.description);
        console.log(skills);

        expect(this.eqEmailSet(emails, new Set(['david@david.com', 'david2@david.com']))).to.be.equal(true);
        expect(this.eqEmailSet(skills, new Set(['python', 'react.js', 'node.js', 'c#']))).to.be.equal(true);
    }

    @test
    parseEmailAndSkillsFromDescription2() {
        let testData = this.getTestData();
        testData.description = 'This is a job description:.david@david.com. There are also some skills present:\n \
        Python,react,react.js,node.js,c#,c,angularjs,angular,angular4. david2@david.com.'

        const [skills, emails] = this.keyWordParser.parseEmailAndSkills(testData.description);
        console.log(skills);
        console.log(emails);

        expect(this.eqEmailSet(emails, new Set(['david@david.com', 'david2@david.com']))).to.be.equal(true);
        expect(this.eqEmailSet(skills, new Set(
            ['python', 'react.js', 'react', 'angularjs', 'angular4', 'angular', 'node.js', 'c#']
        ))).to.be.equal(true);
    }
}
