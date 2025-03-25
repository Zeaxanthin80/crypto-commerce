const Category = require('../models/category.model');
const Product = require('../models/product.model');
const { Op } = require('sequelize');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const { includeProducts, parentId } = req.query;
        
        const whereConditions = {};
        if (parentId) {
            whereConditions.parent_id = parentId === 'null' ? null : parentId;
        }

        const categories = await Category.findAll({
            where: whereConditions,
            include: [
                { 
                    model: Category, 
                    as: 'subcategories',
                    include: [{ model: Category, as: 'subcategories' }]
                },
                ...(includeProducts ? [{
                    model: Product,
                    attributes: ['id', 'name', 'image_urls']
                }] : [])
            ],
            order: [
                ['name', 'ASC'],
                ['subcategories', 'name', 'ASC']
            ]
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { includeProducts } = req.query;

        const category = await Category.findByPk(id, {
            include: [
                { 
                    model: Category, 
                    as: 'parent',
                    attributes: ['id', 'name']
                },
                { 
                    model: Category, 
                    as: 'subcategories',
                    include: [{ model: Category, as: 'subcategories' }]
                },
                ...(includeProducts ? [{
                    model: Product,
                    attributes: ['id', 'name', 'price', 'image_urls']
                }] : [])
            ]
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            parent_id = null, 
            image_url,
            is_active = true 
        } = req.body;

        // Validate parent category if provided
        if (parent_id) {
            const parentCategory = await Category.findByPk(parent_id);
            if (!parentCategory) {
                return res.status(404).json({ message: 'Parent category not found' });
            }
        }

        const category = await Category.create({
            name,
            description,
            parent_id,
            image_url,
            is_active
        });

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            description, 
            parent_id, 
            image_url,
            is_active 
        } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Validate parent category if changing
        if (parent_id !== undefined && parent_id !== null && parent_id !== category.parent_id) {
            // Prevent setting parent to self
            if (parseInt(id) === parseInt(parent_id)) {
                return res.status(400).json({ message: 'Category cannot be its own parent' });
            }

            const parentCategory = await Category.findByPk(parent_id);
            if (!parentCategory) {
                return res.status(404).json({ message: 'Parent category not found' });
            }

            // Prevent circular reference
            let currentParent = parentCategory;
            while (currentParent) {
                if (currentParent.id === category.id) {
                    return res.status(400).json({ 
                        message: 'Cannot set parent: would create circular reference' 
                    });
                }
                currentParent = await Category.findByPk(currentParent.parent_id);
            }
        }

        await category.update({
            name: name || category.name,
            description: description || category.description,
            parent_id: parent_id === undefined ? category.parent_id : parent_id,
            image_url: image_url || category.image_url,
            is_active: is_active === undefined ? category.is_active : is_active
        });

        res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { moveProductsTo, moveSubcategoriesTo } = req.query;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Handle products in this category
        if (moveProductsTo) {
            const targetCategory = await Category.findByPk(moveProductsTo);
            if (!targetCategory) {
                return res.status(404).json({ message: 'Target category for products not found' });
            }

            await Product.update(
                { category_id: moveProductsTo },
                { where: { category_id: id } }
            );
        }

        // Handle subcategories
        if (moveSubcategoriesTo) {
            const targetCategory = await Category.findByPk(moveSubcategoriesTo);
            if (!targetCategory) {
                return res.status(404).json({ message: 'Target category for subcategories not found' });
            }

            await Category.update(
                { parent_id: moveSubcategoriesTo },
                { where: { parent_id: id } }
            );
        } else {
            // If no target category specified, set subcategories' parent to null
            await Category.update(
                { parent_id: null },
                { where: { parent_id: id } }
            );
        }

        await category.destroy();

        res.status(200).json({ 
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};