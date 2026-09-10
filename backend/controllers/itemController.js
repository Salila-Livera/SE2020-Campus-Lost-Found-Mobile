const { body } = require("express-validator");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Item = require("../models/Item");
const Claim = require("../models/Claim"); // needed for cascade delete

// ── Validation rules ──────────────────────────────────────────────────────────
const itemRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("itemType")
    .isIn(["Lost", "Found"])
    .withMessage("itemType must be Lost or Found"),
  body("category")
    .optional()
    .isIn(["Electronics", "Books", "ID Cards", "Clothing", "Accessories", "Other"])
    .withMessage("Invalid category"),
  body("status")
    .optional()
    .isIn(["Open", "Returned"])
    .withMessage("Status must be Open or Returned"),
];

// ── Helper: upload a buffer to Cloudinary via a stream ────────────────────────
// Multer's memory storage gives us req.file.buffer — we pipe it to Cloudinary
// instead of reading from disk (which doesn't exist on Render's free tier).
const uploadToCloudinary = (buffer, folder = "campusfind") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ── POST /api/items ───────────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { title, description, itemType, category, location, dateReported } =
      req.body;

    let image, imagePublicId;

    // Upload image to Cloudinary if attached; fall back to base64 data URI if unconfigured or fails
    if (req.file) {
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_API_SECRET &&
        !/^[*]+$/.test(process.env.CLOUDINARY_API_SECRET) &&
        process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          image = result.secure_url;
          imagePublicId = result.public_id;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed, falling back to base64 data URI:", uploadErr.message);
          image = `data:${req.file.mimetype || "image/jpeg"};base64,${req.file.buffer.toString("base64")}`;
        }
      } else {
        console.warn("Cloudinary API secret is placeholder/unconfigured. Storing image as data URI fallback.");
        image = `data:${req.file.mimetype || "image/jpeg"};base64,${req.file.buffer.toString("base64")}`;
      }
    }

    const item = await Item.create({
      title,
      description,
      itemType,
      category,
      location,
      dateReported,
      image,
      imagePublicId,
      postedBy: req.user._id, // set from the JWT via protect middleware
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// Helper: escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── GET /api/items ────────────────────────────────────────────────────────────
// Supports query params: itemType, category, status, search (title/description)
const getItems = async (req, res, next) => {
  try {
    const { itemType, category, status, search } = req.query;
    const filter = {};

    if (itemType && ["Lost", "Found"].includes(itemType)) filter.itemType = itemType;
    if (category && typeof category === "string") filter.category = category;
    if (status && ["Open", "Returned"].includes(status)) filter.status = status;

    // Case-insensitive safe text search across title and description
    if (search && typeof search === "string" && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("postedBy", "name email phone") // include poster's contact info
      .sort({ createdAt: -1 }); // newest first

    res.json(items);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/items/my ─────────────────────────────────────────────────────────
// Returns only items posted by the logged-in user
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// ── GET /api/items/:id ────────────────────────────────────────────────────────
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "postedBy",
      "name email phone"
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/items/:id ────────────────────────────────────────────────────────
// Owner only. Replaces the image on Cloudinary if a new one is uploaded.
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Only the person who posted this item can edit it
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised to edit this item" });
    }

    const { title, description, itemType, category, location, dateReported, status } =
      req.body;

    // If a new image was uploaded, delete the old one from Cloudinary first
    if (req.file) {
      if (item.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(item.imagePublicId);
        } catch (cErr) {
          console.warn("Could not delete old Cloudinary image:", cErr.message);
        }
      }
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_API_SECRET &&
        !/^[*]+$/.test(process.env.CLOUDINARY_API_SECRET) &&
        process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

      if (isCloudinaryConfigured) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          item.image = result.secure_url;
          item.imagePublicId = result.public_id;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed in update, falling back to base64:", uploadErr.message);
          item.image = `data:${req.file.mimetype || "image/jpeg"};base64,${req.file.buffer.toString("base64")}`;
          item.imagePublicId = undefined;
        }
      } else {
        console.warn("Cloudinary not configured. Using base64 image fallback in update.");
        item.image = `data:${req.file.mimetype || "image/jpeg"};base64,${req.file.buffer.toString("base64")}`;
        item.imagePublicId = undefined;
      }
    }

    // Update only the fields that were sent
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (itemType !== undefined) item.itemType = itemType;
    if (category !== undefined) item.category = category;
    if (location !== undefined) item.location = location;
    if (dateReported !== undefined) item.dateReported = dateReported;
    if (status !== undefined) item.status = status;

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/items/:id ─────────────────────────────────────────────────────
// Owner only. Also removes the image from Cloudinary.
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised to delete this item" });
    }

    // Delete the image from Cloudinary so we don't leave orphaned files
    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (cErr) {
        console.warn("Could not delete Cloudinary image:", cErr.message);
      }
    }

    // Delete all claims linked to this item so we don't leave orphaned records
    await Claim.deleteMany({ itemId: item._id });

    await item.deleteOne();

    res.json({ message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  itemRules,
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
};
