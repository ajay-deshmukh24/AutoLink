import { Router } from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

router.post("/signup", async (req, res) => {
  // console.log("signup handler");
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username,
    },
  });

  if (userExists) {
    res.status(403).json({
      message: "user already exists",
    });
  }

  await prismaClient.user.create({
    data: {
      email: parsedData.data?.username!,
      // TODO: Dont store passwords in plaintext, hash it
      password: parsedData.data?.password!,
      name: parsedData.data?.name!,
    },
  });

  // TODO: send verify email to  user on signup

  res.json({
    message: "please verify your account by checking your email",
  });
});

router.post("/signin", async (req, res) => {
  // console.log("signin handler");
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    res.status(411).json({
      message: "incorrect inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data?.username,
      password: parsedData.data?.password,
    },
  });

  if (!user) {
    res.json({
      message: "Incorrect username or password",
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
});

router.get("/user", authMiddleware, async (req, res) => {
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
});

export const userRouter = router;
