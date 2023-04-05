import {
    Sequelize,
    DataTypes,
    Model
} from 'sequelize';

export class JobAd extends Model {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    source: number;
    jobLink: string;
    areDetailsScraped?: boolean;
    detailsScrapedDate?: Date;
    jobTitle?: string;
    postedDate?: Date;
    postedDateTimestamp?: number;
    JobAdSourceId?: number;
    JobId?: number;
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
