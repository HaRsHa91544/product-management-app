# Product Management App — Full Project Context

> Purpose of this file: a complete, self-contained description of this codebase so that it can be
> pasted into any AI assistant as grounding context. It is descriptive only — it documents what the
> code *is* and *does*, file by file and logic block by logic block.

---

## 1. What this project is

A single-page **Product Management** application built as a personal React learning exercise.

- The feature requirements were drafted by ChatGPT; the entire implementation was written by hand
  by the author while learning React core fundamentals (no AI assistance in the code).
- It is a **pure client-side, in-memory CRUD app**. There is no backend, no API, no database, and
  no persistence. A page refresh resets everything back to the 3 seed products.
- The learning focus is React core: component composition, `useState`, `useContext`, prop drilling,
  controlled inputs, derived state, list rendering with keys, and multi-step (confirm-then-act)
  interactions.

### Feature set currently implemented

| # | Feature | Where it lives |
|---|---------|----------------|
| 1 | Add a product through a validated form | `src/components/ProductForm.jsx` |
| 2 | Edit an existing product (same form, loaded with product data) | `ProductForm.jsx` + `ProductCard.jsx` |
| 3 | Delete a product with an inline two-step confirmation | `src/components/ProductCard.jsx` |
| 4 | Search products by name (case-insensitive) | `src/components/SearchBar.jsx` + `ProductList.jsx` |
| 5 | Filter products by category (dropdown) | `src/components/ProductList.jsx` |
| 6 | Clear the active category filter | `src/components/ProductList.jsx` |
| 7 | View a single product's full details in a dedicated view | `ProductList.jsx` + `ProductCard.jsx` |
| 8 | Prevent adding a product whose ID already exists | `ProductForm.jsx` (validation) |
| 9 | Reusable, labelled input with inline error message | `src/components/ui/InputField.jsx` |

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| UI library | React `^19.2.8` + `react-dom` `^19.2.8` |
| Build tool | Vite `^8.3.0` |
| JSX transform | `@vitejs/plugin-react` `^6.1.1` (automatic runtime) |
| Linting | ESLint `^10.10.0` (flat config) + `eslint-plugin-react-hooks` `^7.1.1` + `eslint-plugin-react-refresh` `^0.5.6` |
| Language | Plain JavaScript (JSX). **No TypeScript.** |
| Styling | **None.** `src/index.css` and `src/app/App.css` both exist but are 0 bytes / empty. |
| Language of UI copy | English, prices prefixed with the rupee sign `₹` |

### npm scripts (`package.json`)

```json
"dev": "vite", "build": "vite build", "lint": "eslint .", "preview": "vite preview"
```

### Explicitly absent

No TypeScript, no router, no state library (Redux/Zustand/Recoil), no `useReducer`, no custom
hooks, no `useEffect` for data concerns, no `localStorage`/session storage, no CSS or CSS
framework, no PropTypes, no test files, no test runner, no CI config, no `.env` files, no
`fetch`/API layer, no `README` content, no `AGENTS.md`/contributing guide.

---

## 3. Folder structure

```
product-management-app/
├── .gitignore                       # standard Vite/Node/editor ignore rules
├── README.md                        # exists but is completely empty
├── PROJECT_CONTEXT.md               # this file
├── eslint.config.js                 # ESLint flat config
├── index.html                       # Vite HTML entry, contains <div id="root">
├── package.json
├── package-lock.json
├── vite.config.js                   # react() plugin only, no path aliases, no proxy
├── public/
│   ├── day-1.png                    # progress screenshots committed alongside features
│   ├── day-2.png
│   ├── day-3.png
│   ├── day-4.png
│   ├── day-5.png
│   └── day-6.png
└── src/
    ├── main.jsx                     # React entry: createRoot(...).render(<App />)
    ├── index.css                    # EMPTY (0 bytes) - global styles placeholder
    ├── app/
    │   ├── App.jsx                  # top-level component; owns all shared state + providers
    │   └── App.css                  # EMPTY (0 bytes)
    ├── context/
    │   ├── ProductsContext.js       # createContext([])     - products + setProducts
    │   └── ProductFormContext.js    # createContext({})     - productForm + setProductForm
    └── components/
        ├── ProductForm.jsx          # add / update form with validation
        ├── ProductList.jsx          # search + filter + list/details orchestration
        ├── ProductCard.jsx          # renders a product; also acts as the details view
        ├── SearchBar.jsx            # thin search-input wrapper
        └── ui/
            └── InputField.jsx       # generic labelled input with error slot
```

