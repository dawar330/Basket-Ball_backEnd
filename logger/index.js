import { developmentLogger } from "./developmentLogger.js";
import { productionLogger } from "./productionLogger.js";
import { config } from "dotenv";
config();
let myLogger = null;

if (process.env.NODE_ENV === "prod") {
  myLogger = productionLogger();
} else {
  myLogger = developmentLogger();
}

export const logger = myLogger;
