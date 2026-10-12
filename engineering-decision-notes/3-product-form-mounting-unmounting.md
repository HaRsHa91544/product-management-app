## **Context:** ProductForm in the app is mounted only when user wants to add or edit the product. Therefore, I used a state to render the ProductForm conditionally.

# **Problem:** 
- Adding the product initialization happens in Header component. 
- Editing the product initialization happens in ProductActions component. 
- The actual state lives in App component. 
- For Header we can pass the **state through props** but for ProductActions which lives in the **ProductCard which raises props drilling**.

```jsx
<Header setFormOpened={setFormOpened}></Header>
{
    formOpened && <ProductForm></ProductForm>
}
<ProductsView></ProductsView>
// ProductsView -> ProductsList -> ProductCard -> ProductActions
```

## **Solution:** We can create context and we can access the state from anywhere in the DOM tree without raising the problem of props drilling by bypassing the intermediate components.

```js
const { setFormOpened } = useContext(ProductFormOpenContext);
```

## **Lesson:** When the state or data is passed through many intermediate components which doesn't need it but a lowest level component of tree requires then we should use context to avoid props drilling. 