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
    postedDate?: Date;
    timeEngagement?: string;
    salary?: string;
    nOfApplicants?: string;
    workLocation?: string;
    details?: string;
    description: string
    isRemote?: boolean;
    isInternship?: boolean;
    requiredSkills?: string;
    additionalJobLink?: string;
    euWorkPermitRequired?: boolean;
    deadline?: Date;

    companyName: string;
    companyLocation?: string;
    companyLink?: string;
    companySize?: string;
    companyFounded?: string;
    companyIndustry?: string;
    companyDescription?: string;
    companyDetails?: string;
    companyWebsite?: string;

    jobAdId: number;
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
            type: DataTypes.STRING,
            allowNull: true
        },
        details: {
            type: DataTypes.STRING(4096),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(4096),
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
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        requiredSkills: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        additionalJobLink: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        companyLocation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyLogo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyLink: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companySize: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyFounded: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyIndustry: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyDescription: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        companyDetails: {
            type: DataTypes.STRING(4096),
            allowNull: true,
        },
        companyWebsite: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'Job',
    });
    Job.sync();
}
