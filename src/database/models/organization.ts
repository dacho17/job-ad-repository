import { DataTypes, Model, Sequelize } from "sequelize";

export class Organization extends Model {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    location?: string;
    logo?: string;
    website?: string;
    urlReference?: string;
    size?: string;
    founded?: string;
    industry?: string;
    description?: string;
}

export const OrganizationMAP = (sequelize: Sequelize) => {
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
            type: DataTypes.STRING,
            allowNull: true
        },
        founded: {
            type: DataTypes.STRING,
            allowNull: true
        },
        industry: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(4096),
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
