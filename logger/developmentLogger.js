import winston from "winston";
const { combine, timestamp, printf } = winston.format;
import DailyRotateFile from "winston-daily-rotate-file";
const myFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp} ${message}`;
});

const errorFilter = winston.format((info) => {
  return info.level === "error" ? info : false;
});

const debugFilter = winston.format((info) => {
  return info.level === "debug" ? info : false;
});

const infoFilter = winston.format((info) => {
  return info.level === "info" ? info : false;
});
export const developmentLogger = () => {
  return winston.createLogger({
    level: "debug",
    format: combine(timestamp(), myFormat),
    //   defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.Console(),

      new DailyRotateFile({
        filename: `logs/error-%DATE%.log`,
        level: "error",
        format: winston.format.combine(
          errorFilter(),
          winston.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
          winston.format.printf(
            (error) => `${error.level}: ${[error.timestamp]}: ${error.message}`
          )
        ),
        handleExceptions: true,
      }),
      new DailyRotateFile({
        filename: `logs/info-%DATE%.log`,
        level: "info",
        format: winston.format.combine(
          infoFilter(),
          winston.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
          winston.format.printf(
            (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
          )
        ),
        handleExceptions: true,
      }),
      new DailyRotateFile({
        filename: `logs/debug-%DATE%.log`,
        level: "debug",
        format: winston.format.combine(
          debugFilter(),
          winston.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
          winston.format.printf(
            (debug) => `${debug.level}: ${[debug.timestamp]}: ${debug.message}`
          )
        ),
        handleExceptions: true,
      }),
    ],
  });
};
