// import { createLogger, transports, format } from 'winston';
// import * as winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// const logger = winston.createLogger({
//     level: 'error',
//     transports: [
//         // new DailyRotateFile({
//         //     filename: "%DATE%.log",
//         //     dirname: "logs",
//         //     frequency: '24h',
//         //     datePattern: 'YYYY-MM-DD',
//         // }),
//         new transports.File({
//             filename: "winston.log",
//             dirname: "logs",
//         }),
//     ],
//     // format: format.combine(
//     //     format.timestamp(),
//     //     format.printf(({ timestamp, level, message, service }) => {
//     //         return `[${timestamp}] ${service} ${level}: ${message}`;
//     //     })
//     // ),
//     defaultMeta: {
//         service: "WinstonExample",
//     },
// });

// logger.info('A first log');

// export default logger;
