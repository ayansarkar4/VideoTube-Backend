import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/:videoId").get(getVideoComments);
router.route("/:videoId/add").post(addComment);
router.route("/:commentId/update").patch(updateComment);
router.route("/:commentId/delete").delete(deleteComment);

export default Router();
