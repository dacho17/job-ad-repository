export default {
    // jobsite urls
    CAREER_BUILDER_URL: 'https://www.careerbuilder.com',
    CAREER_JET_URL: 'https://www.careerjet.com',
    CV_LIBRARY_URL: 'https://www.cv-library.co.uk',
    EURO_ENGINEERING_URL: 'https://www.euroengineerjobs.com',
    EURO_SCIENCE_URL: 'https://www.eurosciencejobs.com',
    EURO_SPACE_CAREERS_URL: 'https://www.space-careers.com',
    EURO_TECH_URL: 'https://www.eurotechjobs.com',
    GRADUATELAND_URL: 'https://graduateland.com',
    INDEED_URL: 'https://www.indeed.com',
    JOB_FLUENT_URL: 'https://www.jobfluent.com',
    JOBS_IN_NETWORK_URL: 'https://www.jobsinnetwork.com',
    NO_FLUFF_JOBS_URL: 'https://nofluffjobs.com',
    QREER_URL: 'https://www.qreer.com',
    SIMPLY_HIRED_URL: 'https://www.simplyhired.com',
    SNAPHUNT_API_JOB_URL: 'https://api.snaphunt.com/v2/job/',
    SNAPHUNT_API_ADS_URL: 'https://api.snaphunt.com/v2/jobs',
    TYBA_URL: 'https://tyba.com',
    WE_WORK_REMOTELY_URL: 'https://weworkremotely.com',

    SNAPHUNT_REMOTE_QUERY_PARAMETER: `&jobLocationType=remote&urlJobLocationType=remote`,


    // Commonly used strings
    COMMA_SIGN: ',',
    MINUS_SIGN: '-',
    PLUS_SIGN: '+',
    UNDERSCORE_SIGN: '_',
    QUESTIONMARK_SIGN: '?',
    EMPTY_STRING: '',
    WHITESPACE: ' ',
    WHITESPACE_URL_ENCODING: '%20',
    UFT_PLUS_SIGN_ENCODING: '%2B',
    ASCII_COMMA_SIGN_ENCODING: '%2C',

    // Messages
    AD_SOURCE_NOT_RECOGNIZED: 'AdSource not recognized',
    JOB_TITLE_INVALID: 'The job title you provided is invalid',
    NUMBER_OF_ADS_INVALID: 'The number of ads you provided is invalid',
    UNDEFINED_FIELD_OF_WORK: 'The field of work is undefined',
    WORK_FROM_HOME_INVALID: 'The "Work From Home" value is invalid',

    // common html selectors
    HREF_SELECTOR: 'href',
    ARIALABEL_SELECTOR: 'aria-label',
    NAME_SELECTOR: 'name',
    VALUE_SELECTOR: 'value',

    // joblinks selectors
    ADZUNA_JOBLINKS_SELECTOR: '.ui-search-results > div[data-aid] > .w-full > .flex.gap-4 > h2 > a',
    ARBEITNOW_JOBLINKS_SELECTOR: '#results > li > div > .items-center > div > a',
    CAREER_JET_JOBLINKS_SELECTOR: '.job.clicky > header > h2 > a',
    CV_LIBRARY_JOBLINKS_SELECTOR: '#searchResults > .results__item > article > div > h2 > a',
    EURES_JOBLINKS_SELECTOR: '.ecl-link--standalone',
    EURO_JOB_SITES_JOBCARD_SELECTOR: '.searchList > li',
    EURO_JOBS_JOBLINKS_SELECTOR: '.viewDetails > a',
    GRADUATELAND_JOBLINKS_SELECTOR: '.job-box',
    INDEED_JOBLINKS_SELECTOR: 'h2.jobTitle > a',
    JOB_FLUENT_JOBCARD_SELECTOR: '.offer-row',
    JOB_FLUENT_JOBLINKS_SELECTOR: '.offer-title > a',
    LN_JOBCARD_SELECTOR: '.base-card',
    LN_JOBLINKS_SELECTOR: '.base-card__full-link',
    NO_FLUFF_JOBS_JOBLINKS_SELECTOR: '.list-container > .posting-list-item',
    QREER_JOBLINKS_SELECTOR: '.jobs-list > ul > li > .job',
    SIMPLY_HIRED_JOBLINKS_SELECTOR: 'h3[data-testid="searchSerpJobTitle"] > a',
    TYBA_JOBLINKS_SELECTOR: '#timeline > .section-view-list > .bem-enabled > a',
    WE_WORK_REMOTELY_JOBLINKS_SELECTOR: 'li > a',
    WE_WORK_REMOTELY_JOBLINKS_SELECTOR_TWO: '.jobs > article > ul > li > a',
    
    // selectors used in job ad scraping
    JOB_FLUENT_POSTED_AGO_SELECTOR: '.published-date',
    SIMPLY_HIRED_NAVIGATION_BUTTONS_SELECTOR: 'nav[role="navigation"] > a',
    CAREER_BUILDER_POSTINGDATE_SELECTOR: '.data-results-publish-time',
    CAREER_BUILDER_JOB_ADS: 'li > .job-listing-item',
    CAREER_BUILDER_JOBLINK_SELECTOR: ['name', 'href'],
    EURO_JOBS_POSTED_AGO_SELECTOR: '.postedDate',
    EURO_JOB_SITES_JOBLINKS_SELECTOR_ONE: '.searchList > li > div > div > div > a',
    EURO_JOB_SITES_JOBLINKS_SELECTOR_TWO: '.searchList > li > div > div > div > div > div > h3 > a',
    LINKEDIN_POSTED_AGO_SELECTOR: 'time',
    WE_WORK_REMOTELY_JOB_SECTION_SELECTOR: '.jobs-container > .jobs',
    WE_WORK_REMOTELY_VIEW_ALL_JOBS_SELECTOR: 'article > ul > .view-all > a',

    // HTTP codes
    OK: 200,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500,

    // other
    CV_LIBRARY_JOBLINK_SUFFIX: '-jobs',
}
