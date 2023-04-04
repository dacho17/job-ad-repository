export default {
    // jobsite urls
    ADZUNA: 'adzuna',
    ARBEIT_NOW: 'arbeitnow',
    CAREER_BUILDER: 'careerbuilder',
    CAREER_JET: 'careerjet',
    CV_LIBRARY: 'cv-library',
    EURO_JOBS: 'eurojobs',
    EURO_ENGINEERING: 'euroengineerjobs',
    EURO_SCIENCE: 'eurosciencejobs',
    EURO_SPACE_CAREERS: 'space-careers',
    EURO_TECH: 'eurotechjobs',
    GRADUATELAND: 'graduateland',
    // INDEED: 'indeed',
    JOB_FLUENT: 'jobfluent',
    LINKEDIN: 'linkedin',
    // JOBS_IN_NETWORK: 'jobsinnetwork',
    NO_FLUFF_JOBS: 'nofluffjobs',
    QREER: 'qreer',
    SIMPLY_HIRED: 'simplyhired',
    SNAPHUNT: 'snaphunt',
    TYBA: 'tyba',
    WE_WORK_REMOTELY: 'weworkremotely',

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

    // common html selectors
    DIV_SELECTOR: 'div',
    H3_SELECTOR: 'h3',
    HREF_SELECTOR: 'href',
    TD_SELECTOR: 'td',
    LI_SELECTOR: 'li',
    SPAN_SELECTOR: 'span',
    ARIALABEL_SELECTOR: 'aria-label',
    CONTENT_SELECTOR: 'content',
    DATETIME_SELECTOR: 'datetime',
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
    SIMPLY_HIRED_JOBLINKS_SELECTOR: 'h3[data-testid="searchSerpJobTitle"] > a',  // li > div > div > h3 > a
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

    // job scraping selectors
    ADZUNA_DETAILS_EXTEND_AD_BUTTON_SELECTOR: '.ui-foreign-click-description-toggle > a',
    ADZUNA_DETAILS_JOB_TITLE_SELECTOR: 'h1',
    ADZUNA_DETAILS_SUBTITLE_SECTION_SELECTOR: 'div > div > table > tbody > tr > td',
    ADZUNA_DETAILS_COMPANY_LINK_SELECTOR: 'div > div > table > tbody > tr > td > a',
    ADZUNA_DETAILS_JOB_DESCRIPTION_SELECTOR: '.ui-foreign-click-description > section',

    ARBEITNOW_DETAILS_JOB_TITLE_SELECTOR: 'a[itemprop="url"]',
    ARBEITNOW_DETAILS_COMPANY_NAME_SELECTOR: 'a[itemprop="hiringOrganization"]',
    ARBEITNOW_DETAILS_COMPANY_LOCATION_SELECTOR: '.list-none > div > div > div > div > div > div > p',
    ARBEITNOW_DETAILS_JOB_DETAILS_SELECTOR: '.list-none > div > div > div > div > div:nth-child(2) > div',
    ARBEITNOW_DETAILS_SALARY_INFORMATION: 'div[title="Salary Information"]',
    ARBEITNOW_DETAILS_POSTED_DATE_SELECTOR: 'time',
    ARBEITNOW_DETAILS_JOB_DESCRIPTION_SELECTOR: 'div[itemprop="description"]',

    CAREER_BUILDER_DETAILS_JOB_TITLE_SELECTOR: '.data-display-header_info-content > h2',
    CAREER_BUILDER_DETAILS_JOB_SUBTITLE_SELECTOR: '.data-display-header_info-content > .data-details > span',
    CAREER_BUILDER_DETAILS_JOB_DESCRIPTION_SELECTOR: '.jdp-left-content',
    CAREER_BUILDER_DETAILS_REQUIRED_SKILLS_SELECTOR: '.jdp-required-skills > ul > li',

    CAREER_JET_DETAILS_JOB_TITLE_SELECTOR: '#job > div > header > h1',
    CAREER_JET_DETAILS_COMPANY_NAME_SELECTOR: '#job > div > header > .company',
    CAREER_JET_DETAILS_JOB_SUBTITLE_SELECTOR: '#job > div > header > .details > li',
    CAREER_JET_DETAILS_POSTED_AGO_SELECTOR: '#job > div > header > .tags > li > span',
    CAREER_JET_DETAILS_JOB_DESCRIPTION_SELECTOR: '#job > div > .content',

    CV_LIBRARY_DETAILS_JOB_TITLE_SELECTOR: '.job__title > span',
    CV_LIBRARY_DETAILS_POSTED_AGO_SELECTOR: '.job__header-posted > span',
    CV_LIBRARY_DETAILS_COMPANY_NAME_SELECTOR: '.job__header-posted > span > a',
    CV_LIBRARY_DETAILS_REMOTE_POSITION_SELECTOR: 'job__icon--remote',
    CV_LIBRARY_DETAILS_JOB_DESCRIPTION_SELECTOR: '.job__description',
    CV_LIBRARY_DETAILS_JOB_DETAILS_KEY_SELECTOR: '.job__details-term',
    CV_LIBRARY_DETAILS_JOB_DETAILS_VALUE_SELECTOR: '.job__details-value',

    EURO_JOBS_DETAILS_JOB_TITLE_SELECTOR: '.listingInfo > h2',
    EURO_JOBS_DETAILS_COMPANY_NAME_SELECTOR: '.company-name',
    EURO_JOBS_DETAILS_COMPANY_WEBSITE_SELECTOR: '.comp-profile-content > a',
    EURO_JOBS_DETAILS_JOB_DETAILS_KEY_SELECTOR: '.displayFieldBlock > h3',
    EURO_JOBS_DETAILS_JOB_DETAILS_VALUE_SELECTOR: '.displayField',
    EURO_JOBS_DETAILS_ENGAGEMENT_AND_REQUIREMENTS_SELECTOR: '.listingInfo > fieldset > .displayFieldBlock',
    EURO_JOBS_DETAILS_JOB_DESCRIPTION_SELECTOR: '#listingsResults > div > fieldset > div > div',

    EURO_JOB_SITES_DETAILS_ADDITIONAL_JOB_LINK_SELECTOR: '.job-header > div > h2 > a',
    EURO_JOB_SITES_DETAILS_HEADER_SELECTOR: '.job-header > div > h2',
    EURO_JOB_SITES_DETAILS_AD_SELECTOR: '.job-header > div',
    EURO_JOB_SITES_DETAILS_JOB_DETAILS_SELECTOR: '.job-header > div > p',
    EURO_JOB_SITES_DETAILS_JOB_DETAILS_KEYS_SELECTOR: '.job-header > div > p > strong',

    GRADUATELAND_DETAILS_JOB_TITLE_SELECTOR: '.job-title > h1',
    GRADUATELAND_DETAILS_COMPANY_NAME_SELECTOR: '.job-title > h1 > span > a',
    GRADUATELAND_DETAILS_POSTED_AGO_SELECTOR: '.date',
    GRADUATELAND_DETAILS_JOB_DETAILS_KEY_SELECTOR: '.content-description > h3',
    GRADUATELAND_DETAILS_JOB_DETAILS_VALUES_SELECTOR: '.content-description > p',
    GRADUATELAND_DETAILS_JOB_DESCRIPTION_SELECTOR: '.job-content',

    JOB_FLUENT_DETAILS_JOB_TITLE_SELECTOR: 'span[itemprop="title"]',
    JOB_FLUENT_DETAILS_COMPANY_LOCATION_SELECTOR: 'span[itemprop="jobLocation"]',
    JOB_FLUENT_DETAILS_COMPANY_NAME_SELECTOR: 'span[itemprop="hiringOrganization"] > span', 
    JOB_FLUENT_DETAILS_COMPANY_LINK_SELECTOR: '.company-features > ul > li > p > a',
    JOB_FLUENT_DETAILS_COMPANY_DETAILS_KEYS_SELECTOR: '.company-features > ul > li > label',
    JOB_FLUENT_DETAILS_COMPANY_DETAILS_VALUES_SELECTOR: '.company-features > ul > li > p',
    JOB_FLUENT_DETAILS_REMOTE_SELECTOR: 'span[data-original-title="Remote"]',
    JOB_FLUENT_DETAILS_TIME_ENGAGEMENT_SELECTOR: 'b[itemprop="employmentType"]',
    JOB_FLUENT_DETAILS_INTERNSHIP_SELECTOR: 'span[data-original-title="No internship"]',
    JOB_FLUENT_DETAILS_REQUIRED_SKILLS_SELECTOR: 'meta[itemprop="skills"]',
    JOB_FLUENT_DETAILS_JOB_DESCRIPTION_SELECTOR: 'div[itemprop="description"]',

    LN_DETAILS_JOBTITLE_SELECTOR: '.topcard__title',
    LN_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR: 'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
    LN_DETAILS_COMPANY_LOCATION_SELECTOR: '.topcard__flavor--bullet',
    LN_DETAILS_POSTED_AGO_SELECTOR: '.posted-time-ago__text',
    LN_DETAILS_NUMBER_OF_APPLICANTS_SELECTOR: '.num-applicants__caption',
    LN_DETAILS_JOB_DETAILS_SELECTOR: '.description__job-criteria-list',
    LN_DETAILS_JOB_DESCRIPTION_SELECTOR: '.description__text',
    LN_DETAILS_SHOW_MORE_BUTTON_SELECTOR: '.show-more-less-html__button',
    LN_DETAILS_JOB_CRITERIA_ITEM_KEY_SELECTOR: '.description__job-criteria-subheader',
    LN_DETAILS_JOB_CRITERIA_ITEM_VALUE_SELECTOR: '.description__job-criteria-text--criteria',

    NO_FLUFF_DETAILS_JOB_TITLE_SELECTOR: '.posting-details-description > h1',
    NO_FLUFF_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR: '.posting-details-description > a',
    NO_FLUFF_DETAILS_SALARY_SELECTOR: 'h4',
    NO_FLUFF_DETAILS_LOCATIONS_SELECTOR: '.locations-compact > li > div > popover-content > div > div > ul > li',
    NO_FLUFF_DETAILS_POSTED_AGO_SELECTOR: '.posting-time-row',
    NO_FLUFF_DETAILS_SKILL_TITLES_SELECTOR: '#posting-requirements > section > h2',
    NO_FLUFF_DETAILS_SKILLS_SECTION_SELECTOR: '#posting-requirements > section > ul',
    NO_FLUFF_DETAILS_JOB_REQUIREMENTS_TITLE_SELECTOR: 'section[data-cy-section="JobOffer_Requirements"] > div > h2',
    NO_FLUFF_DETAILS_JOB_REQUIREMENTS_CONTENT_SELECTOR: 'section[data-cy-section="JobOffer_Requirements"] > div > nfj-read-more > div > ul > li',
    NO_FLUFF_DETAILS_JOB_DESCRIPTION_SHOW_MORE_SELECTOR: '#posting-description > div > nfj-read-more > a',
    NO_FLUFF_DETAILS_JOB_DESCRIPTION_SELECTOR:'#posting-description > div > nfj-read-more > div',

    NO_FLUFF_DETAILS_SHOW_MORE_RESPONSIBILITIES_SELECTOR: '#posting-tasks > span',
    NO_FLUFF_DETAILS_JOB_RESPONSIBILITIES_SELECTOR: '#posting-tasks > ol > li',
    NO_FLUFF_DETAILS_JOB_DETAILS_SELECTOR: '#posting-specs > ul > li',
    NO_FLUFF_DETAILS_EQUIPMENT_SUPPLIED_SELECTOR: '#posting-equipment > ul > li > span',
    NO_FLUFF_DETAILS_JOB_BENEFITS_SELECTOR: '#posting-benefits > section > ul > li > span',
    NO_FLUFF_DETAILS_JOB_REQUIREMENTS: '#posting-environment',
    NO_FLUFF_DETAILS_COMPANY_DETAILS_SELECTOR: '#posting-company > div > ul > li > p',
    NO_FLUFF_DETAILS_COMPANY_DESCRIPTION_SELECTOR: '#posting-company > div > article',
    NO_FLUFF_DETAILS_SHOW_MORE_SELECTOR: 'span[data-cy="text-fold"]',
    NO_FLUFF_DETAILS_REMOTE_SELECTOR: '.remote',

    SIMPLY_HIRED_DETAILS_JOB_TITLE_SELECTOR: 'h2[data-testid="viewJobTitle"]',
    SIMPLY_HIRED_DETAILS_COMPANY_NAME_SELECTOR: 'span[data-testid="viewJobCompanyName"] > span > span',
    SIMPLY_HIRED_DETAILS_COMPANY_LOCATION_SELECTOR: 'span[data-testid="viewJobCompanyLocation"]',
    SIMPLY_HIRED_DETAILS_TIME_ENGAGEMENT_SELECTOR:'span[data-testid="viewJobBodyJobDetailsJobType"]',
    SIMPLY_HIRED_DETAILS_POSTED_AGO_SELECTOR: 'span[data-testid="viewJobBodyJobPostingTimestamp"]',
    SIMPLY_HIRED_DETAILS_JOB_BENEFITS_SELECTOR: 'span[data-testid="viewJobBenefitItem"]',
    SIMPLY_HIRED_DETAILS_JOB_REQUIRED_SKILLS_SELECTOR: 'span[data-testid="viewJobQualificationItem"]',
    
    
    SIMPLY_HIRED_DETAILS_JOB_DESCRIPTION_SELECTOR: 'div[data-testid="viewJobBodyJobFullDescriptionContent"]',
    SIMPLY_HIRED_DETAILS_SALARY_SELECTOR: 'span[data-testid="viewJobBodyJobCompensation"]',

    QREER_DETAILS_JOB_TITLE_SELECTOR: 'header > h1',
    QREER_DETAILS_COMPANY_INFO_SELECTOR: '.company-info',
    QREER_DETAILS_COMPANY_NAME_SELECTOR: '.company-info > h3',
    QREER_DETAILS_COMPANY_LOCATION_SELECTOR: '.company-info > div',
    QREER_DETAILS_JOB_DETAILS_SELECTOR: '.job-info-block > p',
    QREER_DETAILS_JOB_DESCRIPTION_SELECTOR: '.job-description',
    QREER_DETAILS_JOB_SKILLS_KEY_VALUE_SELECTOR: '.skillsTable > tbody > tr',
    QREER_DETAILS_COMPANY_LINK_SELECTOR: '.company-info > a',
    QREER_DETAILS_ALT_COMPANY_LINK_SELECTOR: '.company-logo > a',
    QREER_DETAILS_REGISTER_FORM_BUTTON_SELECTOR: '#qreerRegisterSuggClose',

    SNAPHUNT_DETAILS_JOB_TITLE_SELECTOR: 'h1[class="JobDetailsPage-jobRole"]',
    SNAPHUNT_DETAILS_WORK_LOCATION_SELECTOR: '.JobDetailsPage-section1 > div:nth-child(2)',
    SNAPHUNT_DETAILS_JOB_DETAILS_SELECTOR: '.JobDetailsPageWrapper > div:nth-child(4) > div > div > div > div',
    SNAPHUNT_DETAILS_JOB_OFFER_SELECTOR: '.jobDetails',
    SNAPHUNT_DETAILS_JOB_DESCRIPTION_SELECTOR: '.JobDetailsPageWrapper > div:nth-child(4) > div > div > div > div:nth-child(3)',
    SNAPHUNT_DETAILS_JOB_REQUIREMENTS_SELECTOR: '.JobDetailsPageWrapper > div:nth-child(4) > div > div > div > div:nth-child(4)',

    TYBA_DETAILS_JOB_TITLE_SELECTOR: '.job-title > h1',
    TYBA_DETAILS_COMPANY_NAME_AND_LINK_SELECTOR: '.at-company > a',
    TYBA_DETAILS_JOB_DETAILS_KEYS_SELECTOR: '.content-description > h3',
    TYBA_DETAILS_JOB_DETAILS_VALUES_SELECTOR: '.content-description > p',
    TYBA_DETAILS_JOB_DESCRIPTION_SELECTOR: '.job-content',

    WE_WORK_REMOTELY_DETAIL_JOB_TITLE_SELECTOR: '.listing-header-container > h1',
    WE_WORK_REMOTELY_POSTED_DATE_SELECTOR: '.listing-header-container > h3:nth-child(1) > time',
    WE_WORK_REMOTELY_NUMBER_OF_APPLICANTS_SELECTOR: '.listing-header-container > h3:nth-child(2)',
    WE_WORK_REMOTELY_JOB_DETAILS_SELECTOR: '.listing-header-container > a',
    WE_WORK_REMOTELY_JOB_DESCRIPTION_SELECTOR: '.listing-container',
    WE_WORK_REMOTELY_COMPANY_NAME_AND_LINK_SELECTOR: '.company-card > h2 > a',
    WE_WORK_REMOTELY_COMPANY_LOCATION_SELECTOR: '.company-card > h3',
    WE_WORK_REMOTELY_COMPANY_WEBSITE_SELECTOR: '.company-card > h3 > a',

    // Commonly used string
    DOT: '.',
    UNDERSCORE: '_',
    COMMA: ',',
    COLON: ':',
    EQUALS: '=',
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
    INVALID_PARAMETERS: 'Some parameters received are faulty',
    MISSING_PARAMETERS: 'Not all required parameters have been received',
    NUMBER_OF_ADS_INVALID: 'The number of ads you provided is invalid',
    UNDISLOSED_COMPANY: 'Undisclosed',
    UNDEFINED_FIELD_OF_WORK: 'The field of work is undefined',
    UNKNOWN_NUMBER_OF_APPLICANTS: 'Unknown number of applicants',
    URL_INVALID: 'Url invalid',
    WORK_FROM_HOME_INVALID: 'The "Work From Home" value is invalid',

    DEFAULT_GET_JOBS_BATCH_SIZE: 20,

    // Words appearing
    ANYWHERE_IN_THE_WORLD: 'Anywhere in the World',
    CATEGORY: 'Category',
    CLIENT_COL: 'Client:',
    COMPANY_SIZE: 'Company Size',
    COMPANY_SIZE_NOFLUFF: 'Company size',
    DEADLINE_COL: 'Deadline:',
    EDUCATION_COL: 'Education Backgrounds:',
    EDUCATION_LEVEL_COL: 'Education Level:',
    EMPLOYMENT_TYPE: 'Employment type',
    EMPLOYMENT_TYPE_COL: 'Employment Type:',
    EXPERIENCE_COL: 'Experience:',
    FOUNDED_IN: 'Founded in',
    FOUNDED: 'Founded',
    FULLY_REMOTE: 'Fully remote',
    FULL_TIME: 'Full-Time',
    HEADQUARTERS: 'Headquarters',
    INDUSTRY: 'Industry',
    INDUSTRIES: 'Industries',
    JOB: 'Job',
    JOB_FUNCTION: 'Job function',
    JOB_LOCATION_COL: 'Job Location:',
    JOB_REQUIREMENTS_COL: 'Job Requirements:',
    LANGUAGES_SPOKEN_COL: 'Languages spoken:',
    LOCATION_COL: 'Location:',
    MAIN_LOCATION: 'Main location',
    LOCATION: 'Location',
    EU_WORK_PERMIT_REQ_COL: 'EU work permit required:',
    MUST_HAVE_LANGUAGE: 'Must-have language',
    PERMANENT_CONTRACT: 'Permanent contract',
    POSTED_COL: 'Posted:',
    SENIORITY_LEVEL: 'Seniority level',
    SHOW_MORE: 'Show more',
    SHOW_LESS: 'Show less',
    SKILLS: 'Skills',
    SPECIALTIES_COL: 'Specialties:',
    START_DATE_COL: 'Start Date:',
    TYPE: 'Type',
    TYPE_COL: 'Type:',
    EXPIRY_DATE_COL: 'Expiry Date:',
    WEBISTE: 'Website',
    YES: 'Yes',

    // HTTP codes
    OK: 200,
    BAD_REQUEST: 400,
    SERVER_ERROR: 500,

    // other
    CV_LIBRARY_JOBLINK_SUFFIX: '-jobs',
    JOB_DESCRIPTION_COMPOSITION_DELIMITER: ';; ',   // ', '
    SNAPHUNT_REDUNDANT_ADDRESS_MARK: '||&&||',
}
