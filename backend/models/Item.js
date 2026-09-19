const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // "Lost" = someone lost it and is looking; "Found" = someone found it
    itemType: {
      type: String,
      enum: ["Lost", "Found"],
      required: [true, "Item type is required"],
    },
    category: {
      type: String,
      enum: ["Electronics", "Books", "ID Cards", "Clothing", "Accessories", "Other"],
      default: "Other",
    },
    location: {
      type: String,
      trim: true,
    },
    dateReported: {
      type: Date,
      default: Date.now,
    },
    // Cloudinary URL stored here after upload (set in the controller)
    image: {
      type: String,
    },
    // Cloudinary public_id so we can delete the image when the item is deleted
    imagePublicId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Open", "Returned"],
      default: "Open",
    },
    // The user who posted this item
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// DB indexes for efficient item queries
itemSchema.index({ itemType: 1, status: 1, createdAt: -1 });
itemSchema.index({ postedBy: 1, createdAt: -1 });
itemSchema.index({ category: 1 });

module.exports = mongoose.model("Item", itemSchema);
