import { Router } from "express";
import { authMiddleware } from "../middleware";

const router = Router();

router.post("/signup", (req, res) => {
  console.log("signup handler");
});

router.post("/signin", (req, res) => {
  console.log("signin handler");
});

router.get("/user", authMiddleware, (req, res) => {
  console.log("auth handler");
});

export const userRouter = router;
