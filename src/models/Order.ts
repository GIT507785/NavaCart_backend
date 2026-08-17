import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  description: string;
  size: string;
  quantity: number;
  price: number;
}

interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  orderStatus:
    | "Pending"
    | "Canceled"
    | "Delivered"
    | "OutForDelivery"
    | "Processing";
  subTotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  isDelivered: boolean;
  deliveredAt?: Date;
  isCancelled: boolean;
  cancelledAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },

    items: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },

        size: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },

      lastName: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      required: true,
      default: "cod",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Canceled",
        "Delivered",
        "OutForDelivery",
        "Processing",
      ],
      default: "Pending",
    },

    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model<IOrder>("order", orderSchema);

export default orderModel;