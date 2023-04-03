# job-ad-repository
This repository contains the codebase which includes scrapers collecting the data from multiple job sites across the internet, and store it to the database. The aim is for it to contain the client solution which will offer the scraping functionality and display the stored data to end users.

# db-interface-client
To refer to the application's package.json file, use the command: npm --prefix ./db-interface-client run <command>

TODOs:
1. Build a client app
2. Implement Logging!
3. Revise TODOs

JobAd Scrapers to be implemented:
    jobsInNetwork -> not uniform detail scraper
    indeed -> getting access denied

Use separate threads!
    - also I can implement master-workers architecture

TEST: Big test - scrape all ads I have right now

Implement Error Handling
Start making test suites - TDD!
    - TDD - test-driven-development
    - Create unit tests before writing any code.
    - in the tutorial mocha, chai and nyc are used
        - how will this fit my puppeteer req?
    - INST: npm i -s nyc mocha chai
    - RUN: mocha test/* --reporter spec
