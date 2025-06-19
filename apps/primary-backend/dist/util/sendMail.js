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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.SMTP_ENDPOINT,
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: config_1.SMTP_USERNAME,
        pass: config_1.SMTP_PASSWORD,
    },
});
const sendMail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // send out the user email
    // console.log(SMTP_ENDPOINT);
    // console.log(SMTP_USERNAME);
    const { email, subject, message } = options;
    yield transporter.sendMail({
        from: '"AutoLink" <noreply@autolink.ajaydeshmukh.dev>',
        sender: "noreply@autolink.ajaydeshmukh.dev",
        to: email,
        subject: subject,
        html: message,
    });
    console.log(`email has sent to ${email}`);
});
exports.default = sendMail;
