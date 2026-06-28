import Product from "../models/productSchema.js"; 
import crypto from "crypto";

// 🎯 INTERNAL HELPER: Converts memory buffers into a shortened hostname string URL
const generateShortImageUrl = (req) => {
  if (!req.file) return "";

  // 1. Generate a small 8-character unique fingerprint filename
  const shortId = crypto.randomBytes(4).toString("hex"); 
  const fileExtension = req.file.mimetype.split("/")[1] || "jpg";
  const filename = `img_${shortId}.${fileExtension}`;

  // 2. AUTOMATIC HOSTNAME DETECTOR:
  // Local Dev -> http://localhost:5000/uploads/img_a1b2c3.jpg
  // Vercel Live -> https://vercel.app
  const absoluteHostUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

  return absoluteHostUrl;
};

// ====================================================
// ✅ CREATE PRODUCT CONTROLLER (Short Form URL Engine)
// ====================================================
export const createProduct = async (req, res) => {
  try {
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Please attach an image file using field key 'product_image'." });
    }

    // 🎯 AUTOMATIC INCREMENT LOGIC (+1)
    const highestIndexedProduct = await Product.findOne().sort({ card_index: -1 });
    const nextCardIndex = highestIndexedProduct ? highestIndexedProduct.card_index + 1 : 1;

    // 🎯 CALL SHORT GENERATOR HOOK: Builds a lightweight path link
    const shortFormImageUrl = generateShortImageUrl(req);

    const newProduct = new Product({
      card_index: nextCardIndex, 
      title: title?.trim(),
      category: category?.trim(), // 💡 Must match your schema's strict category enum options!
      product_image: shortFormImageUrl, // 🎯 Stores the optimized short string inside Atlas
      badge: { text_label: badge_text || "NEW", background_color: badge_color || "Blue" },
      rating_stars: rating_stars ? Number(rating_stars) : 5, 
      price_label: price_label || "MRP",
      currency: currency || "₹",
      amount: amount || "0"
    });

    await newProduct.save();
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("❌ Mongoose Auto-Increment Creation Crash:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// ====================================================
// ✅ GET ALL PRODUCTS CONTROLLER (Case-Insensitive Search Engine)
// ====================================================
export const getAllProduct = async (req, res) => {
  try {
    const { search } = req.query;
    let queryConditions = {};

    // CASE-INSENSITIVE SEARCH EXTENSION
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
    console.error("❌ Database search query exception inside getAllProduct:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ====================================================
// ✅ EDIT PRODUCT CONTROLLER (Short Path Update Layer)
// ====================================================
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, currency, price_label, badge_text, badge_color, rating_stars, card_index } = req.body;

    const targetProduct = await Product.findById(id);
    if (!targetProduct) return res.status(404).json({ error: "Target model item not found." });

    // 🎯 FIXED FOR SHORT CODES: If a new image file is uploaded, generate a fresh small URL link string
    if (req.file) {
      const shortFormUpdateUrl = generateShortImageUrl(req);
      targetProduct.product_image = shortFormUpdateUrl;
      console.log("🔄 Product image string updated successfully in memory.");
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

    const updatedProduct = await targetProduct.save();
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("❌ Fatal Error inside editProduct controller runtime:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// ====================================================
// ✅ DELETE PRODUCT CONTROLLER (Serverless Safe Drop)
// ====================================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dropped native file system path unlinking loops to protect serverless architecture containers
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) return res.status(404).json({ error: "Target row document item not found." });

    return res.status(200).json({ success: true, message: "Asset successfully dropped from cloud databases." });
  } catch (error) {
    console.error("❌ Delete product crash:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
