import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessTokenAndRefreshToken = async (userId) => {
      try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()

            //save in database
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false })

            return { accessToken, refreshToken }

      } catch (error) {
            throw new ApiError(500, "Somethings went worng when referesh token and access token generate");
      }
}


const registerUser = asyncHandler(async (req, res) => {
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
      const { username, fullName, email, password } = req.body;
      console.log("email:", email)

      //2. check velidiation - not empty
      if (
            [username, fullName, email, password].some((field) =>
                  field?.trim() === "")
      ) {
            throw new ApiError(400, "All filds are required");
      }

      //3. check if user already is exists : username and email
      const existedUser = await User.findOne({
            $or: [{ username }, { email }]
      })
      if (existedUser) {
            throw new ApiError(409, "User with email or username is already exist");
      }

      //4. check for image and check for avatar 
      const avatarLocalPath = req.files?.avatar[0]?.path;
      // const coverImageLocalPath = req.files?.coverImage[0]?.path;

      let coverImageLocalPath;
      if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
      }

      if (!avatarLocalPath) {
            throw new ApiError(400, "avatar filse is required");
      }

      //5. upload them to cludinary , avatar
      const avatar = await uploadCloudinary(avatarLocalPath);
      const coverImage = await uploadCloudinary(coverImageLocalPath);

      if (!avatar) {
            throw new ApiError(400, "avatar file is required");
      }

      //6. create user object  - create entry in db
      const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url,
            email,
            password,
            username: username.toLowerCase()
      })

      //7. remove password and refresh token field from response 
      const createdUser = await User.findById(user._id).select(
            "-passowrd -refreshToken"
      )
      //8. check for user creation
      if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registring the user");
      }

      //9. return response
      return res.status(201).json(
            new ApiResponse(200, createdUser, "User registerd successfully")
      )
});

const userLogin = asyncHandler(async (req, res) => {
      //request data from body
      //username and email
      //check the user is registerd or not;
      //check the passowrd 
      //access the refresh token
      //send cookies

      //1. request data from body
      const { username, email, password } = req.body;

      if (!(username || email)) {
            throw new ApiError(400, "username or email is required");
      }
      //alternative in this condition username and email both required if any one not required then user not could not be login
      //if(!username && !email){
      //       throw new ApiError(400,"username or email is required")
      // }

      // chechk user register or not
      const user = await User.findOne({
            $or: [{ username }, { email }]
      })

      if (!user) {
            throw new ApiError(404, "User is not exist");
      }
      //checking password 
      const isPasswordValid = await user.isPasswordCorrect(password);
      if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials!")
      }
      const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
      const loggedIndUser = await User.findById(user._id).
            select("-password -refreshToken")

      //options me jb hm cookie bhejte hai to user cookie ko chenge kar sakta hai so for security 
      //we use options httpOnly and secure ture after giving this properties only change the cookie from the server
      const options = {
            httpOnly: true,
            secure: true,
      }

      return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                  new ApiResponse(200,
                        {
                              user: loggedIndUser, accessToken, refreshToken
                        },
                        "User logged in successfully!"
                  )
            )
})

const userLogOut = asyncHandler(async (req, res) => {
      //remove the access token
      await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set: { accessToken: undefined }
            },
            {
                  new: true
            }
      )
      const options = {
            httpOnly: true,
            secure: true
      }

      return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                  new ApiResponse(
                        200,
                        {},
                        "User logOut Successfully!"
                  )
            )
})

export {
      registerUser,
      userLogin,
      userLogOut
};