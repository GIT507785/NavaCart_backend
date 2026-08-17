import userModel from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import validator from "validator";
import bcrypt from 'bcrypt';
import productModel from "../models/product.js";
import orderModel from "../models/Order.js";
import cartModel from "../models/CartModel.js";
import mongoose from "mongoose";
dotenv.config();
export const registeruser = async (req, res) => {
    try {
        const { name, email, password, image } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "password should be 8 characters long" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({ name, email, password: hashedpassword, image });
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, message: "Register successfully", user, token });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: "email or password id required" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "invalid email or password" });
        }
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ success: true, message: "Login Successfully", user, token });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getAllproducts = async (req, res) => {
    try {
        const items = await productModel.find({});
        if (!items) {
            return res.json({ success: false, message: "Error to find Products" });
        }
        return res.json({ success: true, items });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const findProductById = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.json({ success: false, message: 'product id not found' });
        }
        const product = await productModel.findById(productId);
        return res.json({ success: true, product });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const getprofile = async (req, res) => {
    try {
        const { userId } = req.userId;
        if (!userId) {
            return res.json({ success: false, message: "User not found" });
        }
        const user = await userModel.findById(userId).populate("-password");
        return res.json({ success: true, user });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// create order in database 
export const placeOrder = async (req, res) => {
    try {
        // ==============================
        // USER FROM AUTH MIDDLEWARE
        // ==============================
        console.log("🔥 PLACE ORDER HIT");
        console.log("🔥 USER ID:", req.userId);
        console.log("🔥 BODY:", req.body);
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        // ==============================
        // REQUEST BODY
        // ==============================
        const { items, shippingAddress, paymentMethod, subTotal, shippingFee, tax, totalAmount, } = req.body;
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
            items: items.map((item) => ({
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
    }
    catch (error) {
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
export const getAllOrders = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// get order by id 
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.userId;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "order id not found" });
        }
        const order = await orderModel.findById(orderId).populate("addressId").populate("items.productId");
        return res.json({ success: true, order });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// order update 
export const updateOrder = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: "order id not found" });
        }
        const order = await orderModel.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
        return res.json({ success: true, order });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//cancle order 
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findByIdAndUpdate(orderId, {
            orderStatus: "Cancelled",
        }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// add to cart 
export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
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
        const addItem = await cartModel.create({
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
    }
    catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};
// update cart 
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
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
        }
        else {
            await cartModel.findByIdAndDelete(item._id);
        }
        return res.json({
            success: true,
            message: "Cart Updated",
        });
    }
    catch (error) {
        console.log("REMOVE CART ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// get all cart 
export const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("USER ID:", userId);
        const cart = await cartModel
            .find({ user: userId })
            .populate("product");
        console.log("CART FROM DATABASE:", cart);
        res.json({
            success: true,
            cart,
        });
    }
    catch (error) {
        console.log("GET CART ERROR:", error);
        res.json({
            success: false,
            message: error.message,
        });
    }
};
// update quantity 
export const updateQuantity = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.log("UPDATE QUANTITY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// delete all cart 
export const clearCart = async (req, res) => {
    try {
        const { userId } = req.userId;
        await cartModel.deleteMany({
            user: userId,
        });
        res.json({
            success: true,
            message: "Cart Cleared",
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};
