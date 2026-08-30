import { Router } from "express";
import { createRoom } from "../controllers/roomController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyToken);

router.post("/create-room", createRoom);

export default router;
