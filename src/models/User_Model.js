import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },

    avatar:{
        type:String,//clodinary url
        required:true
    },

    coverImage:{
        type:String,//clodinary url
        
    },

    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],

    password:{
        type:String,
        required:true
    },

    refreshToken:{
        type:String
    },
    
},{
    timestamps:true
}
);

//this middleware is used for saving schema it means this middleware run every time where user made any changes into user schema

UserSchema.pre("save",function(next){
    if(!this.isModified("password")){
        next();
    }

    this.password=bcrypt.hash(this.password,10);
    console.log(this.password);
    next();
})


//this method is used for comparing password
UserSchema.methods.isPasswordCorrect=async function(password){
    return bcrypt.compare(password,this.password);
}

//this method is used for Refresh generating token

UserSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN
    })
}

//this method is used for Access generating token

UserSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
    })
}


const User=mongoose.model("User",UserSchema);

export default User;