import { Router } from "express";
import { createRoom, getRoomDetails, getRoomMessages } from "../controllers/roomController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyToken);

router.post("/create-room", createRoom);
router.get("/messages/:roomId", getRoomMessages);
router.get("/:roomId", getRoomDetails);

export default router;
