import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserByUserId, login, logout, register, updateAccountDetails, updateAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
  {name: "avatar", maxCount:1},
]), register)
router.route("/login").post(login)
router.route("/u/:userId").get(getUserByUserId)

//secure routes
router.route("/logout").post(verifyJWT, logout)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/get-user").post(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar") ,updateAvatar)


export default router