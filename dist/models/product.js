import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    size: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    bestSeller: {
        type: Boolean,
        default: false
    },
    image: {
        type: [String],
        required: true
    }
}, { timestamps: true });
const productModel = mongoose.model('product', productSchema);
export default productModel;
