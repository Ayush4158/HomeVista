import { Router } from "express";
import { createListing, deleteListing, getListing, getListings, updatinglisting } from "../controllers/listing.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route('/').get(getListings)

router.route("/create").post(verifyJWT, upload.fields([
  {name: "image", maxCount:5},
]), createListing)

router.route('/:listId').get(getListing).delete(verifyJWT, deleteListing).patch(verifyJWT, updatinglisting)


export default router;