import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
import { JobAdMAP, JobAd } from './models/jobAd';

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

sequelize.authenticate().then(() => {
    console.log('Connected to the database.')
    }, err => {
    console.error('Unable to connect to the database:', err)
});

// NOTE: define the tables here!
export default {
    JobAd: JobAd,
}
