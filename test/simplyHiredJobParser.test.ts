import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import { Job } from 'src/database/models/job';
import { Organization } from 'src/database/models/organization';
import SimplyHiredJobParser from '../src/dataLayer/parsers/simplyHiredJobParser';

_chai.should();

@suite
class SimplyHiredJobParserTests {
    private careerBuilderJobParser: SimplyHiredJobParser = new SimplyHiredJobParser();
    private testData: Job = {
        jobTitle: 'Python Developer (hybrid)',
        organization: {
          name: 'AssemblyAI - Remote ',
          location: 'Work From Home, VA (Hybrid)',
        } as Organization,
        salary: 'Estimated: $111K - $141K a year',   
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

        expect(testData.salary).to.be.equal('111.000-141.000 USD/year');
    }

    @test 
    formatSalary2() {
        let testData = this.getTestData();
        testData.salary = '$155,000 - $250,000 a year';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('155.000-250.000 USD/year');
    }

    @test 
    formatSalary3() {
        let testData = this.getTestData();
        testData.salary = '$70 - $75 an hour';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('70-75 USD/hour');
    }

    @test 
    formatSalary4() {
        let testData = this.getTestData();
        testData.salary = 'Estimated: $71.4K - $90.4K a year';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('71.400-90.400 USD/year');
    }

    @test 
    formatSalary5() {
        let testData = this.getTestData();
        testData.salary = 'From $180,000 a year';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('+180.000 USD/year');
    }

    @test 
    formatSalary6() {
        let testData = this.getTestData();
        testData.salary = 'Up to $28 an hour';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('<=28 USD/hour');
    }

    @test
    formatSalary7() {
        let testData = this.getTestData();
        testData.salary = '$60 an hour';

        this.careerBuilderJobParser.parseJob(testData);

        expect(testData.salary).to.be.equal('60 USD/hour');
    }
}
