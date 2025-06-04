import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (existingLike) {
    //like already exists, so remove it
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed successfully"));
  }
  const like = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (!like) {
    throw new ApiError(500, "Something went wrong while liking the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, like, "Like added successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });
    if (existingLike) {
        //like already exists, so remove it
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
    }
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });
    if (!like) {
        throw new ApiError(500, "Something went wrong while liking the comment");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, like, "Like added successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });
    if (existingLike) {
        //like already exists, so remove it
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Like removed successfully"));
    }
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });
    if (!like) {
        throw new ApiError(500, "Something went wrong while liking the tweet");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, like, "Like added successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        "avatar.url": 1
                                    }
                                }
                            ]
                        }
                    },
                    { $unwind: "$owner" }
                ]
            }
        },
        { $unwind: "$likedVideo" },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    owner: 1,
                    createdAt: 1
                }
            }
        }
    ]);

    if (!likedVideos.length) {
        throw new ApiError(404, "No liked videos found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos.map(item => item.likedVideo), "Liked videos fetched successfully"));
});


export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
