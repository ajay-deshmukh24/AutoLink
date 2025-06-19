import dotenv from "dotenv";
dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD || "123random";

export const SMTP_ENDPOINT = process.env.SMTP_ENDPOINT;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
export const SMTP_USERNAME = process.env.SMTP_USERNAME;
