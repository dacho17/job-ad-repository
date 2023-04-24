import { Association, CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from "sequelize";

export class JobScrapingTask extends Model<InferAttributes<JobScrapingTask>, InferCreationAttributes<JobScrapingTask>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare startTime: CreationOptional<Date | null>;
    declare endTime: CreationOptional<Date | null>;
    declare status: number;
    declare numberOfSuccessfullyScrapedJobs: CreationOptional<number | null>;
    declare numberOfUnSuccessfullyScrapedJobs: CreationOptional<number | null>;
    
    declare userId: CreationOptional<number>;   // ForeignKey<User['id']>
    // declare user?: NonAttribute<User>;
    // declare static associations: {
    //     user: Association<JobScrapingTask, User>
    // }
}

export const JobScrapingTaskMAP = async (sequelize: Sequelize) => {
    JobScrapingTask.init({
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
        status: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        numberOfSuccessfullyScrapedJobs: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        numberOfUnSuccessfullyScrapedJobs: {
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
        modelName: 'JobScrapingTask',
    });
    
    return await JobScrapingTask.sync();   // { alter: true }
}
