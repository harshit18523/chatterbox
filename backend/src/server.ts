import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import initializeSocket from "./socket/index.js";
import authRouter from "./routes/authRoute.js";
import roomRouter from "./routes/roomRoute.js";
import searchRouter from "./routes/searchRoute.js";

const app = express();
const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use("/api/auth", authRouter);
app.use("/api/room", roomRouter);
app.use("/api/search", searchRouter);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
