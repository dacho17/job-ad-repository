import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
import { JobMAP, Job } from './models/job';
import { JobAdMAP, JobAd } from './models/jobAd';
import { Organization, OrganizationMAP } from './models/organization';

const sequelize = new Sequelize(process.env.DATABASE_NAME!, process.env.DB_USERNAME!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000
    }
});

JobAdMAP(sequelize);
JobMAP(sequelize);
OrganizationMAP(sequelize);

// Here we associate which actually populates out pre-declared `association` static and other methods.
Job.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
});
Organization.hasMany(Job, {
    sourceKey: 'id',
    foreignKey: 'organizationId',
    as: 'jobs' // this determines the name in `associations`!
  });
Job.belongsTo(JobAd, {
    foreignKey: 'jobAdId',
    as: 'jobAd'
});

sequelize.authenticate().then(() => {
    console.log('Connected to the database.')
    }, err => {
    console.error('Unable to connect to the database:', err)
});

// NOTE: define the tables here!
export default {
    sequelize: sequelize,
    JobAd: JobAd,
    Job: Job,
    Organization: Organization,
}
