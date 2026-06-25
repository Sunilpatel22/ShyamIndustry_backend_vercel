import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  card_index: {
    type: Number,
    required: true,
    default: 1
  },
  badge: {
    // 🎯 FIX: Renamed 'type' to 'text_label' to avoid clashing with Mongoose reserved configuration keywords
    text_label: {
      type: String,
      default: "NEW"
    },
    background_color: {
      type: String,
      default: "Blue"
    }
  },
  wishlist_icon: {
    type: String,
  },
  product_image: {
    type: String, // Stores the file upload path or image URL string
  },
  category: { 
    type: String, 
    trim: true,
   
    // 🎯 FIX: Restricts entries to your specific categories only
    enum: [
      "Tractor Trolleys", 
      "Cultivators", 
      "Agricultural Tools", 
      "Hydraulic Equipment", 
      "Dustbins"
    ]
  },
  title: {
    type: String,
    trim: true
  },
  rating_stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  price_label: {
    type: String,
  },
  currency: {
    type: String,
  },
  amount: {
    type: String, // Kept as string to preserve formatting like commas (e.g., "1,45,000.00")
  },
  action_button: {
    type: String,
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt dates to each product record
});

const Product = mongoose.model("Product", productSchema);
export default Product;
