import { Service } from "typedi";
import { JobScrapingTask } from "../../database/models/jobScrapingTask";
import JobScrapingTaskDTO from "../dtos/jobScrapingTaskDTO";
    
@Service()
export default class JobScrapingTaskMapper {

    public toDTO(jobScrapingTask: JobScrapingTask): JobScrapingTaskDTO {
        return {
            id: jobScrapingTask.id,
            startTime: jobScrapingTask.startTime,
            endTime: jobScrapingTask.endTime,
            numberOfSuccessfullyScraped: jobScrapingTask.numberOfSuccessfullyScrapedJobs,
            numberOfUnsuccessfullyScraped: jobScrapingTask.numberOfUnSuccessfullyScrapedJobs,
            status: jobScrapingTask.status
        } as JobScrapingTaskDTO;
    }
}
