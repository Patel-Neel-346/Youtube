import mongoose from "mongoose";

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

const User=mongoose.model("User",UserSchema);

export default User;