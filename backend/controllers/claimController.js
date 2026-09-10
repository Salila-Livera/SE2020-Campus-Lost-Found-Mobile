const { body } = require("express-validator");
const Claim = require("../models/Claim");
const Item = require("../models/Item");

// ── Validation rules ──────────────────────────────────────────────────────────
const claimRules = [
  body("itemId").notEmpty().withMessage("itemId is required"),
  body("proofDetails").trim().notEmpty().withMessage("Proof details are required"),
];

const updateClaimRules = [
  body("proofDetails").trim().notEmpty().withMessage("Proof details are required"),
];

const statusRules = [
  body("status")
    .isIn(["Approved", "Rejected"])
    .withMessage("Status must be Approved or Rejected"),
];

// ── POST /api/claims ──────────────────────────────────────────────────────────
// Submit a new claim on a Found item
const createClaim = async (req, res, next) => {
  try {
    const { itemId, proofDetails } = req.body;
    const claimantId = req.user._id;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Business rule 1: cannot claim your own item
    if (item.postedBy.toString() === claimantId.toString()) {
      return res.status(403).json({ message: "You cannot claim your own item" });
    }

    // Business rule 2: claims only on Found + Open items
    if (item.itemType !== "Found") {
      return res.status(400).json({ message: "You can only claim Found items" });
    }
    if (item.status !== "Open") {
      return res
        .status(400)
        .json({ message: "This item has already been returned" });
    }

    // Business rule 3: no duplicate claims (also enforced by unique DB index)
    const existing = await Claim.findOne({ itemId, claimantId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already claimed this item" });
    }

    const claim = await Claim.create({ itemId, claimantId, proofDetails });
    res.status(201).json(claim);
  } catch (error) {
    // Mongo duplicate-key error code 11000 — the unique index caught a race condition
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already claimed this item" });
    }
    next(error);
  }
};

// ── GET /api/claims/my ────────────────────────────────────────────────────────
// All claims the logged-in user has submitted
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate("itemId", "title itemType category location status image")
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/items/:itemId/claims ─────────────────────────────────────────────
// Item owner sees all claims on their item
const getClaimsForItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Only the item owner can view the claims list
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to view claims on this item" });
    }

    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate("claimantId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/claims/:id ───────────────────────────────────────────────────────
// Accessible by the claimant OR the item owner
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("itemId", "title itemType status postedBy")
      .populate("claimantId", "name email phone");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const userId = req.user._id.toString();
    const isClaimant = claim.claimantId._id.toString() === userId;
    const isOwner = claim.itemId.postedBy.toString() === userId;

    if (!isClaimant && !isOwner) {
      return res.status(403).json({ message: "Not authorised to view this claim" });
    }

    res.json(claim);
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/claims/:id ───────────────────────────────────────────────────────
// Claimant can update proofDetails, but only while the claim is still Pending
const updateClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    // Only the original claimant can edit
    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised to edit this claim" });
    }

    // Cannot edit once a decision has been made
    if (claim.status !== "Pending") {
      return res
        .status(409)
        .json({ message: "Cannot edit a claim that is no longer Pending" });
    }

    claim.proofDetails = req.body.proofDetails;
    const updated = await claim.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/claims/:id/status ──────────────────────────────────────────────
// Item owner approves or rejects a claim
// Business rules 4 & 5: approving one claim closes the item and rejects all others
const updateClaimStatus = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("itemId");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const item = claim.itemId; // already populated

    // Only the item owner can approve/reject
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to update this claim" });
    }

    // Business rule 5: can only act on a Pending claim
    if (claim.status !== "Pending") {
      return res
        .status(409)
        .json({ message: "This claim has already been resolved" });
    }

    const { status } = req.body; // "Approved" or "Rejected"

    if (status === "Approved") {
      // Business rule 4 & 5: approve this claim, close the item,
      // and reject every other Pending claim on the same item
      claim.status = "Approved";
      item.status = "Returned";

      await Promise.all([
        claim.save(),
        item.save(),
        // Reject all other Pending claims on this item in one DB operation
        Claim.updateMany(
          {
            itemId: item._id,
            _id: { $ne: claim._id }, // exclude the approved claim
            status: "Pending",
          },
          { status: "Rejected" }
        ),
      ]);
    } else {
      // Simply reject this one claim
      claim.status = "Rejected";
      await claim.save();
    }

    res.json(claim);
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/claims/:id ────────────────────────────────────────────────────
// Claimant can withdraw their claim only while it is still Pending
const deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    // Only the claimant can cancel
    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this claim" });
    }

    // Cannot cancel a claim that's already been decided
    if (claim.status !== "Pending") {
      return res
        .status(409)
        .json({ message: "Cannot delete a claim that is no longer Pending" });
    }

    await claim.deleteOne();
    res.json({ message: "Claim withdrawn" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  claimRules,
  updateClaimRules,
  statusRules,
  createClaim,
  getMyClaims,
  getClaimsForItem,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim,
};
