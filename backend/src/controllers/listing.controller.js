import Listing from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {removeLocalFile} from '../utils/unlinkLocalFile.js'


export const createListing = asyncHandler(async (req,res) => {
  const { name, description, address, price, bathrooms, bedrooms } = req.body;

  if ([name, description, address, price, bathrooms, bedrooms].some(field => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
  }

  const existingListname = await Listing.findOne({name})
  const existingListadd = await Listing.findOne({address})

  if(existingListadd && existingListname){
    throw new ApiError(401, "Same property exist on this platform")
  }
  
  const imageLocalPaths = req.files?.image?.map(file => file.path) || [];
  
  if (imageLocalPaths.length === 0) {
      throw new ApiError(400, "Image is required");
  }
  
  // Upload images to Cloudinary and remove from local storage
  const uploadedImages = await Promise.all(
      imageLocalPaths.map(async (path) => {
          try {
              const result = await uploadOnCloudinary(path);
              removeLocalFile(path); // Remove local file after upload
              return result.url; // Store the Cloudinary image URL
          } catch (error) {
              throw new ApiError(500, "Failed to upload image");
          }
      })
  );
  
  if (!req.user) {
      throw new ApiError(401, "Please login to create list");
  }
  
  // Save the listing with image URLs in the database
  const list = await Listing.create({
      name,
      description,
      address,
      price,
      bathrooms,
      bedrooms,
      imageUrls: uploadedImages, // Store the array of image URLs
      userRef: req.user._id
  });
  
  if (!list) {
      throw new ApiError(500, "Something went wrong while creating the listing");
  }
  
  return res.status(201).json(new ApiResponse(200, list, "Listing created successfully"));
  
});

export const deleteListing = asyncHandler(async(req,res) => {
  const {listId} = req.params;

  const list = await Listing.findByIdAndDelete(listId)
  if(!list){
    throw new ApiError(404, "List not found")
  }

  return res.status(200).json(
    new ApiResponse(200, {} , "list has been deleted successfully")
  )
});

export const updatinglisting = asyncHandler(async (req,res) => {
  const {listId} = req.params;
  
  const {description, price, bathrooms, bedrooms} = req.body;

  const list = await Listing.findByIdAndUpdate(
    listId,
    {
      $set: {
        description: description,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
      }
    },
    {new : true}
  )

  if(!list){
    throw new ApiError(404, "List not found")
  }

  return res.status(200).json(
    new ApiResponse(200, {list}, "list is updated successfully")
  )
});

export const getListing = asyncHandler(async (req,res) => { 
  const {listId} = req.params

  let list = await Listing.findById(listId)

  if(!list){
    throw new ApiError(404, " List not found ")
  }

  return res.status(200).json(
    new ApiResponse(200, {list} , "list fetched successfully")
  )
})

export const getListings =asyncHandler( async (req, res) => {
  const { page = 1, limit = 40, query, sortBy, sortType, userId } = req.query;
  const skip = (page-1)*limit
  const list = await Listing.aggregate([
    {
      $skip: skip
    },
    {
      $limit: limit
    },
    {
      $sort: {createdAt: -1}
    }
  ]);

  if(!list?.length){
    throw new ApiError(404, "No videos found")
  }

  return res.status(200).json(
    new ApiResponse(200, list, "List fetched successfullt")
  )
});