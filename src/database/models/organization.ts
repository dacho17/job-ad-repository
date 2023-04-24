import { Association, CreationOptional, DataTypes, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize } from "sequelize";
import { Job } from "./job";

export class Organization extends Model<InferAttributes<Organization>, InferCreationAttributes<Organization>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare name: CreationOptional<string>;
    declare location?: CreationOptional<string>;
    declare logo?: CreationOptional<string>;
    declare website?: CreationOptional<string>;
    declare urlReference?: CreationOptional<string>;
    declare size?: CreationOptional<string>;
    declare founded?: CreationOptional<string>;
    declare industry?: CreationOptional<string>;
    declare description?: CreationOptional<string>;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    // declare getJobs: HasManyGetAssociationsMixin<Job[]>;
    declare addJob: HasManyCreateAssociationMixin<Job>;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    // declare jobs?: NonAttribute<Job[]>; // Note this is optional since it's only populated when explicitly requested in code

    declare static associations: {
        jobs: Association<Organization, Job>;
      };
}

export const OrganizationMAP = async (sequelize: Sequelize) => {
    Organization.init({
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
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        location: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        logo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        urlReference: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        size: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        founded: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        industry: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        website: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Organization',
    });
    Organization.sync(); // NOTE: { alter: true } - alters tables to fit the models - useful during development
}
