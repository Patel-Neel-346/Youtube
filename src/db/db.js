import mongoose from "mongoose";
import DBName from "../constansts.js";
// import { DBName } from "../constansts/constansts.js";

const connectDB=async()=>{
    try {
        // console.log(`${process.env.MONGO_DB_URI}`);
        const connectionInstance=await mongoose.connect(`mongodb://localhost:27017/${DBName}`)
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;

