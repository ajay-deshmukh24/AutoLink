import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import bcrypt from "bcryptjs";
import { createActivationToken } from "../util/activationToken";
import sendMail from "../util/sendMail";

const router = Router();

router.post("/signup", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("signup handler");
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username,
    },
  });

  if (userExists) {
    return res.status(403).json({
      message: "user already exists",
    });
  }

  const user = {
    name: parsedData.data.name,
    email: parsedData.data.username,
    password: parsedData.data.password,
  };
  console.log(user.email);

  try {
    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };

    await sendMail({
      email: user.email,
      message: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #111827;">Welcome, <strong>${user.name}</strong>!</h2>
  <p style="color: #374151; font-size: 16px;">
    Your activation code is:
    <strong style="color: #111827; font-size: 18px;">${activationCode}</strong>
  </p>
  <p style="color: #374151; font-size: 16px;">
    Or simply click the button below to verify your account:
  </p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="http://localhost:3001/verify?token=${activationToken.token}"
       target="_blank"
       style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
      Verify My Account
    </a>
  </div>
  <p style="color: #6b7280; font-size: 14px; text-align: center;">
    This link will expire in <strong>5 minutes</strong>.
  </p>
  <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    If you didn't sign up for this account, you can safely ignore this email.
  </p>
</div>
  `,
      subject: "Email Verification",
    });

    return res.status(201).json({
      success: true,
      message: `Please check your email: ${user.email} `,
      token: activationToken.token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }

  // TODO: send verify email to  user on signup
}) as RequestHandler);

router.post("/verify-user", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.body.token;
    const activationCodeFromUser = req.body.activationCode;

    const decoded: JwtPayload = jwt.verify(token, JWT_PASSWORD) as JwtPayload;
    console.log("decoded", decoded);

    const user = decoded.user;
    const activationCodeFromToken = decoded.activationCode;
    // const activationCode = decoded.activationCode as number;
    console.log("user ", user);
    console.log("activationCodeFromUser ", activationCodeFromUser);

    if (
      activationCodeFromUser &&
      activationCodeFromUser !== activationCodeFromToken
    ) {
      return res.status(403).json({ message: "Invalid activation code" });
    }

    const userExists = await prismaClient.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (userExists) {
      return res.status(403).json({
        message: "User already exists",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    console.log(hashedPassword);

    await prismaClient.user.create({
      data: {
        email: user.email,
        // TODO: Dont store passwords in plaintext, hash it
        password: hashedPassword,
        name: user.name,
        isVerified: true,
      },
    });

    return res.status(200).json({ message: " registered successfully" });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Verification link expired" });
    }
    res.status(500).json({ message: "Internal server error", error });
  }
}) as RequestHandler);

router.post("/signin", (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("signin handler");
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(411).json({
      message: "incorrect inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Sorry credentials are incorrect",
    });
  }

  console.log(user);

  // check if user is verified
  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your Email",
    });
  }

  // check if password is correct
  const hashedPassword = user.password;
  const isMatch = await bcrypt.compare(
    parsedData.data?.password,
    hashedPassword
  );

  if (!isMatch) {
    return res.status(403).json({
      message: "Sorry your credentials are incorrect",
    });
  }

  // sign in with jwt
  const token = jwt.sign(
    {
      id: user?.id,
    },
    JWT_PASSWORD
  );

  res.json({
    token: token,
  });
}) as RequestHandler);

router.get("/", authMiddleware, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("auth handler");

  // TODO: Fix the type
  // @ts-ignore
  const id = req.id;

  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  res.json({
    user,
  });
}) as RequestHandler);

export const userRouter = router;
