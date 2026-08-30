import { Router } from "express";
import { createRoom, getRoomMessages } from "../controllers/roomController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyToken);

router.post("/create-room", createRoom);
router.get("/:roomId", getRoomMessages);

export default router;