Note the flat, feature-grouped-but-not-routed layout: everything lives under `components/`, and
`ui/` is the only nested folder, holding the single reusable primitive.

---

## 4. Data model

Every product object in the app has exactly this shape:

```js
{
    id: Number,             // user-supplied, treated as the unique business key
    name: String,
    price: Number,          // rupees
    category: String,       // free text; the filter dropdown is built from distinct values
    description: String,
    stockQuantity: Number,
    isExists: Boolean       // internal flag: true = this record is already in the products list
}
```

`isExists` is not a domain field — it is form state that records whether the current
`productForm` corresponds to an already-persisted product. It drives three behaviours: the ID input
becomes read-only, the submit button label changes, and submit takes the update path instead of
the add path.

### Seed data (initial value of the `products` state in `App.jsx`)

| id | name | price | category | description | stockQuantity | isExists |
|----|------|-------|----------|-------------|---------------|----------|
| 101 | Wireless Mouse | 799 | Electronics | Ergonomic wireless mouse with adjustable DPI. | 25 | true |
| 102 | Mechanical Keyboard | 2499 | Electronics | RGB mechanical keyboard with blue switches. | 12 | true |
| 103 | Notebook | 120 | Stationery | 200-page ruled notebook for everyday writing. | 80 | true |

The blank form template (identical literals used in `App.jsx` as initial state and in
`ProductForm.jsx` to reset after submit):

```js
{ id: 0, name: '', price: 0, category: '', description: '', stockQuantity: 0, isExists: false }
```

---

## 5. State ownership map

| State | Declared in | Hook | Scope | Consumed by |
|---|---|---|---|---|
| `products` | `App.jsx:8` | `useState(seed array)` | app-wide, via `ProductsContext` | `ProductForm`, `ProductCard`, `ProductList` |
| `productForm` | `App.jsx:38` | `useState(blank template)` | app-wide, via `ProductFormContext` | `ProductForm` (reads+writes), `ProductCard` (writes only) |
| `searchValue` | `ProductList.jsx:9` | `useState('')` | local to the list | `SearchBar`, filtering logic |
| `filterByCategory` | `ProductList.jsx:10` | `useState('')` | local to the list | category `<select>`, filter logic |
| `selectedProductId` | `ProductList.jsx:12` | `useState(0)` | local to the list | drives list-vs-details mode; passed down as a prop |
| `isDeleteBtnClicked` | `ProductCard.jsx:17` | `useState(false)` | local to each card | delete confirmation UI |

`0` is the sentinel for "no product selected", so the details view is chosen by truthiness of
`selectedProductId`.

---

## 6. File-by-file walkthrough

### 6.1 `index.html`

Standard Vite shell. `<html lang="en">`, charset and viewport meta, `<title>Product Management
App</title>`, a single `<div id="root"></div>`, and one module script pointing at
`/src/main.jsx`. No fonts, no CDN links, no inline script.

