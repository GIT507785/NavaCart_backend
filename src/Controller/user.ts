import { Request  , Response} from "express"
import userModel from "../models/User.js"
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
import validator from "validator";
import bcrypt from 'bcrypt'
import productModel from "../models/product.js";
import orderModel from "../models/Order.js";
import cartModel from "../models/CartModel.js";
import mongoose from "mongoose";
import NewsletterModel from "../models/NewsLetter.js";

dotenv.config()
export const registeruser = async (req:Request , res:Response) =>{
  
  try {
        
    const {name , email , password , image} = req.body
         
         if(!name || !email || !password){
             return res.json({success:false , message:"Missing required fields"})
            }

            if(password.length < 8){
             return res.json({success:false , message:"password should be 8 characters long"})

            }

            if(!validator.isEmail(email)){
            return res.json({success:false  , message:"Please enter a valid email"})
          }
          
          const salt = await bcrypt.genSalt(10)
          const  hashedpassword = await bcrypt.hash(password, salt)
          
          const user = await userModel.create({name, email, password:hashedpassword, image})
          
          const token = jwt.sign({
                id:user._id 
            } , process.env.JWT_SECRET! , {expiresIn:"7d"})

            res.json({success:true , message:"Register successfully" , user , token})
            
            
          } catch (error:any) {
            res.status(500).json({
      success: false,
      message: error.message,
    });
        }
        
}

export const loginUser = async (req:Request , res:Response) =>{
  try {
        
    const {email , password} = req.body
        
    if(!email || !password){
         return res.json({success:false, message :"email or password id required"})
        }

        const user = await userModel.findOne({email})         

        if(!user){
            return res.json({success:false , message:"User not found"})
          }
          
          const isMatch = await  bcrypt.compare(password , user.password)
          
          if(!isMatch){
            return res.json({success:false , message:"invalid email or password"})
          }

          const token = jwt.sign({
            id:user._id 
          } , process.env.JWT_SECRET! , {expiresIn:"7d"})
         

          return res.status(200).json({success:true , message:"Login Successfully" , user , token})

          
        } catch (error:any) {
          res.status(500).json({
            success: false,
            message: error.message,
          });   
        }
      }
      
      
      export const  getAllproducts =async (req:Request , res:Response) => {
        try {
          
          const items = await productModel.find({})
          
          if(!items){
        return res.json({success:false , message:"Error to find Products"})
      }
      return res.json({success:true , items})
      
    } catch (error:any) {
    res.json({success:false, message:error.message})
  }
}

export const findProductById = async(req:Request , res:Response) =>{
 try {
    
   const {productId} = req.body

   if(!productId){
        return res.json({success:false , message:'product id not found'})
      }

      const product = await productModel.findById(productId)
      return res.json({success:true , product})
      
      
    } catch (error:any) {
      res.json({success:false, message:error.message})
      
    }
  }
  
  
  export const getprofile = async (req:any , res:Response)=>{
    try {
        
      const {userId} = req.userId
        
      if(!userId){
            return res.json({success:false , message:"User not found"})
          }

        const user =  await userModel.findById(userId).populate("-password")
        
        return res.json({success:true , user})
        
      } catch (error:any) {
        res.json({success:false, message:error.message})
        
      }
    }
    
    // create order in database 

