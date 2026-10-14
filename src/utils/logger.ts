import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isProduction = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL || "info";

const transports: winston.transport[] = [new winston.transports.Console()];

if (isProduction) {
	transports.push(
		new DailyRotateFile({
			filename: "logs/app-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			maxFiles: "7d",
			maxSize: "20m",
			level,
		}),
	);
}

const logger = winston.createLogger({
	level,
	format: winston.format.combine(
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.timestamp(
			isProduction ? undefined : { format: "YYYY-MM-DD HH:mm:ss" },
		),
		isProduction
			? winston.format.json()
			: winston.format.combine(
					winston.format.colorize(),
					winston.format.printf(({ timestamp, level, message, stack }) =>
						stack
							? `${timestamp} ${level}: ${message}\n${stack}`
							: `${timestamp} ${level}: ${message}`,
					),
				),
	),
	transports,
});

export const morganStream = {
	write(message: string) {
		logger.info(message.trimEnd());
	},
};

export default logger;
