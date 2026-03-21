import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // on loggue "info" et tout ce qui est plus grave
  format: winston.format.combine(
    winston.format.timestamp(),   // ajoute la date/heure
    winston.format.simple()       // format lisible
  ),
  transports: [
    new winston.transports.Console(), // affiche dans le terminal
  ],
});

export default logger;