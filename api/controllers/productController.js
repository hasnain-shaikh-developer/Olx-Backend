// backend/controllers/productController.js
import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";

// Add new product
export const addProduct = async (req, res) => {
  try {
    console.log("Incoming form data:", req.body);

    const { title, price, description, category } = req.body;

    // Ensure files exist (req.files provided by multer.memoryStorage())
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = [];
    for (const file of req.files) {
      // convert buffer to base64 data URI
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "olx_products",
      });

      imageUrls.push(uploadResponse.secure_url);
    }

    // Normalize category name (lowercase + trimmed)
    const normalizedCategory = category ? category.trim().toLowerCase() : "";

    const product = new Product({
      userId: req.user ? req.user._id : null,
      title: title?.trim(),
      price,
      description: description?.trim(),
      category: normalizedCategory,
      images: imageUrls,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all products (for home)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Get All Products Error:", error); // add this line
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};


// Get products for logged-in user
export const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category } = req.body;

    // upload new images (if any)
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: "olx_products",
        });
        newImageUrls.push(uploadResponse.secure_url);
      }
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Normalize updated category
    const normalizedCategory = category ? category.trim().toLowerCase() : product.category;

    product.title = title?.trim() || product.title;
    product.price = price || product.price;
    product.description = description?.trim() || product.description;
    product.category = normalizedCategory;
    if (newImageUrls.length > 0) product.images = newImageUrls;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
