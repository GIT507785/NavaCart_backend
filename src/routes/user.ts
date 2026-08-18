import express from 'express'
import {  addToCart, addToWishlist, cancelOrder, clearCart, findProductById , getAllproducts, getCart, getprofile, getUserOrders, getWishlist, loginUser, newsLetterSubscribe, placeOrder,
registeruser, removeFromCart, removeFromWishlist,  
updateQuantity,
updateUserOrder} from '../Controller/user.js'
import authUser from '../middleware/auth.js'


const userRouter = express.Router()

userRouter.post('/register' , registeruser)
userRouter.post("/login" , loginUser)       
userRouter.get("/allproducts" , getAllproducts)
userRouter.post('/productDetails' , findProductById)
userRouter.get("/profile" , getprofile)


userRouter.post('/placeOrder' , authUser, placeOrder)
userRouter.put('/updateUserOrder' , authUser ,updateUserOrder)
userRouter.get('/myorders' ,  authUser ,getUserOrders)
userRouter.put("/cancleOrder" , authUser ,cancelOrder)

  


userRouter.post("/addtocart",  authUser,addToCart);
userRouter.get("/getCart", authUser ,getCart);
userRouter.post("/update-quantity",authUser, updateQuantity);
userRouter.post("/remove-cart", authUser, removeFromCart);
userRouter.delete("/clear-cart", authUser , clearCart);

userRouter.post('/subscribe'  ,newsLetterSubscribe)
userRouter.post(
  "/addWishlist",
  authUser,
  addToWishlist
);

userRouter.get(
  "/getWishlist",
  authUser,
  getWishlist
);

userRouter.delete(
  "/removeWishlist/:productId",
  authUser,
  removeFromWishlist
);

export default userRouter