export const placeOrder = async (
  req: Request,
  res: Response
) => {
  try {
    // ==============================
    // USER FROM AUTH MIDDLEWARE
    // ==============================

     console.log("🔥 PLACE ORDER HIT");
    console.log("🔥 USER ID:", (req as any).userId);
    console.log("🔥 BODY:", req.body)

    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ==============================
    // REQUEST BODY
    // ==============================

    const {
      items,
      shippingAddress,
      paymentMethod,
      subTotal,
      shippingFee,
      tax,
      totalAmount,
    } = req.body;

    // ==============================
    // BASIC CHECK
    // ==============================

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // ==============================
    // CREATE ORDER
    // ==============================

    const order = await orderModel.create({
      userId: new mongoose.Types.ObjectId(userId),

      items: items.map((item: any) => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        name: item.name,
        image: item.image,
        description: item.description || "",
        size: item.size,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),

      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },

      paymentMethod,

      subTotal: Number(subTotal),

      shippingFee: Number(shippingFee || 0),

      tax: Number(tax || 0),

      totalAmount: Number(totalAmount),

      orderStatus: "Pending",

      isDelivered: false,

      isCancelled: false,
    });

    // ==============================
    // SUCCESS
    // ==============================

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error: any) {
    console.log("========== PLACE ORDER ERROR ==========");
    console.log(error);
    console.log("MESSAGE:", error.message);
    console.log("=======================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};




//get allorders 

export const getAllOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await orderModel
    .find()
    .populate("userId")
    .populate("addressId")
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get order by id 

export const getOrderById = async (req:Request , res:Response)=>{
    try {
        
      const {orderId} = req.params
      
      if(!orderId){
            return res.status(400).json({success:false , message:"order id not found"})
          }
          
          const order = await orderModel.findById(orderId).populate("addressId").populate("items.productId")
          
          return  res.json({success:true , order})
          
          
        } catch (error:any) {
          return res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

// order update 
export const updateOrder = async (req:Request , res:Response)=>{
  try {
    
    const {orderId , orderStatus} = req.body
    
    if(!orderId){
            return res.json({success:false , message:"order id not found"})
          }
          
          const order = await orderModel.findByIdAndUpdate(orderId , {orderStatus} , {new: true} )

        return res.json({success:true , order})
        

    } catch (error:any) {
              return res.status(500).json({
      success: false,
      message: error.message,
    })
    }
}

//cancle order 
export const cancelOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.body;
    
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      {
        orderStatus: "Cancelled",
      },
      { new: true }
    );

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }
    
    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// add to cart 


export const addToCart = async (req:Request, res: Response) => {
  try {

    const userId = (req as any).userId
        const { productId, size } = req.body;

    if (!userId || !productId || !size) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const existing = await cartModel.findOne({
      user: userId,
      product: productId,
      size,
    });

    if (existing) {

      existing.quantity += 1;

      await existing.save();

      return res.json({
        success: true,
        message: "Quantity Updated",
      });
    }
   const addItem =  await cartModel.create({
      user: userId,
      product: productId,
      size,
      quantity: 1,
    });

    res.json({
      success: true,
      message: "Added To Cart",
      addItem
    });

  } catch (error: any) {

    res.json({
      success: false,
      message: error.message,
    });

  }
};


// update cart 

export const removeFromCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId;
    const { productId, size } = req.body;

    if (!userId || !productId || !size) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const item = await cartModel.findOne({
      user: userId,
      product: productId,
      size,
    });

    if (!item) {
      return res.json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      await item.save();
    } else {
      await cartModel.findByIdAndDelete(item._id);
    }

    return res.json({
      success: true,
      message: "Cart Updated",
    });
  } catch (error: any) {
    console.log("REMOVE CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all cart 

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    console.log("USER ID:", userId);

    const cart = await cartModel
      .find({ user: userId })
      .populate("product");

    console.log("CART FROM DATABASE:", cart);

    res.json({
      success: true,
      cart,
    });
  } catch (error: any) {
    console.log("GET CART ERROR:", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// update quantity 
export const updateQuantity = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId;
    const { productId, size, quantity } = req.body;

    if (!userId || !productId || !size || quantity === undefined) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (quantity < 1) {
      return res.json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const item = await cartModel.findOne({
      user: userId,
      product: productId,
      size,
    });

    if (!item) {
      return res.json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity = quantity;

    await item.save();

    return res.json({
      success: true,
      message: "Quantity updated successfully",
      cartItem: item,
    });
  } catch (error: any) {
    console.log("UPDATE QUANTITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete all cart 
export const clearCart = async (
  req: any,
  res: Response
) => {

  try {

    const { userId } = req.userId

    await cartModel.deleteMany({
      user: userId,
    });

    res.json({
      success: true,
      message: "Cart Cleared",
    });

  } catch (error: any) {

    res.json({
      success: false,
      message: error.message,
    });

  }
};

// news letter =================

export const newsLetterSubscribe = async(req:Request , res:Response)=>{
  try {
    
     const {email} = req.body

      if(!email){
        return res.status(400).json({success:false , message: "email not found",})
      }

     const isExisting = await NewsletterModel.findOne({email : email.toLowerCase().trim()})

      if(isExisting){
        return res.status(400).json({success:false , message: "This email is already subscribed",})
      }

       if(!validator.isEmail(email)){
        return res.status(400).json({success:false , message: "please enter a valid email",})
       }

         await NewsletterModel.create({
          email: email.toLowerCase().trim()
         })
        
        return res.status(200).json({success:true ,   message: "Successfully subscribed to newsletter 🎉"})
 
  } catch (error:any) {
       return res.status(500).json({
      success: false,
      message: "Something went wrong",
    }); 
  }
}


// ============wish list ===========

export const addToWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.body;
    const userId = (req as any).userId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyInWishlist = user.wishlist.includes(productId);

    if (alreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    user.wishlist.push(productId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist ❤️",
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================get wish list of user=====================

export const getWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).userId;

    const user = await userModel
      .findById(userId)
      .populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================remove wish list of user=====================


export const removeFromWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const userId = (req as any).userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    }); 

  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};