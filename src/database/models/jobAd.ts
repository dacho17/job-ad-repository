import {
    Sequelize,
    DataTypes,
    Model,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Association,
    NonAttribute
} from 'sequelize';
import { Job } from './job';

export class JobAd extends Model<InferAttributes<JobAd>, InferCreationAttributes<JobAd>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare source: number;
    declare jobLink: string;
    declare isAdPresentOnline: CreationOptional<boolean>;
    declare areDetailsScraped?: CreationOptional<boolean>;
    declare detailsScrapedDate?: CreationOptional<Date>;
    declare jobTitle?: CreationOptional<string>;
    declare postedDate?: CreationOptional<Date>;
    declare postedDateTimestamp?: CreationOptional<number>;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    declare job?: NonAttribute<Job>; // Note this is optional since it's only populated when explicitly requested in code

    declare static associations: {
        job: Association<JobAd, Job>;
    };
}

export const JobAdMAP = (sequelize: Sequelize) => {
    JobAd.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        source: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jobLink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isAdPresentOnline: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        areDetailsScraped: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        detailsScrapedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        jobTitle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        postedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        postedDateTimestamp: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'JobAd',
    });
    JobAd.sync();   // { alter: true }
}
