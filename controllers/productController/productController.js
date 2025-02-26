import Product from "../../models/productModels/Product.js";
import { escapeRegExp } from '../../utils/escapeRegExp.js'; // Utility to escape regex

export const createProduct = async (req, res) => {
  try {
    const {
      type,
      name,
      SKU,
      unitType,
      productCategory,
      productSubCategory,
      purchaseInformation,
      currency,
      sellingPrice,
      costPrice,
      tax,
      hsn_Sac,
      clientCanPurchase,
      downloadable,
      trackInventoryForThisItem,
      openingStock,
      description,
      attributes,
      variations,
      region,
      isActive,
    } = req.body;

     // Remove the `id` field if passed in the request body (ensure it's not included)
    delete req.body.id;
    console.log("resrsrseridddd", req.body);
    // Parse attributes if they are sent as strings
    let parsedAttributes = {};
    let parsedVariations = [];
    let parsedImages = [];

    // Parse 'attributes' if it's a string
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes); // Parse the JSON string into an object
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid attributes JSON" });
      }
    } else {
      parsedAttributes = attributes; // Already an object
    }

    // Parse 'variations' if it's a string
    if (typeof variations === 'string') {
      try {
        parsedVariations = JSON.parse(variations); // Parse the JSON string into an array
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid variations JSON" });
      }
    } else {
      parsedVariations = variations; // Already an array
    }

    // Handle 'images' field (multipart/form-data)
    if (req.files && req.files.images) {
      // Ensure images are uploaded as an array
      parsedImages = req.files.images.map(file => file.filename); // Collect image filenames
    } else if (req.body.images) {
      // If images are sent as an array of filenames
      parsedImages = req.body.images;
    }

    // Handle 'downloadableFile' if it's provided
    const downloadableFileName = req.files?.downloadableFile
      ? req.files.downloadableFile[0]?.filename.trim()
      : "";

    // Validate required fields
    if (
      !type ||
      !name ||
      !SKU ||
      !unitType ||
      !productCategory ||
      !currency ||
      sellingPrice == null ||
      costPrice == null ||
      tax == null ||
      !hsn_Sac ||
      !region ||
      isActive == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide all required data.",
      });
    }

    // Additional validation
    if (!["physical", "digital", "service"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type. Allowed types are physical, digital, or service.",
      });
    }

    if (costPrice > sellingPrice) {
      return res.status(400).json({
        success: false,
        message: "Selling price must be greater than or equal to cost price.",
      });
    }

    if (trackInventoryForThisItem && openingStock == null) {
      return res.status(400).json({
        success: false,
        message: "Opening stock is required when inventory tracking is enabled.",
      });
    }

    // Trim and clean up strings
    const cleanName = name.trim();
    const cleanSKU = SKU.trim();
    const cleanHSN = hsn_Sac.trim();
    const cleanDescription = description ? description.trim() : "";

    // Check for duplicate product (by SKU or name)
    const existingProduct = await Product.findOne({
      $or: [{ SKU: cleanSKU }, { name: cleanName }],
    });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with the same SKU or name already exists.",
      });
    }

    // Create new product
    const product = new Product({
      type,
      name: cleanName,
      SKU: cleanSKU,
      unitType,
      productCategory,
      productSubCategory,
      purchaseInformation,
      currency,
      sellingPrice,
      costPrice,
      tax,
      hsn_Sac: cleanHSN,
      clientCanPurchase: clientCanPurchase || false,
      downloadable: downloadable || false,
      downloadableFile: downloadableFileName || "",
      trackInventoryForThisItem: trackInventoryForThisItem || false,
      openingStock,
      currentStock: openingStock || 0,
      description: cleanDescription,
      attributes: parsedAttributes, // Save as object
      variations: parsedVariations, // Save as array
      images: parsedImages, // Save as array of filenames
      region,
      isActive,
    });

    // Save the product
    const savedProduct = await product.save();

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { search, category, minPrice, maxPrice, region, startDate, endDate } = req.query;

    // Set default pagination values
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Initialize query object
    let query = {};

    // Conditional Filters
    if (category) {
      query.productCategory = { $regex: new RegExp(category, 'i') }; // Case-insensitive category filter
    }

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
    }

    if (region) {
      query.region = region;
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999); // Include the entire end date
      query.createdAt = { $gte: parsedStartDate, $lte: parsedEndDate };
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { name: searchRegex },
        { SKU: searchRegex },
        { description: searchRegex },
      ];
    }

    // Count total matching records
    const totalRecords = await Product.countDocuments(query);

    // Retrieve products with pagination
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Prepare response
    res.status(200).json({
      success: true,
      data: {
        products,
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Conditional checks for update data
    if (updateData.name && updateData.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name cannot be empty',
      });
    }

    if (updateData.sellingPrice && updateData.sellingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be greater than 0',
      });
    }

    if (updateData.costPrice && updateData.costPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost price must be greater than 0',
      });
    }

    if (updateData.sellingPrice && updateData.costPrice && updateData.sellingPrice < updateData.costPrice) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot be less than cost price',
      });
    }

    if (updateData.currentStock && updateData.currentStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current stock cannot be negative',
      });
    }

    if (updateData.openingStock && updateData.openingStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Opening stock cannot be negative',
      });
    }

    if (updateData.tax && (updateData.tax < 0 || updateData.tax > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Tax percentage must be between 0 and 100',
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating product',
      error: error.message,
    });
  }
}

export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    //find product by its id 
    const product = await Product.findById(productId);
      if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product',
      error: error.message,
    })
  }
}

export const deleteProduct = async (req, res) => { 
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
     if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting product',
      error: error.message,
    });
  }
}

 
// Archive a product
export const archiveProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from request parameters

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update the product's isArchived field to true
    product.isArchived = true;
    product.archivedAt = new Date(); // Optional: you can store the timestamp of when the product was archived

    // Save the updated product
    await product.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error archiving product',
      error: error.message,
    });
  }
};


export const getArchivedProducts = async (req, res) => {
  try {
    const archivedProducts = await Product.find({
      isArchived: true,
    });
     res.status(200).json({
            success: true,
            data: archivedProducts,
        });
  } catch (error) {
    console.error('Error fetching archived products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching archived products',
      error: error.message,
    });
  }
}

 
 

export const getAllProductsWithoutPagination = async (req, res) => {
  try {
    // Extract query parameters
    const { search, category, minPrice, maxPrice, region, startDate, endDate, isArchived } = req.query;

    // Initialize query object
    let query = {};

    // Conditional Filters
    if (category) {
      query.productCategory = { $regex: new RegExp(category, 'i') }; // Case-insensitive category filter
    }

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.sellingPrice.$lte = parseFloat(maxPrice);
    }

    if (region) {
      query.region = region;
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999); // Include the entire end date
      query.createdAt = { $gte: parsedStartDate, $lte: parsedEndDate };
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { name: searchRegex },
        { SKU: searchRegex },
        { description: searchRegex },
      ];
    }

    // Handle the 'isArchived' filter
    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true'; // Check for 'true'/'false' string and convert to boolean
    } else {
      query.isArchived = false;  // Default to non-archived products if 'isArchived' is not provided
    }

    // Log the query to inspect it
    console.log("Query:", query); 

    // Retrieve products without pagination
    const products = await Product.find(query).exec();

    // Prepare response
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

