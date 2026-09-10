const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The claimant's explanation of why the item belongs to them
    proofDetails: {
      type: String,
      required: [true, "Proof details are required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Prevent the same user from claiming the same item twice (business rule 3)
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });
claimSchema.index({ claimantId: 1, createdAt: -1 });

module.exports = mongoose.model("Claim", claimSchema);
