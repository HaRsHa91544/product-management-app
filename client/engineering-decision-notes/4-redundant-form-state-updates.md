## Context: Add Product and Update Product actions in useProductActions Hook use the `setFormOpened(false)` statement to unmount the ProductForm.

# Problem: Add Product and Update Product actions are unnecessarily calling the `setFormOpened(false)` because this statement is already present in function called `closeProductForm()` in ProductForm component which invokes Product actions.

```js
function clearProductForm() {
    setProductForm({
        name: '',
        price: 0,
        category: '',
        description: '',
        stockQuantity: 0,
        isExists: false
    });
}

function productSubmitHandler(e) {
    e.preventDefault();
    saveProduct(productForm).then(clearProductForm);
}
```

```js
function closeProductForm(e) {
    const elementClassList = e.target.classList;

    if (elementClassList.contains('form-overlay') ||
        elementClassList.contains('action-negative-btn')) {
        setFormOpened(false); // This statement already exists here
        clearProductForm();
        setProductSubmitError('');
    }
}
```

## Solution:
- I updated the closeProductForm() to execute when there is an arg called `action` not only for `form-overlay` and `form close button`.
```js
   if (
        e === 'action' ||
        elementClassList.contains('form-overlay') ||
        elementClassList.contains('action-negative-btn')
    ) 
    {
        setFormOpened(false);
        clearProductForm();
        setProductSubmitError('');
    }
```
- I removed the setFormOpened statements in both actions in productActions.