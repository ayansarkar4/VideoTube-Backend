import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
const router = Router();
router.use(verifyJWT);
router.route("/toggole/v/videoId").post(toggleVideoLike);
router.route("/toggole/c/commentId").post(toggleCommentLike);
router.route("/toggole/t/tweetId").post(toggleTweetLike);
router.route("/likedVideos").get(getLikedVideos);

export default Router();
