import { ClientRequest, ServerResponse } from 'http';
import { createLogger, transports, format } from 'winston';
import { Request, RequestHandler, Response } from 'express';
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
        // new transports.Console()
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

function logRequest(req: Request, res: Response, next: any) {
    logger.info(`Incoming ${req.method} request url=${req.url} originalUrl=${req.originalUrl} path=${req.path}`);
    next()
}

export default logRequest;
