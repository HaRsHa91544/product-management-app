## Context: ProductForm is mounted only when `formOpened` is true. `closeProductForm()` is the single function which closes the form, clears the productForm state and clears the server validation errors. It is called from the overlay click, the Close button and after a successful add or update.

# Problem: The first version used a special argument (`'action'`) to know that the close came after a save. Later I replaced it with CSS class checks on `e.target.classList`. That made the function simple, but it created Issue #18.

```js
function closeProductForm(e) {
    const elementClassList = e?.target?.classList;

    if (
        elementClassList.contains('form-overlay') ||
        elementClassList.contains('form-submit-btn') ||
        elementClassList.contains('form-close-btn')
    ) {
        setFormOpened(false);
        setServerValidationErrors({});
        clearProductForm();
    }
}
```

```js
function productSubmitHandler(e) {
    e.preventDefault();
    disableButton(e.submitter);
    saveProduct(productForm)
        .then(() => {
            closeProductForm(e.submitter);
        })
        .catch((errors) => {
            setServerValidationErrors(errors);
        });
}
```

The submit button has the `form-submit-btn` class. Its click bubbles to the form overlay, so `closeProductForm()` ran on the click itself. The form was unmounted while `saveProduct()` was still waiting for the API response. The submission was cancelled before the server could respond.

## Solution: Use the event type together with the CSS class and close the form only after the save is successful.

- A click on the overlay closes the form only when `e.type === 'click'`.
- A click on the Close button still bubbles to the overlay, but it is identified by `form-close-btn`.
- A submit event is handled separately. Its target is the `<form>` element which has the `product-form` class and `e.type === 'submit'`.
- `closeProductForm(e)` is called inside `.then()` so the form stays mounted until the server responds.

```js
function closeProductForm(e) {
    const elementClassList = e.target.classList;

    if (
        (elementClassList.contains('form-overlay') && e.type === 'click') ||
        (elementClassList.contains('product-form') && e.type === 'submit') ||
        (elementClassList.contains('form-close-btn') && e.type === 'click')
    ) {
        setFormOpened(false);
        setServerValidationErrors({});
        clearProductForm();
    }
}
```

```js
function productSubmitHandler(e) {
    e.preventDefault();
    disableButton(e.submitter);
    saveProduct(productForm)
        .then(() => {
            closeProductForm(e);
        })
        .catch((errors) => {
            setServerValidationErrors(errors);
        });
}
```

- There is still only one close function, so closing, clearing the form data and clearing the server errors happen together.
- The submit button no longer closes the form just because it was clicked.

## Lesson: Click events bubble from child to parent. When one close function handles many sources, check both the event type and the target. Do not unmount a component while async work is still using its state.
