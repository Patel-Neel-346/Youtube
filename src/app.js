import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";

dotenv.config();
const app = express();
const Port=process.env.PORT || 3000;
// console.log(process.env.PORT);
connectDB();
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});