export default function validateProductForm(productForm, products) {
    const validationErrors = {
        id: '',
        name: '',
        price: '',
        category: '',
        description: '',
        stockQuantity: ''
    };

    if (!(Number(productForm.id))) {
        validationErrors.id = 'Product ID is required';
    }

    if (!productForm.isExists && products.find(p => p.id === Number(productForm.id))) {
        validationErrors.id = 'Product with given ID already exists';
    }

    if (productForm.name.length < 3) {
        validationErrors.name = 'Product name is invalid';
    }

    if (!(Number(productForm.price))) {
        validationErrors.price = 'Product price should be greater than ₹0';
    }

    if (productForm.category.length < 3) {
        validationErrors.category = 'Product category is invalid';
    }

    if (productForm.description.length < 3) {
        validationErrors.description = 'Product description is invalid';
    }

    if (!(Number(productForm.stockQuantity))) {
        validationErrors.stockQuantity = 'Product stock should be greater than 0';
    }

    return validationErrors;
}