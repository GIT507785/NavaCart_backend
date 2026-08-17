import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
       type:String,
       required:true,
       unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true ,
        unique:true
    },
    image:{
        type:String,
    },

      cartData: {
    type: Object,
    default: {},
  },

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
     
},{timestamps:true})

const userModel = mongoose.model("user" , userSchema)

export default userModel