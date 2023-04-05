import {
    Sequelize,
    DataTypes,
    Model
} from 'sequelize';

export class Job extends Model {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    jobTitle: string;
    postedDateTimestamp?: number
    postedDate?: Date;
    startDate?: string;
    applicationDeadlineTimestamp?: number;
    nOfApplicants?: string;
    salary?: string;
    timeEngagement?: string;
    workLocation?: string;
    isRemote?: boolean;
    isInternship?: boolean;
    euWorkPermitRequired?: boolean;
    requiredSkills?: string;
    goodToHaveSkills?: string;
    requiredExperience?: string;
    requiredEducation?: string;
    requirements?: string;
    responsibilities?: string;
    equipmentProvided?: string;
    additionalJobLink?: string;
    details?: string;
    description: string

    organizationId?: number;
    jobAdId?: number;
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
        jobTitle: {
            type: DataTypes.STRING,
            allowNull: false,
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
            allowNull: false
        },
        isRemote: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isInternship: {
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
        requiredLanguages: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        requiredExperience: {
            type: DataTypes.STRING,
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
        }
    }, {
        sequelize,
        modelName: 'Job',
    });
    Job.sync({ alter: true });
}
