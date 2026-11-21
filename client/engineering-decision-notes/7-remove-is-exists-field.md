## Context: In the beginning products were managed only in React state and the form needed to know whether it was adding a new product or updating an existing one. I used an `isExists` boolean flag for that. The flag lived in the ProductForm state, `useProductActions`, the Mongoose schema and the Zod add validator.

# Problem: The same information was stored twice. A product with an `id` already means the product exists, but `isExists` was maintained separately and had to be set correctly in many places.

```js
const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
    stockQuantity: 0,
    isExists: false
});
```

```js
async function saveProduct(product) {
    if (product.isExists) {
        const updatedProduct = await updateProductService(product);
        ...
    }
    else {
        product.isExists = true;
        const newProduct = await addProductService(product);
        ...
    }
}
```

```js
isExists: {
    type: Boolean,
    required: true,
    default: true
}
```

```js
isExists: z.boolean().default(true)
```

Issue #19: When a new product was saved, the add flow did not reliably mark it as an existing product. Opening that product for edit did not allow an update. Fixing it meant remembering to set the flag in the add path, which is another thing to maintain.

## Solution: Remove `isExists` and use `product.id` as the only source of truth.

- Removed the flag from the initial `productForm` state and from `clearProductForm()`.
- Removed it from `useProductActions`. `saveProduct()` now checks `product.id`.
- Removed it from the `Product` Mongoose schema and from `addProductValidator`.
- ProductForm uses `productForm.id` for the button label, the change check and the submit condition.

```js
async function saveProduct(product) {
    if (product.id) {
        const updatedProduct = await updateProductService(product);
        setProducts(products.map(p => {
            return (p.id != updatedProduct.id) ? p : updatedProduct;
        }));
    }
    else {
        const newProduct = await addProductService(product);
        setProducts([...products, newProduct]);
    }
}
```

```js
if (productForm.id) {
    const existingProduct = products.find(p => p.id === productForm.id);

    if (existingProduct)
        isExistingProductChanged = Object
            .keys(existingProduct)
            .some(k => existingProduct[k] !== productForm[k]);
}

const isSubmitAllowed = ... &&
    (productForm.id ? isExistingProductChanged : true);
```

```jsx
{(productForm.id) ? 'Update Product' : 'Add Product'}
```

- No flag has to be set before POST or after a successful add.
- The server also stores one less field and the add request becomes smaller.
- A fresh form has no `id` so it is new. A form filled from a product has an `id` so it is an update.

## Lesson: If required information can be derived from existing data then don't create a separate state for it. A duplicate flag becomes another source of truth and must be updated everywhere. Use the data you already have.
