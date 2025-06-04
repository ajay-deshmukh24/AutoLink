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
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import bcrypt from "bcryptjs";

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

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(parsedData.data?.password, salt);

  await prismaClient.user.create({
    data: {
      email: parsedData.data?.username!,
      // TODO: Dont store passwords in plaintext, hash it
      password: hashedPassword,
      name: parsedData.data?.name!,
    },
  });

  // TODO: send verify email to  user on signup

  res.json({
    message: "please verify your account by checking your email",
  });
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
      message: "Incorrect email",
    });
  }

  console.log(user);

  const hashedPassword = user.password;
  const isMatch = await bcrypt.compare(
    parsedData.data?.password,
    hashedPassword
  );

  if (!isMatch) {
    return res.status(403).json({
      message: "Incorrect password",
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
