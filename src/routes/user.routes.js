import { Router } from "express";
import { registerUser, userLogOut, userLogin } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { verfiyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(userLogin);

//secured rout
router.route("/logout").post(verfiyJwt,userLogOut)


export default router;