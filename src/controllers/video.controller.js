import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";

import ApiError from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import  uploadOnCloudinary  from "../utils/cloudinary.js";
import  deleteFromCloudinary  from "../utils/deleteFromCloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const matchStage = {
    isPublished: true,
    ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
    ...(query && {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    })
  };

  const sortStage = {
    [sortBy]: sortType === "asc" ? 1 : -1
  };

  const videos = await Video.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    {
      $project: {
        "thumbnail": 1,
        title: 1,
        views: 1,
        owner: {
          _id: "$owner._id",
          fullname: "$owner.fullname",
          avatar: "$owner.avatar.url"
        },
        createdAt: 1,
        duration: 1
      }
    },
    { $sort: sortStage },
    { $skip: (pageNumber - 1) * limitNumber },
    { $limit: limitNumber }
  ]);

  if (!videos) {
    throw new ApiError(404, "Videos not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description, isPublished].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.video[0]?.path;
  if (!thumbnailLocalPath || !videoLocalPath) {
    throw new ApiError(400, "All fields are required");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const video = await uploadOnCloudinary(videoLocalPath);
  if (!(thumbnail && video)) {
    throw new ApiError(400, "All fields are required");
  }
  const videoDetails = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user._id,
    isPublished: isPublished === "true" ? true : false,
  });
  if (!videoDetails) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoDetails, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId).populate("owner", [
    "username",
    "avatar",
  ]);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Ownership check
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  video.title = title;
  video.description = description;

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (thumbnailLocalPath) {
    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!newThumbnail) {
      throw new ApiError(500, "Failed to upload new thumbnail");
    }
    await deleteFromCloudinary(video.thumbnail);
    video.thumbnail = newThumbnail.url;
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  if (videoLocalPath) {
    const newVideo = await uploadOnCloudinary(videoLocalPath);
    if (!newVideo) {
      throw new ApiError(500, "Failed to upload new video");
    }
    await deleteFromCloudinary(video.videoFile);
    video.videoFile = newVideo.url;
    video.duration = newVideo.duration || video.duration; // Optional: update duration
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  //check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }
  //delete the video from cloudinary
  await deleteFromCloudinary(video.videoFile);
  //delete the thumbnail from cloudinary
  await deleteFromCloudinary(video.thumbnail);
  //delete the video from the database
  await video.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  //check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      isPublished: !video.isPublished,
    },
    {
      new: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: updatedVideo.isPublished },
        "Video publish status updated successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
