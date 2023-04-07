import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import ArbeitNowJobParser from '../src/dataLayer/parsers/arbeitNowJobParser';

_chai.should();

@suite
class ArbeitNowJobParserTests {
  private arbeitNowJobParser: ArbeitNowJobParser = new ArbeitNowJobParser();
  private testData: Job = {
      jobTitle: 'Chef',
      organization: {
        name: 'AssemblyAI - Remote '
      } as Organization,
      details: 'Remote      Software  Development   Salary Icon     4.000 (EUR)',
      salary: '17 (EUR)'
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
  setIsRemoteAndFormatDetails() {
    let testData = this.getTestData();

    this.arbeitNowJobParser.parseJob(testData);

    expect(testData.organization.name).to.be.equal('AssemblyAI')
    expect(testData.isRemote).to.be.equal(true);  
  }

  @test
  setIsRemoteAndFormatSalary() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';  // ensuring '- Remote' in organization.name is not affecting the outcome of isRemote flag

    this.arbeitNowJobParser.parseJob(testData);

    expect(testData.isRemote).to.be.equal(true);
    expect(testData.details).to.be.equal('Software Development');
  }


  @test 
  setIsRemoteReqExpTimeEng() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';
    testData.details = 'Remote     information technology and services   engineering   Mid-senior    full time';

    this.arbeitNowJobParser.parseJob(testData);

    expect(testData.isRemote).to.be.equal(true);
    expect(testData.details).to.be.equal('information technology and services engineering');
    expect(testData.requiredExperience).to.include('mid-senior');
    expect(testData.timeEngagement).to.include('full-time');
  }

  @test 
  formatSalaries() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';
    
    testData.salary = '   12,5 - 14 (EUR)   ';
    this.arbeitNowJobParser.parseJob(testData);
    expect(testData.salary).to.be.equal('12,5-14 EUR/hour');

    testData.salary = '   4.000 (EUR)   ';
    this.arbeitNowJobParser.parseJob(testData);
    expect(testData.salary).to.be.equal('4.000 EUR/month');

    testData.salary = '   50.000 - 80.000 (EUR)   ';
    this.arbeitNowJobParser.parseJob(testData);
    expect(testData.salary).to.be.equal('50.000-80.000 EUR/year');
  }

  @test
  isRemoteSetAndJobDetailsFilteredOfSalary() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';  // ensuring '- Remote' in organization.name is not affecting the outcome of isRemote flag
    testData.details = 'Remote Software Development berufseinstieg Salary Icon 50.000 - 70.000 (EUR)';

    this.arbeitNowJobParser.parseJob(testData);

    expect(testData.isRemote).to.be.equal(true);
    expect(!testData.details.includes('Salary Icon')).to.be.equal(true);
  }
}
