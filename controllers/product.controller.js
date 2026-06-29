import Product from "../models/productSchema.js"; 

// ====================================================
// ✅ CREATE PRODUCT CONTROLLER (Database Server Stream)
// ====================================================
export const createProduct = async (req, res) => {
  try {
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Please attach an image file using field key 'product_image'." });
    }

    // Automatic increment check on your remote cluster server
    const highestIndexedProduct = await Product.findOne().sort({ card_index: -1 });
    const nextCardIndex = highestIndexedProduct ? highestIndexedProduct.card_index + 1 : 1;

    // 🎯 DATABASE SERVER DIRECT WRITING LAYER: 
    // Converts product picture bytes into a direct collection string document block!
    const base64ProductImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const newProduct = new Product({
      card_index: nextCardIndex, 
      title: title?.trim(),
      category: category?.trim(), // Must match your strict category enum options!
      product_image: base64ProductImage, // Saves image bytes straight inside your database server!
      badge: { text_label: badge_text || "NEW", background_color: badge_color || "Blue" },
      rating_stars: rating_stars ? Number(rating_stars) : 5, 
      price_label: price_label || "MRP",
      currency: currency || "₹",
      amount: amount || "0"
    });

    await newProduct.save(); // Commits document directly to Atlas Cloud
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("❌ Product database server creation error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// ====================================================
// ✅ EDIT PRODUCT CONTROLLER (Database Server Sync)
// ====================================================
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars, card_index } = req.body;

    const targetProduct = await Product.findById(id);
    if (!targetProduct) return res.status(404).json({ error: "Product item not found." });

    if (req.file) {
      const base64UpdateImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      targetProduct.product_image = base64UpdateImage;
    }

    targetProduct.card_index = card_index !== undefined ? Number(card_index) : targetProduct.card_index;
    targetProduct.title = title !== undefined ? title.trim() : targetProduct.title;
    targetProduct.category = category !== undefined ? category.trim() : targetProduct.category;
    targetProduct.rating_stars = rating_stars !== undefined ? Number(rating_stars) : targetProduct.rating_stars;
    targetProduct.price_label = price_label !== undefined ? price_label.trim() : targetProduct.price_label;
    targetProduct.currency = currency !== undefined ? currency.trim() : targetProduct.currency;
    targetProduct.amount = amount !== undefined ? amount.toString().trim() : targetProduct.amount;

    if (badge_text !== undefined || badge_color !== undefined) {
      targetProduct.badge = {
        text_label: badge_text !== undefined ? badge_text.trim() : (targetProduct.badge?.text_label || "NEW"),
        background_color: badge_color !== undefined ? badge_color.trim() : (targetProduct.badge?.background_color || "Blue")
      };
    }

    const updatedProduct = await targetProduct.save(); // Sync back to database server
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("❌ Product edit database server error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// ====================================================
// ✅ GET ALL PRODUCTS CONTROLLER
// ====================================================
export const getAllProduct = async (req, res) => {
  try {
    const { search } = req.query;
    let queryConditions = {};

    if (search) {
      queryConditions = {
        $or: [
          { title: { $regex: String(search).trim(), $options: 'i' } },
          { category: { $regex: String(search).trim(), $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(queryConditions).sort({ card_index: 1 });
    return res.status(200).json(products); 
    
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================
// ✅ DELETE PRODUCT CONTROLLER
// ====================================================
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found." });
    return res.status(200).json({ success: true, message: "Asset dropped from database server." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
