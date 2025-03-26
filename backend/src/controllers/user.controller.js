import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"

const register = asyncHandler (async (req,res) => {
  const {fullname , username , email , password} = req.body;

  if([fullname, email, username, password].some((field) => (field?.trim() === ""))){
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{username} , {email}]
  })

  if(existedUser){
    throw new ApiError(409, "User with email or username already exist")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is  required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar){
    throw new ApiError(500, "Failed ro upload avatar")
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
})

export {
   register
}