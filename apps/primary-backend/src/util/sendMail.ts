import nodemailer, { Transporter } from "nodemailer";
import { SMTP_PASSWORD, SMTP_ENDPOINT, SMTP_USERNAME } from "../config";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const transporter: Transporter = nodemailer.createTransport({
  host: SMTP_ENDPOINT,
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

const sendMail = async (options: EmailOptions): Promise<void> => {
  // send out the user email

  // console.log(SMTP_ENDPOINT);
  // console.log(SMTP_USERNAME);

  const { email, subject, message } = options;

  await transporter.sendMail({
    from: '"AutoLink" <noreply@autolink.ajaydeshmukh.dev>',
    sender: "noreply@autolink.ajaydeshmukh.dev",
    to: email,
    subject: subject,
    html: message,
  });

  console.log(`email has sent to ${email}`);
};

export default sendMail;
