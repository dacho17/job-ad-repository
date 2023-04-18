import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import KeyWordParser from '../src/dataLayer/parsers/valueParsers/keyWordParser';
import WeWorkRemotelyJobParser from '../src/dataLayer/parsers/weWorkRemotelyJobParser';

_chai.should();

@suite
class WeWorkRemotelyJobParserTests {
  private careerBuilderJobParser: WeWorkRemotelyJobParser = new WeWorkRemotelyJobParser();
  private testData: Job = {
      jobTitle: 'Python Developer (hybrid)',
      organization: {
        name: 'AssemblyAI - Remote ',
        location: 'Work From Home, VA (Hybrid)',
      } as Organization,
      salary: '$100,000 or more USD',   
    } as Job;

  private getTestData() {
    return {
      jobTitle: this.testData.jobTitle,
      organization: this.testData.organization,
      details: this.testData.details,
      salary: this.testData.salary
    } as Job;
  }

  @test 
  formatSalary1() {
    let testData = this.getTestData();
    
    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('+100.000 USD/year');
  }

  @test 
  formatSalary2() {
    let testData = this.getTestData();
    testData.salary = '$50,000 - $74,999 USD';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('50.000-74.999 USD/year');
  }
}
