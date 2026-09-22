import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";

function ProductForm() {
    const { products, setProducts } = useContext(ProductsContext);

    const [productForm, setProductForm] = useState({
        id: 0,
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0
    });

    const errors = {
        id: !(Number(productForm.id)) ? 'Product ID is required' : '',
        name: (productForm.name.length < 3) ? 'Product name is invalid' : '',
        price: !(Number(productForm.price)) ? 'Product price should be greater than ₹0' : '',
        category: (productForm.category.length < 3) ? 'Product category is invalid' : '',
        description: (productForm.description.length < 3) ? 'Product description is invalid' : '',
        stockQuantity: !(Number(productForm.stockQuantity)) ? 'Product stock should be greater than 0' : ''
    };

    function inputChangeHandler(e) {
        const { name, value } = e.target;
        setProductForm((prev) => {
            return { ...prev, [name]: value }
        });
    }

    function productSubmitHandler(e) {
        e.preventDefault();
        setProducts([...products, productForm]);
        setProductForm({
            id: 0,
            name: '',
            price: 0,
            category: '',
            description: '',
            stockQuantity: 0
        });
    }

    return <form onSubmit={productSubmitHandler}>
        <label htmlFor="id">Product ID</label>
        <input type="number" name="id" id="id"
            value={productForm.id} onChange={inputChangeHandler}
        />
        {errors.id && <p>{errors.id}</p>}

        <label htmlFor="name">Product Name</label>
        <input type="text" name="name" id="name"
            value={productForm.name} onChange={inputChangeHandler}
        />
        {errors.name && <p>{errors.name}</p>}

        <label htmlFor="price">Product Price</label>
        <input type="number" name="price" id="price"
            value={productForm.price} onChange={inputChangeHandler}
        />
        {errors.price && <p>{errors.price}</p>}

        <label htmlFor="category">Category</label>
        <input type="text" name="category" id="category"
            value={productForm.category} onChange={inputChangeHandler}
        />
        {errors.category && <p>{errors.category}</p>}

        <label htmlFor="description">Description</label>
        <textarea name="description" id="description"
            value={productForm.description} onChange={inputChangeHandler}
        />
        {errors.description && <p>{errors.description}</p>}

        <label htmlFor="stockQuantity">Stock Quantity</label>
        <input type="number" name="stockQuantity" id="stockQuantity"
            value={productForm.stockQuantity} onChange={inputChangeHandler}
        />
        {errors.stockQuantity && <p>{errors.stockQuantity}</p>}

        <button
            type="submit"
            disabled={
                errors.id ||
                errors.name ||
                errors.price ||
                errors.description ||
                errors.category ||
                errors.stockQuantity
            }>
            Add Product</button>
    </form>;
}

export default ProductForm;