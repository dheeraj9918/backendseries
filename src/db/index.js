import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import express from 'express';

// const app = express();

const connectDB = async ()=>{
    try {
      const mongodbConnection =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
      console.log(`MongoDB connection successfully !! DB Host:: ${mongodbConnection.connection.host}`);
    } catch (error) {
        console.log("MONGOOSE connection ERROR",error);
        process.exit(1);
    }
}

export default connectDB;