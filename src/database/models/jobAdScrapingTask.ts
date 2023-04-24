import { Association, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from "sequelize";

export class JobAdScrapingTask extends Model<InferAttributes<JobAdScrapingTask>, InferCreationAttributes<JobAdScrapingTask>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare startTime: CreationOptional<Date | null>;
    declare endTime: CreationOptional<Date | null>;
    declare scrapeParams: string;
    // declare initiatorUserId: number;
    declare status: number;
    declare numberOfAdsScraped: CreationOptional<number | null>;
    
    declare userId: CreationOptional<number>;   // ForeignKey<User['id']>
    // declare user?: NonAttribute<User>;
    // declare static associations: {
    //     user: Association<JobAdScrapingTask, User>
    // }
}

export const JobAdScrapingTaskMAP = async (sequelize: Sequelize) => {
    JobAdScrapingTask.init({
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
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        scrapeParams: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        numberOfAdsScraped: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            
        }
    },
    {
        sequelize,
        modelName: 'JobAdScrapingTask',
    });
    
    return await JobAdScrapingTask.sync();   // { alter: true }
}
