import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';

const logger = createLogger({
    level: 'error',
    transports: [
        new transports.DailyRotateFile({
            dirname: "logs",
            filename: "%DATE%.log",
            frequency: '24h',
            datePattern: 'YYYY-MM-DD',
        }),
    ],
    format: format.combine(
        format.timestamp(),
        format.splat(),
        format.printf(({ timestamp, level, message, service }) => {
            return `[${timestamp}] ${service} ${level}: ${message}`;
        })
    ),
    defaultMeta: {
        service: "WinstonExample",
    },
});

export default logger;
