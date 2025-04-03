import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
const Port=process.env.PORT || 3000;
// console.log(process.env.PORT);

//connect to database
connectDB().then(()=>{
    console.log("Database connected successfully!!");
}).catch((err)=>{
    console.log(err);
});

//middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"30mb",extended:true}));
app.use(express.urlencoded({limit:"30mb",extended:true}));
app.use(express.static("public"));
app.use(cookieParser());    //cookie parser middleware

//import routes here
import UserRoute from "./routes/User_Route.js";


//use Router
app.use('/api/v1/user',UserRoute)

//routes
app.get("/", (req, res) => {
    res.send("Hello World");
});


//listen
app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});