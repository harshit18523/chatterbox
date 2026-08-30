import express from "express";
import { createServer } from "http";
import initializeSocket from "./socket/index.js";

const app = express();
const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
