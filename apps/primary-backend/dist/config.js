"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMTP_USERNAME = exports.SMTP_PASSWORD = exports.SMTP_ENDPOINT = exports.JWT_PASSWORD = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_PASSWORD = process.env.JWT_PASSWORD || "123random";
exports.SMTP_ENDPOINT = process.env.SMTP_ENDPOINT;
exports.SMTP_PASSWORD = process.env.SMTP_PASSWORD;
exports.SMTP_USERNAME = process.env.SMTP_USERNAME;
