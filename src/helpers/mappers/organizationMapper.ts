import { Service } from "typedi";
import db from "../../database/db";
import { Organization } from "../../database/models/organization";
import OrganizationDTO from "../dtos/organizationDTO";

@Service()
export default class OrganizationMappper {

    /**
   * @description Function which maps OrganizationDTO to OrganizationMAP.
   * @param {OrganizationDTO} organizationDTO
   * @returns {Organization}
   */
    public toMap(organizationDTO: OrganizationDTO): Organization {
        return db.Organization.build({
            name: organizationDTO.name,
            location: organizationDTO.location,
            logo: organizationDTO.logo,
            website: organizationDTO.website,
            urlReference: organizationDTO.urlReference,
            size: organizationDTO.size,
            founded: organizationDTO.founded,
            industry: organizationDTO.industry,
            description: organizationDTO.description,
        });
    }

    /**
   * @description Function which maps OrganizationMAP to OrganizationDTO.
   * @param {Organization} organizationMAP
   * @returns {OrganizationDTO}
   */
    public toDTO(organizationMAP: Organization): OrganizationDTO {
        const organizationDTO: OrganizationDTO = {
            name: organizationMAP.name,
            description: organizationMAP.description,
            founded: organizationMAP.founded,
            industry: organizationMAP.industry,
            location: organizationMAP.location,
            logo: organizationMAP.logo,
            size: organizationMAP.size,
            urlReference: organizationMAP.urlReference,
            website: organizationMAP.website
        };

        return organizationDTO;
    }
}
