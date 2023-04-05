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
}
