import { sendEmail } from "../email";
import dotenv from "dotenv";
dotenv.config();

export async function notifyFailure(
  zapRunId: string,
  actionType: string,
  message: string
) {
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
    await sendEmail(adminEmail, body);
    console.log(`Failure email sent to ${adminEmail}`);
  } catch (e) {
    console.error("Failed to send admin alert email:", e);
  }
}
