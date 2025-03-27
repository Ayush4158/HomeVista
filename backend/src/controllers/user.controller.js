import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import { removeLocalFile } from "../utils/unlinkLocalFile.js"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken

    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

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

    removeLocalFile(avatarLocalPath);
  

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

const login = asyncHandler (async(req,res) => {
  const {email,password} = req.body;
  if(!email){
    throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({
      email
    })

    if(!user){
      throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
      new ApiResponse(
        200, 
        {
          user: loggedinUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    )
  })

  const logout = asyncHandler (async (req,res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined
        }
      },
      {
        new: true
      }
    )

    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User Logged out"))
  })

  const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
    if(!incomingRefreshToken){
      throw new ApiError(401, "unautohrize request")
    }
  
    try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
      const user = await User.findById(decodedToken?._id)
    
      if(!user){
        throw new ApiError(401, "Invalid refresh token")
      }
    
      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, " Refresh token is expired or used")
      }
  
    
      const options = {
        htmlOnly: true,
        secure: true
      }
  
    
      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  
      const newRefreshToken =  refreshToken
    
      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken
          },
          "Access token refreshed"
        )
      )
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  
  })

  const changeCurrentPassword = asyncHandler (async (req, res)=>{
    const {oldPassword, newPassword , confirmNewPassword} = req.body
  
    if(newPassword !== confirmNewPassword){
      throw new ApiError(401, "confirm password should be equal to new Password")
    }
  
    const user = await User.findById(req.user?._id)
  
    const passwordCheck = await user.isPasswordCorrect(oldPassword)
  
    if(!passwordCheck){
      throw new ApiError(400, " Invalid old password")
    }
    // console.log("old: ", user.password)
    user.password = confirmNewPassword
    await user.save({validateBeforeSave: false})
    console.log("new: ",user.password)
  
    return res
    .status(200)
    .json(new ApiResponse(200, {} , "password change successfully"))
  
  })

  const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullname, email } = req.body
  
    if(!fullname && !email){
      throw new ApiError(400, "All fields are required")
    }
  
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname,
          email
        }
      },
      {new: true}
    ).select("-password")
  
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details updated successfully" ))
  })
  
  const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
  
    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath)
  
    if(!avatar.url){
      throw new ApiError(400, "Error while uploading on avatart")
    }
  
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url
        }
      },
      {new : true}
    ).select("-password")
  
    //delete old avatar image
  
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Avatar updated successfully" ))
  })

  const getCurrentUser = asyncHandler (async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
  })

  const getUserByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "No user found with this id");
    }
  
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user
                },
                "user fatched successfully"
            ))
  })
  
  

export {
   register,
   login,
   logout,
   refreshAccessToken,
   changeCurrentPassword,
   updateAccountDetails,
   updateAvatar,
   getUserByUserId,
   getCurrentUser
}