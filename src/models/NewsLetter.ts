import mongoose from "mongoose";

const letterSchema = new mongoose.Schema({
   
    email:{
        type:String,
        required:true,
         unique:true,
        trim:true
    }

},{timestamps:true})

const NewsletterModel = mongoose.model("newsletter" , letterSchema)

export default NewsletterModel