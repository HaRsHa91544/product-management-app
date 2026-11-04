export default function validateProductForm(productForm) {
    const validationErrors = {
        name: '',
        price: '',
        category: '',
        description: '',
        stockQuantity: ''
    };

    if (productForm.name.length < 3) {
        validationErrors.name = 'Product name is invalid';
    }

    if (!(Number(productForm.price)) || (Number(productForm.price)) <= 0) {
        validationErrors.price = 'Product price should be greater than ₹0';
    }

    if (productForm.category.length < 3) {
        validationErrors.category = 'Product category is invalid';
    }

    if (productForm.description.length < 3) {
        validationErrors.description = 'Product description is invalid';
    }

    if (!(Number(productForm.stockQuantity)) || (Number(productForm.stockQuantity)) <= 0) {
        validationErrors.stockQuantity = 'Product stock should be greater than 0';
    }

    return validationErrors;
}