import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
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

export async function sendEmail(to: string, body: string) {
  // send out the user email
  await transporter.sendMail({
    from: '"AutoLink" <noreply@autolink.ajaydeshmukh.dev>',
    sender: "noreply@autolink.ajaydeshmukh.dev",
    to,
    subject: "Hello from AutoLink",
    text: body,
  });

  console.log(`email has sent to ${to}`);
}
