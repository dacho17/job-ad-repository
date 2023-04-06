import { Transaction } from "sequelize";
import { Service } from "typedi";
import { Organization } from "../database/models/organization";

@Service()
export default class OrganizationRepository {

    /**
   * @description Stores a scraped organization and returns a success message. Throws an error if encountered.
   * @param {Organization} organization organization MAP object to be stored
   * @param {Transaction} t transaction as part of which the insert query is executed
   * @returns {Promise<Organization>} Promise containing the stored organization.
   */
    public async create(organization: Organization, t: Transaction): Promise<Organization> {
        try {
            const res = await organization.save({ transaction: t });
            return res;    
        } catch (exception) {
            throw `An exception occurred while attempting to store an organization - [${exception}]`;
        }
    }

    /**
   * @description Fetches an organization based on its id.
   * If there is an error, it is thrown.
   * @param {number} id
   * @returns {Promise<Organization>} Promise containing the requested organization.
   */
    public async getById(id: number): Promise<Organization | null> {
        try {
            const org = await Organization.findByPk(id);

            return org;
        } catch (exception) {
            throw `getById failed - [${exception}]`;
        }
    }


     /**
   * @description Updates the organization and returns it. Throws an error if encountered.
   * @param {Organization} job Organization MAP object which is to be stored
   * @param {Transaction?} t transaction as part of which the update query is executed
   * @returns {Promise<Organization>} Promise containing the stored organization.
   */
     public async update(org: Organization, t?: Transaction): Promise<Organization> {
        try {
            return await org.save({transaction: t});
        } catch (exception) {
            throw `An attempt to update the organization with id=${org.id} has failed. - [${exception}]`;
        }
    }
}
