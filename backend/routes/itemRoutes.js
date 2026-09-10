const express = require("express");
const router = express.Router();

const {
  itemRules,
  createItem,
  getItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { getClaimsForItem } = require("../controllers/claimController");
const { protect } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { validate } = require("../middleware/validate");

// All item routes require a valid JWT
router.use(protect);

// IMPORTANT: /my must be defined BEFORE /:id, otherwise Express matches
// the literal string "my" as an id parameter and calls getItemById instead.
router.get("/my", getMyItems);

router.get("/", getItems);
router.post("/", uploadSingle, itemRules, validate, createItem);

router.get("/:id", getItemById);
router.put("/:id", uploadSingle, itemRules, validate, updateItem);
router.delete("/:id", deleteItem);

// Nested route: item owner views all claims on one of their items (Phase 4)
router.get("/:itemId/claims", getClaimsForItem);

module.exports = router;
