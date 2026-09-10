const { validationResult } = require("express-validator");

// Runs after express-validator checks; stops the request if any field failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const fields = {};
    errorList.forEach((e) => {
      const fieldName = e.path || e.param;
      if (fieldName && !fields[fieldName]) {
        fields[fieldName] = e.msg;
      }
    });

    return res.status(400).json({
      success: false,
      message: errorList[0]?.msg || "Validation failed",
      errors: errorList,
      fields,
    });
  }
  next();
};

module.exports = { validate };
