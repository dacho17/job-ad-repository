# job-ad-repository
This repository contains the codebase which includes scrapers collecting the data from multiple job sites across the internet, and store it to the database. The aim is for it to contain the client solution which will offer the scraping functionality and display the stored data to end users.

# db-interface-client
To refer to the application's package.json file, use the command: npm --prefix ./db-interface-client run <command>

JobAd Scrapers which could be implemented:
    jobsInNetwork -> not uniform detail scraper
    indeed -> getting access denied

TODOs/Improvements:
    - If there is no jobTasks for an admin user, show a prettier table
    