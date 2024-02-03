import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import {uploadCloudinary} from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
      // get user details from frontend
      // check velidiation - not empty
      // check if user already is exists : username and email
      // check for image and check for avatar 
      // upload them to cludinary , avatar
      // create user object  - create entry in db
      // remove password and refresh token field from response 
      // check for user creation 
      // return response

      // 1. get user details from frontend
      const {username,fullName, email, password} = req.body;
      console.log("email:",email)

      //2. check velidiation - not empty
      if(
       [username,fullName,email,password].some((field)=>
       field?.trim()==="")
      ){
       throw new ApiError(400,"All filds are required");
      }
       
      //3. check if user already is exists : username and email
      const existedUser = User.findOne({
            $or:[{username},{email}]
      })
      if(existedUser){
            throw new ApiError(409,"User with email or username is already exist");
      }
      
      //4. check for image and check for avatar 
      const avatarLocalPath = req.files?.avatar[0]?.path;
      const coverImageLocalPath = req.files?.coverImage[0]?.path;
      
      if(!avatarLocalPath){
            throw new ApiError(400,"avatar filse is required");
      }

      //5. upload them to cludinary , avatar
      const avatar = await uploadCloudinary(avatarLocalPath);
      const coverImage = await uploadCloudinary(coverImageLocalPath);

      if(!avatar){
            throw new ApiError(400,"avatar file is required");
      }

      //6. create user object  - create entry in db
      const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url,
            email,
            password,
            username:username.toLowerCase()
      })

      //7. remove password and refresh token field from response 
      const createdUser  = await User.findById(user._id).select(
            "-passowrd -refreshToken"
      )
      //8. check for user creation
      if(!createdUser){
            throw new ApiError(500,"Something went wrong while registring the user");
      }

      //9. return response
      return res.status(201).json(
            new ApiResponse(200,createdUser,"User registerd successfully")
      )
})

export {registerUser};