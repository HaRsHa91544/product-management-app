import { memo, useContext } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";
import InputField from "./ui/InputField.jsx";
import useProductActions from "../hooks/useProductActions.js";
import validateProductForm from "../utils/validateProductForm.js";

function ProductForm() {
    const { products } = useContext(ProductsContext);

    const { productForm, setProductForm } = useContext(ProductFormContext);

    const { saveProduct } = useProductActions();
    
    const validationErrors = validateProductForm(productForm, products);
    
    function clearProductForm() {
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
    
    function inputChangeHandler(e) {
        let { name, value, type } = e.target;

        if (type === 'number' && value) {
            value = Number(value);
        }

        setProductForm((prev) => {
            return { ...prev, [name]: value }
        });
    }

    function productSubmitHandler(e) {
        e.preventDefault();
        saveProduct(productForm);
        clearProductForm();
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
            errors={validationErrors.id}
        ></InputField>

        <InputField
            label={'Product Name'}
            type={'text'}
            name={'name'}
            id={'name'}
            value={productForm.name}
            changeHandler={inputChangeHandler}
            errors={validationErrors.name}
        ></InputField>

        <InputField
            label={'Product Price'}
            type={'number'}
            name={'price'}
            id={'price'}
            value={productForm.price}
            changeHandler={inputChangeHandler}
            errors={validationErrors.price}
        ></InputField>

        <InputField
            label={'Category'}
            type={'text'}
            name={'category'}
            id={'category'}
            value={productForm.category}
            changeHandler={inputChangeHandler}
            errors={validationErrors.category}
        ></InputField>

        <InputField
            label={'Description'}
            type={'text'}
            name={'description'}
            id={'description'}
            value={productForm.description}
            changeHandler={inputChangeHandler}
            errors={validationErrors.description}
        ></InputField>

        <InputField
            label={'Stock Quantity'}
            type={'number'}
            name={'stockQuantity'}
            id={'stockQuantity'}
            value={productForm.stockQuantity}
            changeHandler={inputChangeHandler}
            errors={validationErrors.stockQuantity}
        ></InputField>

        <button type="button" onClick={() => clearProductForm()}>Reset</button>

        <button
            type="submit"
            disabled={
                validationErrors.id ||
                validationErrors.name ||
                validationErrors.price ||
                validationErrors.description ||
                validationErrors.category ||
                validationErrors.stockQuantity
            }>
            {(productForm.isExists) ? 'Update Product' : 'Add Product'}
        </button>
    </form>;
}

export default memo(ProductForm);