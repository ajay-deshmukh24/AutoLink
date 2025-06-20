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
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_ENDPOINT,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});
// console.log(process.env.SMTP_ENDPOINT);
// console.log(process.env.SMTP_USERNAME);
// console.log(process.env.SMTP_PASSWORD);
function sendEmail(to, body) {
    return __awaiter(this, void 0, void 0, function* () {
        // send out the user email
        yield transporter.sendMail({
            from: '"AutoLink" <noreply@autolink.ajaydeshmukh.dev>',
            sender: "noreply@autolink.ajaydeshmukh.dev",
            to,
            subject: "Hello from AutoLink",
            text: body,
        });
        console.log(`email has sent to ${to}`);
    });
}
