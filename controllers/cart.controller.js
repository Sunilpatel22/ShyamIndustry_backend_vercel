// controllers/cart.controller.js
import Cart from "../models/cartSchema.js";
import Product from "../models/productSchema.js";

// 🛒 1. Add item or increase quantity in cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // Derived from jwtAuthMiddleware
    const qty = Number(quantity) || 1;

    // Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Find user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Product exists, increment quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // Product doesn't exist, push new item
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    return res.status(200).json({ success: true, message: "Product added to cart", data: cart });
  } catch (error) {
    console.error("❌ Add to Cart Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// 📋 2. Fetch all cart items for logged-in user
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Populates product data automatically
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    
    if (!cart) {
      return res.status(200).json({ userId, items: [] });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Get Cart Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔄 3. Update specific item quantity directly (e.g., input field changes)
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const targetQty = Number(quantity);

    if (targetQty <= 0) {
      return res.status(400).json({ error: "Quantity must be 1 or more. Use delete to remove items." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found." });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ error: "Item not found in cart." });

    cart.items[itemIndex].quantity = targetQty;
    await cart.save();

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ❌ 4. Remove a single item from the cart array
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found." });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    return res.status(200).json({ success: true, message: "Item removed from cart.", data: cart });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
