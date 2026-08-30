import { Router } from "express";
import { searchRooms, searchUsers } from "../controllers/searchController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyToken);

router.get("/users", searchUsers);
router.get("/rooms", searchRooms);

export default router;
