import express from "express";
import { userRouter } from "./routes/user";
import { zapRouter } from "./routes/zap";
import { triggerRouter } from "./routes/trigger";
import { actionRouter } from "./routes/action";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);
app.use("/api/v1/trigger", triggerRouter);
app.use("/api/v1/action", actionRouter);

app.listen(PORT, () =>
  console.log(`primary-backend is listening to the port ${PORT}`)
);

// docker build -f apps/primary-backend/Dockerfile -t primary-backend-service .
// docker run -p 3000:3000 primary-backend-service
