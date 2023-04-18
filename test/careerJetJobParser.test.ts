import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import CareerJetJobParser from '../src/dataLayer/parsers/careerJetJobParser';

_chai.should();

@suite
class CareerJetJobParserTests {
  private careerJetJobParser: CareerJetJobParser = new CareerJetJobParser();
  private testData: Job = {
      jobTitle: 'Python Developer (hybrid)',
      organization: {
        name: 'AssemblyAI - Remote ',
        location: 'Work From Home, VA (Hybrid)',
      } as Organization,
      salary: '$90,000 per year',
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
  setIsHybridAndFormatJobTitle() {
    let testData = this.getTestData();

    this.careerJetJobParser.parseJob(testData);

    expect(testData.jobTitle).to.be.equal('Python Developer');
    expect(testData.isHybrid).to.be.equal(true);
  }

  @test 
  formatSalary1() {
    let testData = this.getTestData();
    
    this.careerJetJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('90.000 USD/year');
  }

  @test 
  formatSalary2() {
    let testData = this.getTestData();
    testData.salary = '$89,500-119,400 per year';

    this.careerJetJobParser.parseJob(testData);

    expect(testData.salary).to.be.equal('89.500-119.400 USD/year');
  }
}
