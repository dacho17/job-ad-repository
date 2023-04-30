import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
import { JobMAP, Job } from './models/job';
import { JobAdMAP, JobAd } from './models/jobAd';
import { JobAdScrapingTask, JobAdScrapingTaskMAP } from './models/jobAdScrapingTask';
import { JobScrapingTask, JobScrapingTaskMAP } from './models/jobScrapingTask';
import { Organization, OrganizationMAP } from './models/organization';
import { User, UserMAP } from './models/user';

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USERNAME!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    dialect: 'mysql',
    pool: {
        min: 0,
        max: 20,
        acquire: 60000,
        idle: 10000
    },
    logging: (...msg) => console.log(msg),
});

async function initializeTables() {
    await Promise.all([
        JobAdScrapingTaskMAP(sequelize),
        JobScrapingTaskMAP(sequelize),
        UserMAP(sequelize),

        JobMAP(sequelize),
        JobAdMAP(sequelize),
        OrganizationMAP(sequelize)
    ]);

    // Here we associate which actually populates out pre-declared `association` static and other methods.
    JobAdScrapingTask.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    JobScrapingTask.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    User.hasMany(JobAdScrapingTask, {
        sourceKey: 'id',
        foreignKey: 'userId',
        as: 'jobAdScrapingTasks'
    });
    User.hasMany(JobScrapingTask, {
        sourceKey: 'id',
        foreignKey: 'userId',
        as: 'jobScrapingTasks'
    });
    Job.belongsTo(JobAd, {
        foreignKey: 'jobAdId',
        as: 'jobAd'
    });
    Job.belongsTo(Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });
    Organization.hasMany(Job, {
        sourceKey: 'id',
        foreignKey: 'organizationId',
        as: 'jobs' // this determines the name in `associations`!
    });
}

initializeTables();

// NOTE: define the tables here!
export default {
    sequelize: sequelize,
    JobAd: JobAd,
    JobAdScrapingTask: JobAdScrapingTask,
    JobScrapingTask: JobScrapingTask,
    Job: Job,
    Organization: Organization,
    User: User,
}
