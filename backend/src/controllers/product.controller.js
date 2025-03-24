const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Vendor = require('../models/vendor.model');
const { Op } = require('sequelize');

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      vendor, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'newest' 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter conditions
    let whereConditions = { is_active: true };
    
    if (category) {
      whereConditions.category_id = category;
    }
    
    if (vendor) {
      whereConditions.vendor_id = vendor;
    }
    
    if (minPrice && maxPrice) {
      whereConditions.price = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
      };
    } else if (minPrice) {
      whereConditions.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice) {
      whereConditions.price = { [Op.lte]: parseFloat(maxPrice) };
    }
    
    if (search) {
      whereConditions.name = { [Op.iLike]: `%${search}%` };
    }
    
    // Determine sort order
    let order;
    switch (sort) {
      case 'newest':
        order = [['created_at', 'DESC']];
        break;
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'rating':
        order = [['average_rating', 'DESC']];
        break;
      default:
        order = [['created_at', 'DESC']];
    }
    
    // Query products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Vendor, attributes: ['id', 'business_name', 'vendor_rating'] }
      ]
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    
    res.status(200).json({
      products,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Failed to get products', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Vendor, attributes: ['id', 'business_name', 'vendor_rating'] }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({ message: 'Failed to get product', error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      vendorId,
      name,
      description,
      price,
      currency,
      inventoryCount,
      categoryId,
      imageUrls,
      specifications,
      isFeatured,
      weight,
      dimensions,
      sku
    } = req.body;
    
    // Check if vendor exists
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Create new product
    const newProduct = await Product.create({
      vendor_id: vendorId,
      name,
      description,
      price,
      currency: currency || 'USDT',
      inventory_count: inventoryCount,
      category_id: categoryId,
      image_urls: imageUrls,
      specifications,
      is_featured: isFeatured || false,
      is_active: true,
      weight,
      dimensions,
      sku,
      average_rating: 0
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      currency,
      inventoryCount,
      categoryId,
      imageUrls,
      specifications,
      isFeatured,
      isActive,
      weight,
      dimensions,
      sku
    } = req.body;
    
    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the vendor of this product (to be implemented with auth middleware)
    
    // Update product
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      currency: currency || product.currency,
      inventory_count: inventoryCount !== undefined ? inventoryCount : product.inventory_count,
      category_id: categoryId || product.category_id,
      image_urls: imageUrls || product.image_urls,
      specifications: specifications || product.specifications,
      is_featured: isFeatured !== undefined ? isFeatured : product.is_featured,
      is_active: isActive !== undefined ? isActive : product.is_active,
      weight: weight || product.weight,
      dimensions: dimensions || product.dimensions,
      sku: sku || product.sku
    });
    
    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the vendor of this product (to be implemented with auth middleware)
    
    // Delete product (soft delete by setting is_active to false)
    await product.update({ is_active: false });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const featuredProducts = await Product.findAll({
      where: { is_featured: true, is_active: true },
      limit: parseInt(limit),
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Vendor, attributes: ['id', 'business_name', 'vendor_rating'] }
      ],
      order: [['average_rating', 'DESC']]
    });
    
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({ message: 'Failed to get featured products', error: error.message });
  }
};
