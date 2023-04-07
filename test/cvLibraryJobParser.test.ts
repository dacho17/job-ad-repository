import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import CvLibraryJobParser from '../src/dataLayer/parsers/cvLibraryJobParser';

_chai.should();

@suite
class CvLibraryJobParserTests {
  private careerBuilderJobParser: CvLibraryJobParser = new CvLibraryJobParser();
  private testData: Job = {
      jobTitle: 'Software Engineer Python / Angular (Hybrid / Remote)',
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
    testData.jobTitle = 'Senior Software Engineer, JavaScript, React, Python, Hybrid';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.isHybrid).to.be.equal(true);
  }
  
  @test
  setIsRemoteAndFormatJobTitle() {
    let testData = this.getTestData();
    testData.jobTitle = 'Senior Data Engineer (Redshift, Python, SQL, AWS) - Remote';

    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.isRemote).to.be.equal(true);
  }

  @test 
  setIsRemoteAndIsHybridAndFormatJobTitle() {
    let testData = this.getTestData();
    
    this.careerBuilderJobParser.parseJob(testData);

    expect(testData.isHybrid).to.be.equal(true);
    expect(testData.isRemote).to.be.equal(true);
  }
}
