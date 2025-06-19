"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyFailure = notifyFailure;
const email_1 = require("../email");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function notifyFailure(zapRunId, actionType, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.error("ADMIN_EMAIL is not set");
            return;
        }
        const subject = `Zap Failure - Action: ${actionType}`;
        const body = `
ZapRun ID: ${zapRunId}
Failed Action: ${actionType}
Error: ${message}
Timestamp: ${new Date().toISOString()}
  `;
        try {
            yield (0, email_1.sendEmail)(adminEmail, body);
            console.log(`Failure email sent to ${adminEmail}`);
        }
        catch (e) {
            console.error("Failed to send admin alert email:", e);
        }
    });
}
