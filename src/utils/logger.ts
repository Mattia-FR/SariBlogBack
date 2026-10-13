import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
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
	transports: [new winston.transports.Console()],
});

export const morganStream = {
	write(message: string) {
		logger.info(message.trimEnd());
	},
};

export default logger;