### 6.2 `vite.config.js`

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({ plugins: [react()] })
```

Nothing else configured — no `@` alias, no dev-server proxy, no build tweaks.

### 6.3 `eslint.config.js`

Flat config array: `globalIgnores(['dist'])`, then one block applying to `**/*.{js,jsx}` that
extends `js.configs.recommended`, `reactHooks.configs.flat.recommended`, and
`reactRefresh.configs.vite`, with browser globals and JSX parser features enabled. Note the
React-Refresh rule shape this implies: each module's default export is expected to be a component.

### 6.4 `src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
createRoot(document.getElementById('root')).render(<App />)
```

The imported `index.css` is empty, so this import is currently a no-op placeholder. Uses the
`createRoot` API (React 18+ root API), not `ReactDOM.render`. No `StrictMode` wrapper.

### 6.5 `src/app/App.jsx` — the state hub

Imports: `useState`, `ProductsContext`, `ProductFormContext`, `ProductsList`, `ProductForm`.

Declares the two app-wide hooks described in the state map, then returns:

```jsx
<ProductsContext value={{ products, setProducts }}>
    <ProductFormContext value={{ productForm, setProductForm }}>
        <ProductForm></ProductForm>
        <ProductsList></ProductsList>
    </ProductFormContext>
</ProductsContext>
```

Three things worth noting as *facts about this code*:

1. Providers are written as **JSX tags with a `value` prop** rather than
   `<ProductsContext.Provider>`. This is the React 19 context-as-provider shorthand.
2. Each context receives a **freshly constructed object literal** on every render of `App`.
3. `App` renders `ProductForm` (the form) first, then `ProductsList` (which contains the
   search/filter UI and the product cards). The form is deliberately global — it is the mechanism
   by which `ProductCard` triggers an edit.

There is no `useMemo` around the context values, no `useCallback` on the setters, and no
`useEffect`.

### 6.6 `src/context/ProductsContext.js`

```js
import { createContext } from "react";
export const ProductsContext = createContext([]);
```

Three lines. Default value is an empty array. There is **no** `ProductsContextProvider` wrapper
component — the provider is the context itself, used as a JSX tag in `App.jsx`.

### 6.7 `src/context/ProductFormContext.js`

```js
import { createContext } from "react";
export const ProductFormContext = createContext({});
```

Same pattern; default value is an empty object.

### 6.8 `src/components/ProductForm.jsx` — add & update

**Contexts consumed:** `const { products, setProducts } = useContext(ProductsContext)` and
`const { productForm, setProductForm } = useContext(ProductFormContext)`. So the form both reads
the product list (for duplicate-ID checking and for update-by-index) and reads/writes the draft.

**`errors` (lines 11–19)** — an object literal built inline during render, one key per field, each
value either a message string or `''`:

| Field | Rule |
|---|---|
| `id` | `!(Number(productForm.id))` → `'Product ID is required'`; otherwise, if `!productForm.isExists && products.find(p => p.id == Number(productForm.id))` → `'Product with given ID already exists'` |
| `name` | `productForm.name.length < 3` → `'Product name is invalid'` |
| `price` | `!(Number(productForm.price))` → `'Product price should be greater than ₹0'` |
| `category` | `productForm.category.length < 3` → `'Product category is invalid'` |
| `description` | `productForm.description.length < 3` → `'Product description is invalid'` |
| `stockQuantity` | `!(Number(productForm.stockQuantity))` → `'Product stock should be greater than 0'` |

Consequences of these rules as written: `id`, `price`, and `stockQuantity` reject `0` and any
non-numeric/empty value because of the `Number(...)` truthiness check; `name`, `category`, and
`description` reject empty strings and 1–2 character strings; the duplicate-ID check is scoped by
`!isExists`, so it fires only in add mode and is skipped while editing.

**`inputChangeHandler` (21–27)** — one handler shared by all six fields. Destructures
`{ name, value, type }` from `e.target`; if `type == 'number' && value`, converts `value` to
`Number(value)`; then `setProductForm((prev) => ({ ...prev, [name]: value }))`. The computed
`[name]` key plus the functional-updater form means this single function drives every field, and
the form object identity changes on each keystroke.

**`productSubmitHandler` (29–51)** — `e.preventDefault()` first (this is the actual mechanism
preventing a native form navigation/submission):

- **Update path** (`productForm.isExists` truthy): `products.findIndex(p => p.id == productForm.id)`,
  then `products.splice(index, 1, productForm)` — an in-place mutation of the array already in
  state — then `setProducts([...products])` to hand React a new array reference.
- **Add path**: mutates the draft directly with `productForm.isExists = true`, then
  `setProducts([...products, productForm])` (append).
- **Reset**: `setProductForm({...blank template...})` at the end, so the form clears and the submit
  label returns to "Add Product".

**Form markup** — `<form onSubmit={productSubmitHandler}>` containing six `<InputField>`
instances for `id` (type `number`), `name`, `price` (number), `category`, `description`, and
`stockQuantity` (number). Each passes `value={productForm.X}`, the shared `changeHandler`, and
`errors={errors.X}`. The `id` field additionally receives `readOnly={productForm.isExists}`, so
the ID cannot be changed while editing.

**Submit button** — `type="submit"`, `disabled={errors.id || errors.name || errors.price || errors.description || errors.category || errors.stockQuantity}`. Because `disabled` is a DOM attribute and the expression is the last string in an `||` chain, the button's truthiness follows the last truthy error message. Label is
`{(productForm.isExists) ? 'Update Product' : 'Add Product'}`.

### 6.9 `src/components/ProductList.jsx` — search, filter, and view mode

Consumes `const { products } = useContext(ProductsContext)`.

**Local state:** `searchValue` (`''`), `filterByCategory` (`''`), `selectedProductId` (`0`).

**`clearFilterByCategory`** (15–17) — `setFilterByCategory('')`. Bound to both the "Clear Filter"
button and the self-heal check below.

**`categories`** (19) — `Array.from(new Set(products.map(p => p.category)))`. The option list of
the filter dropdown is therefore *derived during render* from whatever products currently exist;
there is no hardcoded category list, and adding a product with a new category makes it appear.

**Self-heal check** (21–28) — the only comment block in the codebase explains itself: "To check
the selected category really exists in the current product's categories. It is useful when all
products of a category are removed and filterByCategory still stored the deleted category." The
code is `if (filterByCategory && !categories.includes(filterByCategory)) { clearFilterByCategory(); }`
— a `setState` call placed directly in the component body, i.e. during the render phase, which
triggers a re-render of the same component.

**Filter pipeline** (31–38) — `let filteredProducts = products;` then two independent `if`
blocks that reassign it in sequence:
1. if `filterByCategory` → `products.filter(p => p.category == filterByCategory)`
2. if `searchValue` → `.filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()))`

So the two criteria compose (category first, then name within that category), and both comparisons
are case-insensitive for the name.

**Render output** — a `<section>` whose entire body is a ternary on `selectedProductId`:

*Truthy branch (details view):*
- `<h1>Product Details</h1>`
- a button `onClick={() => setSelectedProductId(0)}` labelled "Return to Products List"
- `<ProductCard setSelectedProductId={setSelectedProductId} selectedProductId={selectedProductId} />`
  — note: **no `product` prop**, and **no `key`**

*Falsy branch (list view):*
- `<h1>Products List</h1>`
- `<SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />` — props are drilled
  into SearchBar rather than SearchBar reading context, because the search text is list-local state
- a controlled `<select value={filterByCategory} onChange={e => setFilterByCategory(e.target.value)}>`
  whose first option is `<option value=''>Select the category</option>`, followed by
  `categories.map(c => <option key={c} value={c}>{c}</option>)`
- a "Clear Filter" button wired to `clearFilterByCategory`
- `{filteredProducts.length === 0 && <h3>No products found!</h3>}`
- `{filteredProducts.length > 0 && <ul>{filteredProducts.map(product => <ProductCard setSelectedProductId={setSelectedProductId} key={product.id} product={product} />)}</ul>}`

The empty-state and the list are two separate `&&` expressions rather than one ternary, and the
`<ul>` only exists in the DOM when there is at least one match.

### 6.10 `src/components/ProductCard.jsx` — one component, two roles

Signature:

```jsx
function ProductCard({ product = null, setSelectedProductId, selectedProductId = 0 })
```

Contexts: `{ products, setProducts }` from `ProductsContext` and `{ setProductForm }` from
`ProductFormContext` (only the setter is taken).

**Role resolution (9–15)** — the component is used in two modes:
- *List mode*: called with a `product` prop and `selectedProductId` at its default `0`.
- *Details mode*: called with **no** `product` prop, only `selectedProductId`. The component then
  does `product = products.find(p => p.id == selectedProductId)`. If that lookup fails (product
  deleted out from under the details view) it calls `setSelectedProductId(0)` and `return`s —
  returning `undefined` from a component.

This is why `selectedProductId` is passed into the card at all: it is what makes the extra
description/stock rows and the "View Product" button appear or disappear, and it is how the
component knows it is in details mode.

**`deleteProduct(id)`** (19–21) — `setProducts(prev => prev.filter(p => p.id != id))`, the only
place in the app that uses a functional updater, and the only place that reduces the product count.

**`editProduct(product)`** (23–25) — `setProductForm(product)` and nothing else. That single call is
the whole "edit" mechanism: the shared form in `App` now holds the clicked product, so
`ProductForm` renders in update mode (read-only ID, "Update Product" label, duplicate-ID check
skipped), and the user edits the values there. Because both the form and the list are always
mounted, the effect is immediate and visible on screen.

**Local state** `isDeleteBtnClicked` (17) — drives the two-step confirm. `false` shows the normal
button row; `true` swaps it for a `Are you sure to delete?` prompt with a "Yes" button
(`onClick={() => deleteProduct(id)}`) and a "No" button (`onClick={() => setIsDeleteBtnClicked(false)}`).

**Rendered structure** — a `<li>` containing:
- `<h2>{name}</h2>`, `<h3>₹{price}</h3>`, `<h4>{category}</h4>` — always shown, in both modes
- `{selectedProductId ? <><p>{description}</p><h5>{stockQuantity} more left!</h5></> : ''}` — the
  details-only rows
- either the confirmation block or the action block:
  `{!selectedProductId && <button onClick={() => setSelectedProductId(id)}>View Product</button>}`
  followed by an unconditional `Edit` button and an unconditional `Delete` button.

So in details mode the buttons present are Edit, Delete (and the "Return to Products List" button
rendered by the parent `ProductList`); in list mode they are View Product, Edit, Delete.

### 6.11 `src/components/SearchBar.jsx`

```jsx
function SearchBar({ searchValue, setSearchValue })
```

Owns a tiny `searchInputHandler(e) { const value = e.target.value; setSearchValue(value); }` and
returns a single `<InputField type="text" name="searchInput" id="searchInput"
value={searchValue} changeHandler={searchInputHandler} placeholder="Search for product" />`. No
`label` is passed, so `InputField` renders an empty `<label>` element for it.

### 6.12 `src/components/ui/InputField.jsx`

```jsx
function InputField({ label, type, id, name, value, placeholder, changeHandler,
    readOnly = false, errors })
```

Renders `<div>` → `<label htmlFor={id}>{label}</label>` → `<input type name id value onChange
readOnly placeholder />` → `{errors && <p>{errors}</p>}`. Defaults: `readOnly = false`, `errors`
undefined. The error paragraph is conditionally mounted, and the input is fully controlled because
`value` always comes from a prop.

The abstraction boundary this component establishes: it owns **presentation + labelling + error
display only**. All validation logic lives in the consumer (`ProductForm`), all value ownership
lives in the consumer's state, and the component never reads context. This is why the same
component serves both the product form and the search bar.

---

## 7. End-to-end data flows

**Add a product** — typing in any form field fires `inputChangeHandler` → functional
`setProductForm` → `App` re-renders → new context object → `ProductForm` re-renders → `errors` is
recomputed on the fly and the submit button's `disabled` recomputes. On submit:
`preventDefault()` → append path → `setProducts([...products, productForm])` → form reset.

**Edit a product** — click "Edit" on a card → `editProduct` → `setProductForm(product)` → the
shared form at the top of the page fills with that product, its ID input becomes read-only, and the
button reads "Update Product" → submit takes the update path (`findIndex` + `splice` + new array
reference).

**Delete a product** — click "Delete" → local `isDeleteBtnClicked` flips to `true` and the row is
replaced by the confirm prompt → "Yes" → `setProducts(prev => prev.filter(...))` → if the deleted
product was the last one in its category, the next render of `ProductList` detects the stale
`filterByCategory` and clears it.

**Search** — keystrokes in `SearchBar` update `searchValue` in `ProductsList` → `filteredProducts`
is recomputed on every render → the `<ul>` re-renders with the matching subset, or "No products
found!" if nothing matches.

**View details** — click "View Product" → `setSelectedProductId(id)` → `ProductsList` swaps its
entire `<section>` body to the details branch → `ProductCard` with no `product` prop looks the
product up by `selectedProductId` and renders the extra rows → "Return to Products List" resets
`selectedProductId` to `0`.

---

## 8. Architecture as it stands

- **Composition root:** `main.jsx` → `App.jsx`. `App` is the only place shared state is declared.
- **State distribution:** two React contexts (`ProductsContext`, `ProductFormContext`), both
  consumed with `useContext` — no `Context.Consumer` render-prop style, no `useReducer`/dispatch
  pattern, no custom hook wrappers.
- **Component granularity:** 5 domain components + 1 UI primitive. Search/filter state is
  deliberately *not* global — it is local to `ProductList` and drilled one level into `SearchBar`.
  Delete-confirmation state is local to `ProductCard` and instances are independent per card.
- **A single `ProductCard` serves both the list item and the details screen**, switching on
  `selectedProductId` and an optional `product` prop.
- **Rendering approach:** plain conditional rendering with `&&`, ternaries, and `.map()` with
  `key` — no library, no `React.memo`, no `useMemo`/`useCallback`, no portals, no refs, no effects
  beyond none at all.
- **Markup:** semantic elements — `<form>`, `<section>`, `<ul>`/`<li>`, `<label>`, `<select>`,
  `<option>`, and an `h1`–`h5` heading ladder — with no class names anywhere, because the stylesheets
  are empty.
- **Loose equality (`==`, `!=`)** is used for all ID comparisons in the list and card, and `===`
  is used for array length checks. ID values arrive as strings from `<input type="number">` when a
  field is cleared and as numbers once typed, which is what the numeric coercion in
  `inputChangeHandler` and the `Number(...)` wrapping in the `errors` object account for.
- **Direct state mutation followed by a new reference** (`products.splice(...)` then
  `setProducts([...products])`, and `productForm.isExists = true` before appending) is the
  established pattern for updates that need to notify React.

---

## 9. Development timeline (from git history)

Ten commits on the default branch, each commit adding one feature, in this order:

1. `75f688e` first commit — Vite + React scaffold
2. `5ea3f66` ProductForm component created with validations and submission prevention logic
3. `53b7b0d` Implemented the delete product functionality with user's confirmation
4. `79284aa` Implemented the edit product functionality by allowing the product fields modifiable in the product form
5. `47749eb` Implemented the search products functionality
6. `fc733c2` Refactored the input fields with labels and validation elements as a component for reusability
7. `b047271` / `f0c0fd5` Implemented the filtering the products functionality based on the product's category
8. `ddc1a45` merge from remote `main`
9. `4c00565` Implemented clear filters functionality
10. `5e00787` Implemented the Product Details feature… and also prevented adding products with a duplicate product id

The `public/day-1.png` … `public/day-6.png` screenshots correspond to the six visual stages of that
build-out and are committed to the repo, but `README.md` is still empty — the screenshots are not
yet referenced by any documentation.

---

## 10. Conventions to be aware of when reading the code

- 4-space indentation throughout, despite `eslint.config.js` not configuring a formatter.
- Double quotes in `src/app`, `src/components`, and `src/context`; single quotes in
  `vite.config.js`, `eslint.config.js`, `main.jsx` (the untouched scaffold files).
- Semicolons everywhere except in the two scaffold config files.
- All component files use `export default Component`; both context files use named exports
  (`export const ProductsContext`).
- Components are declared with `function Name()` and use hooks — no arrow components, no
  `React.FC`, no class components.
- `<InputField></InputField>` and `<ProductForm></ProductForm>` style (explicit closing tags) is
  used consistently, not self-closing.
- Only one explanatory comment exists in the entire `src/` tree: the 4-line block in
  `ProductList.jsx:21-25` explaining the stale-category check.
- File extension is explicit in every import (`.jsx` / `.js`).

---

## 11. How to run it

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint     # ESLint over the project
```
