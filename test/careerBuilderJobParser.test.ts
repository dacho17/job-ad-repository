import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import CareerBuilderParser from '../src/dataLayer/parsers/careerBuilderJobParser';

_chai.should();

@suite
class CareerBuilderJobParserTests {
  private careerBuilderJobParser: CareerBuilderParser = new CareerBuilderParser();
  private testData: Job = {
      jobTitle: 'Chef',
      organization: {
        name: 'AssemblyAI - Remote ',
        location: 'Work From Home, VA (Hybrid)',
      } as Organization,
      details: 'Remote      Software  Development   Salary Icon     4.000 (EUR)',
      salary: '$100,000 - $160,000/Year',
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
  setIsHybridAndFormatOrgLocation() {
    let testData = this.getTestData();

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.organization.location).to.be.equal('Work From Home, VA');
    expect(testData.isHybrid).to.be.equal(true);
  }

  @test
  setIsRemoteAndFormatOrgLocation() {
    let testData = this.getTestData();
    testData.organization.location = 'Los Angeles, CA (Remote)';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.organization.location).to.be.equal('Los Angeles, CA');
    expect(testData.isRemote).to.be.equal(true);
  }


  @test 
  formatSalary1() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('100.000-160.000 USD/year');
  }

  @test 
  formatSalary2() {
    let testData = this.getTestData();
    testData.organization.name = 'Not remote';
    testData.salary = '$60.00 - $65.00/Hour';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('60-65 USD/hour');
  }
}
