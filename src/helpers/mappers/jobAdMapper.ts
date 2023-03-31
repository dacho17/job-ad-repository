import { Service } from "typedi";
import db from '../../database/db';
import { JobAd } from "../../database/models/jobAd";
import { JobAdDTO } from "../dtos/jobAdDTO";
import { JobAdSource } from "../enums/jobAdSource";

@Service()
export class JobAdMapper {
    /**
   * @description Function which maps JobAdDTO to JobAdMAP.
   * @param {JobAdDTO} jobAdDTO
   * @returns {JobAd}
   */
    public toMap(jobAdDTO: JobAdDTO): JobAd {
        const jobAdMAP = db.JobAd.build({
            jobLink: jobAdDTO.jobLink,
            source: jobAdDTO.source.valueOf(),
            // areDetailsScraped: jobAdDTO.areDetailsScraped || false, DTO not carrying the property at the moment
            jobTitle: jobAdDTO.jobTitle,
            postedDate: jobAdDTO.postedDate ? new Date(jobAdDTO.postedDate) : new Date(),
            postedDateTimestamp: jobAdDTO.postedDateTimestamp
        });
        return jobAdMAP;
    }
    
    /**
   * @description Function which maps JobAdMAP to JobAdDTO.
   * @param {JobAd} jobAdMAP
   * @returns {JobAdDTO}
   */
    public toDto(jobAdMAP: JobAd): JobAdDTO {
        const jobAdDTO: JobAdDTO = {
            jobLink: jobAdMAP.jobLink,
            source: jobAdMAP.source,
            jobTitle: jobAdMAP.jobTitle,
            postedDateTimestamp: jobAdMAP.postedDateTimestamp
        }
        
        return jobAdDTO;
    }
}
