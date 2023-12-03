const express = require("express");
const router = express.Router();
const Products = require("../models/productSchema");
const TopCategory = require("../models/topCategoryModel");

router.get("/products", async (req, res) => {
  try {
    const products = await Products.find({});
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.get("/topCategories", async (req, res) => {
  try {
    const topCategory = await TopCategory.find();
    res.send(topCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
