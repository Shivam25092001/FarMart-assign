import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter your name"],
        maxlength: [40, "Name should not exceed more than 40 charecters"],
        minlength: [4, "Name cannot be smaller than 4 charecters"]
    },
    email:{
        type: String,
        required: [true, "Please enter your email ID"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Please Enter your password"],
        minlength: [8, "Password cannot be smaller than 8 charecetrs"],
        select: false,
    },
});


//Encrypting the password before it gets saved to the db
userSchema.pre("save", async function(next){
    //in-case of update & no password change - (to prevent password re-hashing)
    if(!this.isModified("password")){
        next();
    }

    this.password  = await bcrypt.hash(this.password, 10);
});


//JWT Token
userSchema.methods.getJWT = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
}


//Password Check
userSchema.methods.comparePassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword, this.password);
}


export default mongoose.model('User', userSchema);