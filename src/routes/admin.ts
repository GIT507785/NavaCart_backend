import express from 'express'
import { addProduct, adminLogin, deleteProductById, editProduct, getAllOrders, getAllproducts, 
    getSingleProductById } from '../Controller/Admin.js'
import upload from '../config/multer.js'
import { cancelOrder } from '../Controller/user.js'

const adminRouter = express.Router()


adminRouter.post('/login' , adminLogin)
adminRouter.post('/addproduct' , upload.array("image", 4) ,addProduct)
adminRouter.get('/getproducts' , getAllproducts)
adminRouter.get('/getproductById' ,  getSingleProductById)
adminRouter.delete('/deleteProduct' , deleteProductById)
adminRouter.put('/editproduct' , editProduct)

adminRouter.get('/allOrders' , getAllOrders)
adminRouter.post('/cancelOrder' , cancelOrder)






export default adminRouter