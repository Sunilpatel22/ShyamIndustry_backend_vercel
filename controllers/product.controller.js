import Product from "../models/productSchema.js"; 
import fs from 'fs';
import path from 'path';

export const createProduct = async (req, res) => {
  try {
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Please attach an image file using field key 'product_image'." });
    }

    // 🎯 AUTOMATIC INCREMENT LOGIC (+1)
    // Queries MongoDB for the single highest active card_index value currently recorded
    const highestIndexedProduct = await Product.findOne().sort({ card_index: -1 });
    const nextCardIndex = highestIndexedProduct ? highestIndexedProduct.card_index + 1 : 1;

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newProduct = new Product({
      card_index: nextCardIndex, // 🎯 Automatically assigned incremented number
      title: title?.trim(),
      category: category?.trim(),
      product_image: imageUrl,
      badge: { text_label: badge_text || "NEW", background_color: badge_color || "Blue" },
      rating_stars: rating_stars ? Number(rating_stars) : 5, 
      price_label: price_label || "MRP",
      currency: currency || "₹",
      amount: amount || "0"
    });

    await newProduct.save();
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    // Log the actual message to the terminal console to ensure debugging clarity
    console.error("❌ Mongoose Auto-Increment Creation Crash:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    // 🎯 1. Intercept query parameters (e.g., /product/getAllProduct?search=trolley)
    const { search } = req.query;
    
    let queryConditions = {};

    // 🎯 2. CASE-INSENSITIVE MONGO SEARCH ENGINE:
    // If a query parameter exists, build a dynamic database query block condition
    if (search) {
      queryConditions = {
        $or: [
          { title: { $regex: String(search).trim(), $options: 'i' } },
          { category: { $regex: String(search).trim(), $options: 'i' } }
        ]
      };
    }

    // 🎯 3. Query records matching conditions while preserving your card_index sorting order
    const products = await Product.find(queryConditions).sort({ card_index: 1 });
    
    // 🎯 4. Maintained your exact functional return template array block format path layout
    return res.status(200).json(products); 
    
  } catch (error) {
    // Standard server trace visibility diagnostic logs
    console.error("❌ Database search query exception encountered inside getAllProduct:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 🎯 FIX: Added card_index explicitly into the request body destructuring array variables map
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars, card_index } = req.body;

    const targetProduct = await Product.findById(id);
    if (!targetProduct) return res.status(404).json({ error: "Target model item not found." });

    let imageUrl = targetProduct.product_image;

    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      if (targetProduct.product_image) {
        try {
          const oldFileName = path.basename(targetProduct.product_image);
          const oldFilePath = path.join(process.cwd(), 'uploads', oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error("Old asset cleaning warning:", err.message);
        }
      }
    }

    // 🎯 NOW WORKS: card_index evaluates cleanly without breaking compilation limits
    targetProduct.card_index = card_index !== undefined ? Number(card_index) : targetProduct.card_index;
    targetProduct.title = title !== undefined ? title.trim() : targetProduct.title;
    targetProduct.category = category !== undefined ? category.trim() : targetProduct.category;
    targetProduct.product_image = imageUrl;
    targetProduct.rating_stars = rating_stars !== undefined ? Number(rating_stars) : targetProduct.rating_stars;
    targetProduct.price_label = price_label !== undefined ? price_label.trim() : targetProduct.price_label;
    targetProduct.currency = currency !== undefined ? currency.trim() : targetProduct.currency;
    targetProduct.amount = amount !== undefined ? amount.toString().trim() : targetProduct.amount;

    targetProduct.badge = {
      text_label: badge_text !== undefined ? badge_text.trim() : (targetProduct.badge?.text_label || "Normal"),
      background_color: badge_color !== undefined ? badge_color.trim() : (targetProduct.badge?.background_color || "Blue")
    };

    const updatedProduct = await targetProduct.save();
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    // 🎯 SYSTEM VISIBILITY FIX: Always print the error to your Node terminal console so you can trace typos instantly
    console.error("❌ Fatal Error inside editProduct controller runtime:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const targetProduct = await Product.findById(id);
    if (!targetProduct) return res.status(404).json({ error: "Target row document item not found." });

    if (targetProduct.product_image) {
      const fileName = path.basename(targetProduct.product_image);
      const filePath = path.join(process.cwd(), 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Asset successfully dropped from cloud databases." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
