## Context: The ProductForm component which is responsible for maintaining the productForm state and validation of input fields of product form. ProductForm component contains the logic of deciding wheather to add or update a product in the products state.

# Problem:  The logic deciding wheather to add or update a product in the products state makes the `code less readable` and `creates duplication of code` if any other component requires the same logic.

```js
function productSubmitHandler(e) {
    // Updating
    if (productForm.isExists) {
        setProducts(products.map(p => {
            return (p.id != productForm.id) ? p : productForm;
        }));
    }
    // Adding
    else {
        productForm.isExists = true;
        setProducts([...products, productForm]);
    }
}
```

## Solution: Creating an abstraction layer of adding/updating product logic inside the `useProductActions` Hook as it already contains the delete and edit product(updating the ProductForm state) logic.


```js
function saveProduct(product) {
    if (product.isExists) {
        setProducts(products.map(p => {
            return (p.id != product.id) ? p : product;
        }));
    }
    else {
        product.isExists = true;
        setProducts([...products, product]);
    }
}
```
- We can just use `saveProducts()` in any component to just add or update a product.

## Lesson: Keep the core functionalities reusable or abstract and minimum that a developer can understand it easily. 