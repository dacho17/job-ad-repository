select 'initDb script started executing' AS '';

-- --------------------------------------
--        CREATE A DB IF NONE
-- --------------------------------------
CREATE DATABASE IF NOT EXISTS `scraped_jobs`;

select 'initDb script finished executing' AS '';
