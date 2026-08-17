import jwt from "jsonwebtoken";
import productModel from "../models/product.js";
import fs from 'fs';
import imagekit from '../config/imageKit.js';
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ sucess: false, message: "invalid credentials" });
        }
        const token = jwt.sign({ email }, process.env.JWT_SECRET);
        res.json({ success: true, message: "Login Successfully", token });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const addProduct = async (req, res) => {
    try {
        // Parse product data
        const { name, description, category, subCategory, size, price, bestSeller, } = JSON.parse(req.body.product);
        // Get uploaded files
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images uploaded",
            });
        }
        const imageUrls = [];
        for (const file of files) {
            const uploaded = await imagekit.upload({
                file: fs.readFileSync(file.path),
                fileName: file.originalname,
                folder: "/products",
            });
            imageUrls.push(uploaded.url);
        }
        // Save product
        const product = await productModel.create({
            name,
            description,
            category,
            subCategory,
            size,
            price,
            bestSeller,
            image: imageUrls,
        });
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getSingleProductById = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({ success: false, message: "product id not found" });
        }
        const product = await productModel.findById(id);
        return res.json({ success: true, product });
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
        const products = await productModel.find({});
        if (!products) {
            return res.json({ success: false, message: "product  not found" });
        }
        return res.json({ success: true, products });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const deleteProductById = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.json({ success: false, message: "product id not found" });
        }
        const deleteProduct = await productModel.findByIdAndDelete(productId);
        return res.json({ success: true, message: "Product deleted Successfully", deleteProduct });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const editProduct = async (req, res) => {
    try {
        const { peroductId } = req.body;
        const { name, description, category, subCategory, size, price, bestseller } = req.body;
        const image = req.file;
        let imageUrl = "";
        if (image) {
            const uploadImage = imagekit.upload({
                file: fs.readFileSync(image.path),
                fileName: image.orignalname,
                folder: '/products'
            });
            imageUrl = (await uploadImage).url;
            //local image delete
            fs.unlinkSync(image.path);
        }
        const product = await productModel.findByIdAndUpdate(peroductId, {
            name,
            description,
            category,
            subCategory,
            price,
            size,
            bestseller,
            image: [imageUrl]
        });
        res.json({ success: false, message: "product added Successfully", product });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
