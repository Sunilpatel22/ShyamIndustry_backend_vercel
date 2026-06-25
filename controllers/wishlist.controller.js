import Wishlist from "../models/wishlistSchema.js";
import Product from "../models/productSchema.js";

// ❤️ 1. Toggle item in wishlist (Add if missing, remove if present)
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Target product record missing." });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    const itemIndex = wishlist.products.indexOf(productId);
    let message = "";
    let isWishlisted = false;

    if (itemIndex > -1) {
      // Product exists, remove it
      wishlist.products.splice(itemIndex, 1);
      message = "Removed from wishlist.";
    } else {
      // Product missing, push it
      wishlist.products.push(productId);
      message = "Added to wishlist!";
      isWishlisted = true;
    }

    await wishlist.save();
    return res.status(200).json({ success: true, message, isWishlisted, products: wishlist.products });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// 📋 2. Fetch full user wishlist layout
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    
    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }
    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
