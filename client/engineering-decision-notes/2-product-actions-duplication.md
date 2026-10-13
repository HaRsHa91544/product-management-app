## **Context:** ProductCard and ProductDetails component contains the State, UI and Logic related to edit and delete functionality of a product.

# **Problem:** The same state, UI and logic of the edit and delete functionality is duplicated in the both components which are ProductDetails and ProductCard.

## **Current Architecture:**
- ### `ProductCard` -> useProductActions(), isDeleteBtnClicked and UI.
- ### `ProductDetails` -> useProductActions(), isDeleteBtnClicked and UI.

## **Solution:**
- ### `ProductActions` -> (contains) useProductActions(), isDeleteBtnClicked and UI.
- ### `ProductActions` -> `ProductCard`, `ProductActions` -> `ProductDetails`. So, `ProductActions` component can be imported in `ProductCard` and `ProductDetails` which provides reusability of code.
- ### Reduces the responsibility of ProductDetails and ProductCard components by shifting it into the ProductActions component.

## **Lesson:** When a same type of state, UI and logic is repeated in any components then we can make it as a component if responsibility of them is related.