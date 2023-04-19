import { BelongsToSetAssociationMixin } from 'sequelize';
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin, DataTypes, Sequelize, HasManySetAssociationsMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, Association, ForeignKey, NonAttribute, BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin } from 'sequelize';
import { JobAd } from './jobAd';
import { Organization } from './organization';

// order of InferAttributes & InferCreationAttributes is important.
export class Job extends Model<InferAttributes<Job>, InferCreationAttributes<Job>> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare url: string;
    declare jobTitle: string;
    declare contactEmails?: CreationOptional<string>;
    declare postedDateTimestamp?: CreationOptional<number>
    declare postedDate?: CreationOptional<Date>;
    declare startDate?: CreationOptional<string>;
    declare applicationDeadlineTimestamp?: CreationOptional<number>;
    declare nOfApplicants?: CreationOptional<string>;
    declare salary?: CreationOptional<string>;
    declare timeEngagement?: CreationOptional<string>;
    declare workLocation?: CreationOptional<string>;
    declare isRemote?: CreationOptional<boolean>;
    declare isHybrid?: CreationOptional<boolean>;
    declare isTrainingProvided?: CreationOptional<boolean>;
    declare isInternship?: CreationOptional<boolean>;
    declare isStudentPosition?: CreationOptional<boolean>;
    declare euWorkPermitRequired?: CreationOptional<boolean>;
    declare requiredSkills?: CreationOptional<string>;
    declare goodToHaveSkills?: CreationOptional<string>;
    declare techTags?: CreationOptional<string>;
    declare interestTags?: CreationOptional<string>;
    // declare devStack?: CreationOptional<string>;
    declare requiredLanguages?: CreationOptional<string>;
    declare requiredExperience?: CreationOptional<string>;
    declare requiredEducation?: CreationOptional<string>;
    declare requirements?: CreationOptional<string>;
    declare responsibilities?: CreationOptional<string>;
    declare benefits?: CreationOptional<string>;
    declare equipmentProvided?: CreationOptional<string>;
    declare additionalJobLink?: CreationOptional<string>;
    declare details?: CreationOptional<string>;
    declare description?: CreationOptional<string>;
    declare requiresParsing: CreationOptional<boolean>;
    declare parsedDate?: CreationOptional<Date>;

    declare jobAdId: ForeignKey<JobAd['id']>;
    declare organizationId: ForeignKey<Organization['id']>;

    declare organization?: NonAttribute<Organization>; // Note this is optional since it's only populated when explicitly requested in code
    declare jobAd?: NonAttribute<JobAd>; // Note this is optional since it's only populated when explicitly requested in code

    // other attributes...
    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    declare getOrg: BelongsToGetAssociationMixin<Organization>; // Note the null assertions!
    declare setOrg: BelongsToSetAssociationMixin<Organization, number>;
    declare getAd: BelongsToGetAssociationMixin<JobAd>;
    declare setAd: BelongsToSetAssociationMixin<JobAd, number>;

    declare static associations: {
        organization: Association<Job, Organization>;
        jobAd: Association<Job, JobAd>;
    };
}

export const JobMAP = (sequelize: Sequelize) => {
    Job.init({
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
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jobTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contactEmails: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        postedDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        applicationDeadlineTimestamp: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        postedDateTimestamp: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        startDate: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        timeEngagement: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        salary: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        nOfApplicants: {
            type: DataTypes.STRING,
            allowNull: true
        },
        workLocation: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        details: {
            type: DataTypes.STRING(10000),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(20000),
            allowNull: true
        },
        isRemote: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isHybrid: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isTrainingProvided: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        isInternship: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isStudentPosition: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        euWorkPermitRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        requiredSkills: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        goodToHaveSkills: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        techTags: {
            type: DataTypes.STRING(1024),
            allowNull: true,
        },
        interestTags: {
            type: DataTypes.STRING(1024),
            allowNull: true,
        },
        // devStack: {
        //     type: DataTypes.STRING,
        //     allowNull: true,
        // },
        requiredLanguages: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        requiredExperience: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        requiredEducation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        requirements: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        benefits: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        equipmentProvided: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        responsibilities: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        additionalJobLink: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        requiresParsing: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        parsedDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        jobAdId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Job',
    });

    Job.sync(); // { alter: true }
}
