import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";
import InputField from "./ui/InputField.jsx";

function ProductForm() {
    const { products, setProducts } = useContext(ProductsContext);

    const { productForm, setProductForm } = useContext(ProductFormContext);

    const errors = {
        id: !(Number(productForm.id)) ? 'Product ID is required' :
            (!productForm.isExists && products.find(p => p.id == Number(productForm.id))) ? 'Product with given ID already exists' : '',
        name: (productForm.name.length < 3) ? 'Product name is invalid' : '',
        price: !(Number(productForm.price)) ? 'Product price should be greater than ₹0' : '',
        category: (productForm.category.length < 3) ? 'Product category is invalid' : '',
        description: (productForm.description.length < 3) ? 'Product description is invalid' : '',
        stockQuantity: !(Number(productForm.stockQuantity)) ? 'Product stock should be greater than 0' : ''
    };

    function inputChangeHandler(e) {
        let { name, value, type } = e.target;
        if (type == 'number' && value) value = Number(value);
        setProductForm((prev) => {
            return { ...prev, [name]: value }
        });
    }

    function productSubmitHandler(e) {
        e.preventDefault();

        if (productForm.isExists) {
            const index = products.findIndex((p) => p.id == productForm.id);
            products.splice(index, 1, productForm);
            setProducts([...products]);
        }
        else {
            productForm.isExists = true;
            setProducts([...products, productForm]);
        }

        setProductForm({
            id: 0,
            name: '',
            price: 0,
            category: '',
            description: '',
            stockQuantity: 0,
            isExists: false
        });
    }

    return <form onSubmit={productSubmitHandler}>

        <InputField
            label={'Product ID'}
            type={'number'}
            name={'id'}
            id={'id'}
            value={productForm.id}
            changeHandler={inputChangeHandler}
            readOnly={productForm.isExists}
            errors={errors.id}
        ></InputField>

        <InputField
            label={'Product Name'}
            type={'text'}
            name={'name'}
            id={'name'}
            value={productForm.name}
            changeHandler={inputChangeHandler}
            errors={errors.name}
        ></InputField>

        <InputField
            label={'Product Price'}
            type={'number'}
            name={'price'}
            id={'price'}
            value={productForm.price}
            changeHandler={inputChangeHandler}
            errors={errors.price}
        ></InputField>

        <InputField
            label={'Category'}
            type={'text'}
            name={'category'}
            id={'category'}
            value={productForm.category}
            changeHandler={inputChangeHandler}
            errors={errors.category}
        ></InputField>

        <InputField
            label={'Description'}
            type={'text'}
            name={'description'}
            id={'description'}
            value={productForm.description}
            changeHandler={inputChangeHandler}
            errors={errors.description}
        ></InputField>

        <InputField
            label={'Stock Quantity'}
            type={'number'}
            name={'stockQuantity'}
            id={'stockQuantity'}
            value={productForm.stockQuantity}
            changeHandler={inputChangeHandler}
            errors={errors.stockQuantity}
        ></InputField>

        <button
            type="submit"
            disabled={
                errors.id ||
                errors.name ||
                errors.price ||
                errors.description ||
                errors.category ||
                errors.stockQuantity
            }
        >{(productForm.isExists) ? 'Update Product' : 'Add Product'}
        </button>
    </form>;
}

export default ProductForm;