import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  getAllVideos,
  deleteVideo,
  getVideoById,
  togglePublishStatus,
  updateVideo,
  publishAVideo,
} from "../controllers/video.controller.js";
const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllVideos);
router.route("/publish").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
router.route("/:videoId").get(getVideoById);
router.route("/:videoId/update").patch(upload.single("thumbnail"), updateVideo);
router.route("/:videoId/toggle/publish").patch(togglePublishStatus);
router.route("/:videoId/delete").delete(deleteVideo);

export default router
