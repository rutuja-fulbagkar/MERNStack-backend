// Middleware to calculate final selling price before saving
productSchema.pre('save', function (next) {
    const taxAmount = (this.costPrice * this.tax) / 100;
    this.sellingPrice = this.costPrice + taxAmount;
    next();
});

module.exports = mongoose.model('Product', productSchema);
