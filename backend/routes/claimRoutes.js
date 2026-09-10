const express = require("express");
const router = express.Router();

const {
  claimRules,
  updateClaimRules,
  statusRules,
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim,
} = require("../controllers/claimController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

// All claim routes require a valid JWT
router.use(protect);

// IMPORTANT: /my must come before /:id for the same reason as in itemRoutes
router.get("/my", getMyClaims);

router.post("/", claimRules, validate, createClaim);
router.get("/:id", getClaimById);
router.put("/:id", updateClaimRules, validate, updateClaim);
router.patch("/:id/status", statusRules, validate, updateClaimStatus);
router.delete("/:id", deleteClaim);

module.exports = router;
