import express from "express";
import { userRouter } from "./routes/user";
import { zapRouter } from "./routes/zap";

const app = express();

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);

app.listen(3000, () => "app is listening to the port");
