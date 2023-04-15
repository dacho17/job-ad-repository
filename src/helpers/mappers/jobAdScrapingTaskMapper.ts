import { Service } from "typedi";
import { JobAdScrapingTask } from "../../database/models/jobAdScrapingTask";
import JobAdScrapingTaskDTO from "../dtos/jobAdScrapingTaskDTO";

@Service()
export default class JobAdScrapingTaskMapper {

    public toDTO(jobAdScrapingTask: JobAdScrapingTask): JobAdScrapingTaskDTO {
        return {
            id: jobAdScrapingTask.id,
            startTime: jobAdScrapingTask.startTime,
            endTime: jobAdScrapingTask.endTime,
            numberOfAdsScraped: jobAdScrapingTask.numberOfAdsScraped,
            status: jobAdScrapingTask.status
        } as JobAdScrapingTaskDTO;
    }
}
