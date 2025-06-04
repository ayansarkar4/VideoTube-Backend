import { Router } from "express";
import {
    createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.use(verifyJWT);
router.route("/create").post(createPlaylist)
router.route("/:playlistId").get(getPlaylistById)
router.route("/update/:playlistId").patch(updatePlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;