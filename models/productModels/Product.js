import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString(), // Generates a unique ID
    },
    type: {
        type: String,
        enum: ['physical', 'digital', 'service'],
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    SKU: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    unitType: {
        type: String, // e.g., "kg", "pcs", "liters"
        required: true,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productSubCategory: {
        type: String,
    },
    purchaseInformation: {
        supplierName: { type: String },
        purchasePrice: { type: Number, min: 0 },
        purchaseDate: { type: Date },
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'JPY', 'CAD'], // Add other currencies as needed
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: Number, // Tax percentage
        required: true,
        default: 18,
    },
    hsn_Sac: {
        type: String, // HSN/SAC code for tax purposes
    },
    clientCanPurchase: {
        type: Boolean,
        default: true, // Whether clients can directly purchase this product
    },
    downloadable: {
        type: Boolean,
        default: false, // Whether this is a digital, downloadable product
    },
    trackInventoryForThisItem: {
        type: Boolean,
        default: true,
    },
    openingStock: {
        type: Number,
        default: 0,
        min: 0,
    },
    currentStock: {
        type: Number,
        default: 0,
        min: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    attributes: { type: Map, of: String }, // Use Map for attributes if you want flexible key-value pairs
  variations: [{ 
    variationName: String,
    variationValue: String,
    priceAdjustment: Number,
    stock: Number
  }], // Array of objects for variations
  images: [{ type: String }], // Array of image filenames
    region: {
        type: String, // Specify region for regional taxes (e.g., "India-MH")
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
     downloadableFile: {
        type: String, // Assuming it's a file path or URL
        required: false
    },
      isArchived: {
        type: Boolean,
        default: false, // Indicates if the product is archived
    },
    archivedAt: {
        type: Date, // Date when the product was archived
    },
});

const Product = mongoose.model('Product', productSchema);
export default Product;

// This structure is now versatile and robust, 
// supporting multiple use cases like inventory management,
//     tax compliance, regional pricing,
//         and product variation handling.








// Description of Fields
// id: Unique identifier for the product.
// type: Type of product (physical, digital, or service).
// name: Name of the product.
// SKU: Stock Keeping Unit, unique for inventory tracking.
// unitType: Measurement unit (e.g., kg, pcs, liters).
// productCategory and productSubCategory: Categorization for better organization.
// purchaseInformation: Includes supplier details, purchase price, and date.
// currency: The currency used for pricing (e.g., INR, USD).
// sellingPrice: Price at which the product is sold, calculated dynamically with tax.
// costPrice: Base cost of the product.
// tax: Tax rate applied to the product.
// hsn_Sac: Harmonized System of Nomenclature (HSN) or Service Accounting Code (SAC) for tax compliance.
// clientCanPurchase: Indicates if the product is available for clients to purchase.
// downloadable: Whether the product is a downloadable item.
// trackInventoryForThisItem: Enables inventory tracking for the product.
// openingStock and currentStock: Initial stock and current stock levels.
// description: Detailed description of the product.
// attributes: Custom attributes (e.g., color, size).
// variations: Product variations with price adjustments and stock levels.
// images: Array of image URLs and alt text for the product.
// region: Region-specific details for tax or other considerations.
// isActive: Indicates if the product is active.
