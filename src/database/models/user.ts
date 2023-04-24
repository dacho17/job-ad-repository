import { Association, CreationOptional, DataTypes, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from "sequelize";
import { JobAdScrapingTask } from "./jobAdScrapingTask";
import { JobScrapingTask } from "./jobScrapingTask";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare username: string;
    declare passwordEncoded: string;
    declare role: number;
    declare jwtAuthToken: CreationOptional<string | null>;

    // declare getJobAdScrapingTasks: HasManyGetAssociationsMixin<JobAdScrapingTask[]>;
    // declare getJobScrapingTasks: HasManyGetAssociationsMixin<JobScrapingTask[]>;
    // declare jobAdScrapingTasks?: NonAttribute<JobAdScrapingTask[]>; // Note this is optional since it's only populated when explicitly requested in code
    // declare jobScrapingTasks?: NonAttribute<JobScrapingTask[]>;

    declare static associations: {
        jobAdScrapingTasks: Association<User, JobAdScrapingTask>;
        jobScrapingTasks: Association<User, JobScrapingTask>;
    };
}


export const UserMAP = async (sequelize: Sequelize) => {
    User.init({
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
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordEncoded: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jwtAuthToken: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'User',
    });

    return await User.sync(); // { alter: true }
}
