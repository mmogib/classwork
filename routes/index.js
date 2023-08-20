var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express 2" });
});

/* GET home page. */
router.post("/clicked", function (req, res, next) {
  res.send("<h3>HiM</h3>");
});

module.exports = router;
