import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req,res)=>{
       res.status(504).json({
        name:'Dheeraj Rauniyar',
        age:22,
       })
})

export {registerUser};