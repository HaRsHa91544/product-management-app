# Product Management App — Complete Architecture

> A layered, descriptive map of this codebase: what each layer is, how the layers connect, what
> each module owns, how data and events travel, and where each architectural decision is realised
> in the source. Descriptive only.

---

# PART 1 — SYSTEM OVERVIEW

## 1.1 What kind of system this is

A **single-page, client-only, in-memory CRUD application**. One HTML document, one React root, no
router, no server, no persistence. The entire application state lives in two `useState` hooks for
the duration of the page session and is discarded on reload.

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (runtime)                        │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │  <div id="root">   ← index.html:11                     │    │
│   │   └─ <App />        ← main.jsx:5  createRoot().render()  │    │
│   │       └─ <ProductsContext value={{products, setProducts}}│    │
│   │           └─ <ProductFormContext value={{form, setForm}} │    │
│   │               ├─ <ProductForm />                        │    │
│   │               └─ <ProductsList />                       │    │
│   │                   ├─ (details mode) <ProductCard />       │    │
│   │                   └─ (list mode)                         │    │
│   │                       ├─ <SearchBar /> → <InputField /> │    │
│   │                       ├─ <select> / <Clear Filter>      │    │
│   │                       └─ <ul>                            │    │
│   │                           └─ <ProductCard /> × N         │    │
│   │                               └─ <InputField /> (in form)│    │
│   └────────────────────────────────────────────────────────┘    │
│                                                                  │
│   State: products[3] + productForm{6 fields} + 3 local states   │
│   Storage: none (no localStorage, no API, no cookies)            │
└──────────────────────────────────────────────────────────────────┘
```

## 1.2 Architectural style

The project uses a **flat, top-down, prop-and-context hybrid** style:

- **Top-down single source of truth.** `App` owns all shared data and hands it down. Nothing
  computes a product list; everyone reads the same array.
- **Context for cross-cutting shared state, props for positional/local coordination.**
  - `ProductsContext` / `ProductFormContext` carry state that *multiple unrelated subtrees* need.
  - `setSelectedProductId` is passed as a **prop** because it belongs to `ProductList` and only its
    immediate children need it (one level of drilling).
- **Derived-everything-in-render.** No value that can be computed from state is stored. Categories,
  filtered products, and validation errors are all recomputed as plain expressions in the component
  body on every render.
- **One source per concept, reused by role.** `ProductCard` renders both list rows and the detail
  screen. `InputField` renders every text input in the app.
- **No indirection layers.** No custom hooks, no reducer/dispatch, no `useMemo`/`useCallback`, no
  memo wrappers, no effects — the architecture is exactly the JSX tree plus two contexts.

## 1.3 Architectural invariants

These hold everywhere in the codebase and define its shape:

1. **Only `App` holds shared state.** No component creates a second copy of the product list.
2. **State flows down, setters flow up** (via context value or via prop).
3. **Inputs are controlled.** Every `<input>` receives `value` from a prop and reports changes
   through an `onChange` handler supplied by its parent. There is no uncontrolled input in `src/`.
4. **The DOM is a pure function of state.** Given the same state, every component renders identical
   markup. The only imperative escape from that rule is the `setState` call placed in
   `ProductList`'s body (see §5.4).
5. **`id` is the business key** of a product, and `isExists` is the marker that separates "new
   draft" from "already stored".
6. **Layers only depend downward.** `ui/` depends on nothing; `components/` depend on `ui/` and
   `context/`; `app/` depends on `components/` and `context/`. Nothing depends upward or sideways
   between peers.

---

# PART 2 — LAYERED STRUCTURE

## 2.1 The five layers

```
┌───────────────────────────────────────────────────────────────────┐
│ L0  HOST / BUILD                     index.html, vite.config.js,  │
│                                      package.json, eslint.config  │
│                                      → supplies #root + JSX       │
│                                      transform + dev server       │
├───────────────────────────────────────────────────────────────────┤
│ L1  ENTRY                             src/main.jsx                │
│                                      → mounts <App/> via          │
│                                        createRoot().render()      │
├───────────────────────────────────────────────────────────────────┤
│ L2  COMPOSITION ROOT                  src/app/App.jsx             │
│                                      → declares shared state,     │
│                                        publishes both contexts,   │
│                                        composes the screen        │
├───────────────────────────────────────────────────────────────────┤
│ L3  STATE REGISTRY                    src/context/*.js            │
│                                      → createContext() only;      │
│                                        no providers, no hooks     │
├───────────────────────────────────────────────────────────────────┤
│ L4  DOMAIN / FEATURE COMPONENTS       ProductForm, ProductList,   │
│                                      ProductCard, SearchBar       │
│                                      → own features, consume      │
│                                        context, compute derived   │
│                                        state, emit events         │
├───────────────────────────────────────────────────────────────────┤
│ L5  UI PRIMITIVES                     src/components/ui/          │
│                                      InputField.jsx               │
│                                      → zero dependencies;         │
│                                        markup + a11y + error slot │
└───────────────────────────────────────────────────────────────────┘
```

**Dependency rule observed:** L0→L1→L2→{L3,L4}→L5. L3 is imported by L2 and L4 but imports only
React. L5 imports nothing at all.

## 2.2 Layer contract table

| Layer | Files | May import | Must not | Knows about |
|---|---|---|---|---|
| L0 Host | `index.html`, `vite.config.js`, `eslint.config.js`, `package.json` | — | app internals | only `#root` |
| L1 Entry | `src/main.jsx` | L0, L2 | L3, L4, L5 | `App` only |
| L2 Root | `src/app/App.jsx` | react, L3, L4 | L5 | all shared state |
| L3 Registry | `src/context/ProductsContext.js`, `ProductFormContext.js` | react | everything | nothing |
| L4 Features | `ProductForm.jsx`, `ProductList.jsx`, `ProductCard.jsx`, `SearchBar.jsx` | react, L3, L5 | L2, peers | context + own props |
| L5 Primitive | `ui/InputField.jsx` | nothing | everything | its own props |

`App.css` sits beside `App.jsx` but is **not part of any layer** — it is an unreferenced 0-byte
file. `index.css` is imported at L1 and is also 0 bytes.

---

# PART 3 — MODULE INVENTORY

## 3.1 File table

| File | Lines | Layer | Role | Imports | Exported |
|---|---:|---|---|---:|---|
| `index.html` | 15 | L0 | HTML host, provides mount node | — | — |
| `vite.config.js` | 7 | L0 | React plugin | 2 | default config |
| `eslint.config.js` | 21 | L0 | Flat lint rules | 5 | default config |
| `package.json` | 27 | L0 | Deps + scripts | — | — |
| `src/main.jsx` | 5 | L1 | Root mount | 3 | — |
| `src/app/App.jsx` | 58 | L2 | State hub / provider host | 5 | default `App` |
| `src/app/App.css` | 0 | — | orphan, never imported | 0 | — |
| `src/index.css` | 0 | L1 | imported, empty | — | — |
| `src/context/ProductsContext.js` | 3 | L3 | products registry | 1 | named `ProductsContext` |
| `src/context/ProductFormContext.js` | 3 | L3 | form-draft registry | 1 | named `ProductFormContext` |
| `src/components/ProductForm.jsx` | 131 | L4 | add/update + validation | 4 | default |
| `src/components/ProductList.jsx` | 81 | L4 | search/filter/list/details switch | 4 | default |
| `src/components/ProductCard.jsx` | 60 | L4 | product renderer + delete/edit actions | 3 | default |
| `src/components/SearchBar.jsx` | 20 | L4 | search input wrapper | 1 | default |
| `src/components/ui/InputField.jsx` | 23 | L5 | labelled input primitive | **0** | default |

Total application JavaScript/JSX: **384 lines across 8 files.** Largest module is `ProductForm.jsx`
(131 lines, 34% of app code). Average module: 48 lines.

## 3.2 Import graph (complete, 22 import statements)

```
main.jsx
 ├─ react-dom/client
 ├─ ./index.css
 └─ app/App.jsx
      ├─ react
      ├─ context/ProductsContext.js ......... (named)
      ├─ context/ProductFormContext.js ..... (named)
      ├─ components/ProductList.jsx ....... (default)
      └─ components/ProductForm.jsx ....... (default)
           ├─ react
           ├─ context/ProductsContext.js
           ├─ context/ProductFormContext.js
           └─ components/ui/InputField.jsx
      └─ components/ProductList.jsx
           ├─ react
           ├─ context/ProductsContext.js
           ├─ components/ProductCard.jsx
           └─ components/SearchBar.jsx
           └─ components/ui/InputField.jsx
           └─ components/ProductCard.jsx
                ├─ react
                ├─ context/ProductsContext.js
                └─ context/ProductFormContext.js

components/ui/InputField.jsx → (no imports whatsoever)
context/*.js                → react only
```

There are **no circular dependencies**, no barrel/index files, no dynamic imports, no aliases, and
no path shortcuts. Every import spells out its file extension.

## 3.3 Fan-in / fan-out

| Module | Imports (fan-out) | Imported by (fan-in) | Role in graph |
|---|---:|---|---|
| `InputField` | 0 | 2 (`ProductForm`, `SearchBar`) | leaf / most reused |
| `ProductsContext` | 1 | 3 (`App`, `ProductForm`, `ProductList`, `ProductCard` → 4) | hub |
| `ProductFormContext` | 1 | 3 (`App`, `ProductForm`, `ProductCard`) | hub |
| `SearchBar` | 1 | 1 (`ProductList`) | pass-through |
| `ProductCard` | 3 | 1 (`ProductList`, but at 2 call sites) | multi-role |
| `ProductForm` | 4 | 1 (`App`) | feature root |
| `ProductList` | 4 | 1 (`App`) | feature root |
| `App` | 5 | 1 (`main.jsx`) | sole root |

`ProductCard` is the only component invoked from **two different call sites** with different
prop shapes.

---

# PART 4 — STATE ARCHITECTURE

## 4.1 Three tiers of state

```
TIER 1 — GLOBAL / SHARED  (declared once in App, published through context)
├── products[]        ← the single source of truth for all product data
└── productForm{}     ← the shared draft; doubles as "edit target"

TIER 2 — CONTAINER-LOCAL  (declared in a feature component, used by its subtree)
├── searchValue           (ProductList)
├── filterByCategory      (ProductList)
└── selectedProductId     (ProductList)

TIER 3 — INSTANCE-LOCAL  (declared per component instance, independent per card)
└── isDeleteBtnClicked    (ProductCard)  × N instances
```

## 4.2 Where each state lives and why

| State | Declared | Type | Read by | Written by | Lifetime |
|---|---|---|---|---|---|
| `products` | `App.jsx:8` | `Array<Object>` | `ProductForm`, `ProductList`, `ProductCard` | `ProductForm`, `ProductCard` | app |
| `productForm` | `App.jsx:38` | `Object` | `ProductForm` | `ProductForm`, `ProductCard` | app |
| `searchValue` | `ProductList.jsx:9` | `string` | `ProductList`, `SearchBar` | `SearchBar` (via prop) | while list mounted |
| `filterByCategory` | `ProductList.jsx:10` | `string` | `ProductList` | `ProductList` `<select>` + self-heal | while list mounted |
| `selectedProductId` | `ProductList.jsx:12` | `Number` | `ProductList`, `ProductCard` | `ProductList` (back button), `ProductCard` (View / reset) | while list mounted |
| `isDeleteBtnClicked` | `ProductCard.jsx:17` | `boolean` | `ProductCard` | `ProductCard` (Delete / No / Yes) | per card instance |

**Ownership reasoning visible in the code:** search and filter are scoped to the list because they
are *view* concerns — nothing outside the list cares which category is selected. Delete
confirmation is scoped to a card because the confirmation is a per-row interaction. `products` and
`productForm` are global because the form (rendered as a sibling of the list) and the cards must
both reach them from separate subtrees — that is precisely the problem context solves here.

## 4.3 Context contracts

Both contexts are created with a fallback and used as JSX tags (React 19 provider shorthand) rather
than `.Provider`.

**`ProductsContext`** — `src/context/ProductsContext.js`

| | |
|---|---|
| Created as | `createContext([])` |
| Provided by | `App.jsx:49` |
| Value shape | `{ products, setProducts }` |
| Consumers | `ProductForm.jsx:7` (both), `ProductList.jsx:7` (`products` only), `ProductCard.jsx:6` (both) |
| Mutators | add (`setProducts([...products, productForm])`), update (`splice` + `setProducts([...products])`), delete (`setProducts(prev => prev.filter(...))`) |

**`ProductFormContext`** — `src/context/ProductFormContext.js`

| | |
|---|---|
| Created as | `createContext({})` |
| Provided by | `App.jsx:50` |
| Value shape | `{ productForm, setProductForm }` |
| Consumers | `ProductForm.jsx:9` (both), `ProductCard.jsx:7` (`setProductForm` only) |
| Mutators | field update (`setProductForm(prev => ({...prev, [name]: value}))`), edit load (`setProductForm(product)`), reset (blank template) |

Note the two consumption patterns that coexist: `ProductForm` takes the **whole object** from
context, `ProductCard` takes only the **setter**, and the setter alone is enough to push a whole
product object into the form. That is why no product object is ever passed as a prop from the card
to the form — the card and the form never share a parent other than `App`.

## 4.4 Update mechanisms in use

| Mechanism | Location | Shape |
|---|---|---|
| Direct value | `setSelectedProductId(id)`, `setIsDeleteBtnClicked(true/false)`, `setFilterByCategory(e.target.value)`, `setSearchValue(value)` | `setX(newValue)` |
| Functional updater (object) | `ProductForm.jsx:24` | `setProductForm(prev => ({ ...prev, [name]: value }))` |
| Functional updater (array) | `ProductCard.jsx:20` | `setProducts(prev => prev.filter(p => p.id != id))` |
| In-place mutation + new reference | `ProductForm.jsx:34-35, 38-39` | `products.splice(index, 1, productForm)` then `setProducts([...products])`; `productForm.isExists = true` then append |
| Reset to literal | `ProductForm.jsx:42-50` | `setProductForm({...blank template...})` |
| Set-during-render | `ProductList.jsx:26-28` | `if (filterByCategory && !categories.includes(filterByCategory)) clearFilterByCategory()` |

## 4.5 Derived state (nothing stored)

| Derived value | Computation | Location |
|---|---|---|
| `categories` | `Array.from(new Set(products.map(p => p.category)))` | `ProductList.jsx:19` |
| `filteredProducts` | base `products` → optional category `.filter` → optional name `.includes` | `ProductList.jsx:31-38` |
| `errors` | six field rules evaluated inline | `ProductForm.jsx:11-19` |
| submit disabled | `errors.id \|\| errors.name \|\| ... ` | `ProductForm.jsx:118-125` |
| button label | `productForm.isExists ? 'Update Product' : 'Add Product'` | `ProductForm.jsx:126` |
| form mode (read-only ID) | `readOnly={productForm.isExists}` | `ProductForm.jsx:62` |
| list-vs-details | `selectedProductId ? <details/> : <list/>` | `ProductList.jsx:42, 48` |
| empty state | `filteredProducts.length === 0` / `> 0` | `ProductList.jsx:64, 69` |
| details lookup | `products.find(p => p.id == selectedProductId)` | `ProductCard.jsx:10` |
| card role | presence of `product` prop | `ProductCard.jsx:5, 9` |

Because every derived value is recomputed per render, the app has **no memoisation and no
caching layer**; correctness comes from the recomputation, not from stored copies.

## 4.6 State transition table

| Trigger | State change | Resulting re-render scope |
|---|---|---|
| Any of 6 form fields change | `productForm.<field>` | `App` → whole tree (context value is a new object literal) |
| Click "Add Product" | `products` grows, `productForm` resets | whole tree; `categories` may gain an entry; button label flips to Add |
| Click "Update Product" | `products[i]` replaced, `productForm` resets | whole tree |
| Click "Delete" | `isDeleteBtnClicked → true` | that card instance only |
| Click "No" | `isDeleteBtnClicked → false` | that card instance only |
| Click "Yes" | `products` shrinks | whole tree; card unmounts; category list may shrink |
| Type in search | `searchValue` | `ProductList` subtree |
| Pick a category | `filterByCategory` | `ProductList` subtree |
| Click "Clear Filter" | `filterByCategory → ''` | `ProductList` subtree |
| Category disappears from products | `filterByCategory → ''` (render-phase set) | `ProductList` re-renders once more |
| Click "View Product" | `selectedProductId → id` | `ProductList` swaps branch; all cards unmount; one detail card mounts |
| Click "Return to Products List" | `selectedProductId → 0` | `ProductList` swaps branch back |
| Detail lookup fails | `selectedProductId → 0` from inside card | `ProductList` swaps branch back |

---

# PART 5 — COMPONENT ARCHITECTURE

## 5.1 Render tree with ownership annotations

```
<App>                                        L2  owns: products, productForm
│  <ProductsContext value={{products, setProducts}}>
│  <ProductFormContext value={{productForm, setProductForm}}>
│  │
│  ├── <ProductForm />                       L4  own: none (all from context)
│  │      reads: products, setProducts, productForm, setProductForm
│  │      writes: products (add/update), productForm (fields + reset)
│  │      computes: errors, isDisabled, buttonLabel
│  │      │
│  │      └── <InputField /> × 6             L5  props only
│  │             label, type, id, name, value, changeHandler, readOnly, errors
│  │
│  └── <ProductsList />                      L4  own: searchValue, filterByCategory,
│         reads: products                        selectedProductId
│         computes: categories, filteredProducts
│         │
│         ├── [selectedProductId truthy] ─ DETAILS BRANCH
│         │     ├── <h1>Product Details</h1>
│         │     ├── <button>Return to Products List</button>
│         │     └── <ProductCard selectedProductId={id} setSelectedProductId={fn} />
│         │            (no `product` prop → resolves by lookup)
│         │
│         └── [selectedProductId falsy] ─ LIST BRANCH
│               ├── <h1>Products List</h1>
│               ├── <SearchBar searchValue setSearchValue />   L4
│               │      └── <InputField />                        L5
│               ├── <select> + <option>All categories</option> + per-category <option>
│               ├── <button>Clear Filter</button>
│               ├── {empty && <h3>No products found!</h3>}
│               └── <ul>
│                     └── <ProductCard product={p} key={p.id} setSelectedProductId={fn} />
│                            × filteredProducts.length
```

**Key observation:** the details branch and the list branch are mutually exclusive — the `<ul>` and
all its cards are destroyed when a product is opened, and rebuilt when it is closed.

## 5.2 Component contracts

### `App` — `src/app/App.jsx`

| Aspect | Detail |
|---|---|
| Props | none |
| Context read | — (it *provides* both) |
| Context write | `ProductsContext`, `ProductFormContext` |
| Hooks | `useState` × 2 |
| Children | `<ProductForm />`, `<ProductsList />` |
| Renders | pure composition, zero markup of its own |

### `ProductsList` — `src/components/ProductList.jsx`

| Aspect | Detail |
|---|---|
| Props | none — reads products from context |
| Context read | `{ products }` |
| Hooks | `useState` × 3 |
| Own functions | `clearFilterByCategory()` |
| Root element | `<section>` |
| Children | `SearchBar`, raw `<select>`, 2 `<button>`s, 0..N `ProductCard` |
| Notable | the only component that switches the screen between two modes |

### `ProductForm` — `src/components/ProductForm.jsx`

| Aspect | Detail |
|---|---|
| Props | none |
| Context read | `{ products, setProducts }` and `{ productForm, setProductForm }` |
| Hooks | none of its own |
| Own functions | `inputChangeHandler(e)`, `productSubmitHandler(e)` |
| Own data | `errors` object (recomputed, not stored) |
| Root element | `<form onSubmit>` |
| Children | 6 × `InputField`, 1 × submit `<button>` |

### `ProductCard` — `src/components/ProductCard.jsx`

| Aspect | Detail |
|---|---|
| Props | `{ product = null, setSelectedProductId, selectedProductId = 0 }` |
| Context read | `{ products, setProducts }`, `{ setProductForm }` |
| Hooks | `useState` × 1 |
| Own functions | `deleteProduct(id)`, `editProduct(product)` |
| Root element | `<li>` |
| Modes | list row (`product` given) · detail view (`product` null, `selectedProductId` given) |
| Early return | `ProductCard.jsx:13` returns `undefined` when the detail lookup fails |

### `SearchBar` — `src/components/SearchBar.jsx`

| Aspect | Detail |
|---|---|
| Props | `{ searchValue, setSearchValue }` |
| Context read | — none (intentionally decoupled from global state) |
| Hooks | none |
| Own functions | `searchInputHandler(e)` |
| Root element | none — returns the `InputField` directly |
| Role | controlled-input adapter: converts a DOM event into a state update |

### `InputField` — `src/components/ui/InputField.jsx`

| Aspect | Detail |
|---|---|
| Props | `{ label, type, id, name, value, placeholder, changeHandler, readOnly = false, errors }` |
| Context read | — none (no imports at all) |
| Hooks | none |
| Own functions | none |
| Root element | `<div>` |
| Children | `<label htmlFor={id}>`, `<input>`, conditional `<p>` |
| Role | the app's only reusable primitive; owns accessibility wiring and error display |

## 5.3 The dual-role `ProductCard`

`ProductCard` is the one component that serves two distinct screens. Its behaviour is fully
determined by which props it receives:

| | **List mode** | **Details mode** |
|---|---|---|
| Call site | `ProductList.jsx:72` | `ProductList.jsx:46` |
| `product` prop | the mapped product object | *absent* → defaults to `null` |
| `selectedProductId` | `0` (default) | the selected id |
| `key` prop | `product.id` | *absent* |
| Data source | the prop itself | `products.find(...)` lookup |
| Name / price / category | shown | shown |
| Description / stock | hidden | shown |
| "View Product" button | shown | hidden |
| "Edit" button | shown | shown |
| "Delete" button | shown | shown |
| Card count | N | exactly 1 |

## 5.4 Render-phase work in `ProductList`

One piece of logic sits directly in the component body rather than in an event handler
(`ProductList.jsx:21-28`):

```js
const categories = Array.from(new Set(products.map(p => p.category)));

if (filterByCategory && !categories.includes(filterByCategory)) {
    clearFilterByCategory();
}
```

The component's own comment describes the purpose: when the last product of the active category is
deleted, the dropdown no longer contains that category, yet `filterByCategory` still holds it, so
the filter is reset during the next render. The same function is also the "Clear Filter" button's
handler, so the reset path is shared.

---

# PART 6 — EVENT & DATA FLOW ARCHITECTURE

## 6.1 Complete event map

| # | Origin UI | Handler | Location | State touched | Downstream effect |
|---|---|---|---|---|---|
| 1 | 6 form inputs | `inputChangeHandler` | `ProductForm.jsx:21` | `productForm[field]` | `errors` recompute, submit enable/disable, ID lock |
| 2 | submit button / Enter | `productSubmitHandler` | `ProductForm.jsx:29` | `products`, `productForm` | card list grows or updates, form clears |
| 3 | "Edit" button | `editProduct` | `ProductCard.jsx:23` | `productForm` (whole object) | form enters update mode |
| 4 | "Delete" button | `setIsDeleteBtnClicked(true)` | `ProductCard.jsx:54` | `isDeleteBtnClicked` | row becomes a confirm prompt |
| 5 | "No" button | `setIsDeleteBtnClicked(false)` | `ProductCard.jsx:47` | `isDeleteBtnClicked` | row returns to normal |
| 6 | "Yes" button | `deleteProduct` | `ProductCard.jsx:19` | `products` | card unmounts, category list may shrink |
| 7 | "View Product" button | `setSelectedProductId(id)` | `ProductCard.jsx:52` | `selectedProductId` | list branch → details branch |
| 8 | "Return to Products List" | `setSelectedProductId(0)` | `ProductList.jsx:45` | `selectedProductId` | details branch → list branch |
| 9 | search input | `searchInputHandler` | `SearchBar.jsx:5` | `searchValue` | list re-filters, empty state may appear |
| 10 | `<select>` | inline arrow | `ProductList.jsx:54` | `filterByCategory` | list re-filters, options unchanged |
| 11 | "Clear Filter" | `clearFilterByCategory` | `ProductList.jsx:15` | `filterByCategory` | filter removed |
| 12 | (automatic) | render-phase check | `ProductList.jsx:26` | `filterByCategory` | stale filter cleared |

Every event in the application is one of these twelve. There are no `onBlur`, `onKeyDown`,
`onSubmit`-on-form-attribute, `onFocus`, or `onMouse*` handlers; no `preventDefault` anywhere except
in the submit handler; no `stopPropagation`; no refs.

## 6.2 Sequence: add a product

```
User types "104" in Product ID
  └─ InputField onChange ─────────────► ProductForm.inputChangeHandler
       • type=='number' && value  →  value = Number(value)
       └─ setProductForm(prev => ({...prev, id: 104}))
            └─ App re-renders
                 ├─ new ProductsContext value object, new ProductFormContext value object
                 ├─ ProductForm re-renders
                 │    • errors.id = ''  (no duplicate, isExists false)
                 │    • submit button enabled
                 └─ ProductsList re-renders (categories recomputed, unchanged)

User clicks "Add Product"
  └─ form onSubmit ──────────────────► ProductForm.productSubmitHandler
       • e.preventDefault()
       • isExists === false → add path
       • productForm.isExists = true          (draft object mutated in place)
       • setProducts([...products, productForm])
       • setProductForm({ id:0, name:'', price:0, category:'', description:'', stockQuantity:0, isExists:false })
            └─ App re-renders
                 ├─ ProductForm: fields empty, errors populated, button disabled, label "Add Product"
                 └─ ProductsList: 4 products
                      • categories recomputed
                      • if the new category is new, a new <option> appears
                      • a 4th <ProductCard> mounts
```

## 6.3 Sequence: edit a product

```
User clicks "Edit" on card for id 102
  └─ ProductCard.editProduct(product)
       └─ setProductForm(the whole 102 object)      ← context write from a leaf component
            └─ App re-renders
                 ├─ ProductForm: id=102, name='Mechanical Keyboard', price=2499, …
                 │    • id input readOnly (isExists true)
                 │    • duplicate-ID check skipped (!isExists guard)
                 │    • button label "Update Product"
                 └─ ProductsList: unchanged (products array untouched)

User edits Price to 1999 and submits
  └─ inputChangeHandler → setProductForm(prev => ({...prev, price: 1999}))
  └─ onSubmit
       • isExists === true → update path
       • index = products.findIndex(p => p.id == 102)
       • products.splice(index, 1, productForm)     ← in-place write into the state array
       • setProducts([...products])                 ← new array identity triggers the re-render
       • setProductForm(blank template)
            └─ App re-renders; card 102 now shows ₹1999; form is blank again
```

## 6.4 Sequence: delete a product

```
User clicks "Delete"
  └─ local isDeleteBtnClicked → true
       └─ only this card re-renders; its <li> content is replaced by the confirm block
          ("Are you sure to delete?" / Yes / No)

User clicks "Yes"
  └─ deleteProduct(id)
       └─ setProducts(prev => prev.filter(p => p.id != id))
            └─ App re-renders
                 ├─ card unmounts
                 ├─ ProductsList recomputes categories
                 └─ if that category has no products left, the render-phase check
                    clears filterByCategory → one further render of ProductList
```

## 6.5 Sequence: view details

```
User clicks "View Product" on a card
  └─ setSelectedProductId(id)                      ← caller's state, via prop
       └─ ProductList re-renders
            • ternary selects the details branch
            • the entire <ul> and all N cards unmount
            • one <ProductCard> mounts with selectedProductId only, no product prop
                 └─ ProductCard: product = products.find(p => p.id == selectedProductId)
                      • renders name, price, category, description, stock
                      • hides the "View Product" button
            • "Return to Products List" button is rendered by ProductList, not the card

User clicks "Return to Products List"
  └─ setSelectedProductId(0) → list branch re-mounts; searchValue and
     filterByCategory were preserved because ProductList itself never unmounted
```

## 6.6 Re-render propagation model

```
                    ┌──────────────────────────────────────┐
   products  ──────►│                                      │
   productForm ────►│  App re-render                      │
                    │   new context value object literals  │
                    └───┬──────────────────────────────┬───┘
                        │                              │
                        ▼                              ▼
                  ProductForm                   ProductsList
                        │                              │
                        ▼                    ┌─────────┼──────────┐
                  InputField × 6            ▼         ▼          ▼
                                        SearchBar  <select>  ProductCard × N
                                            │                (own isDeleteBtnClicked
                                          InputField          can re-render alone)
```

Because both context values are inline object literals, a change to *either* context re-renders
every context consumer, and `App` re-rendering re-runs every child's function body. Local state
(`searchValue`, `filterByCategory`, `selectedProductId`, `isDeleteBtnClicked`) scopes its re-render
to the subtree that owns it.

---

# PART 7 — CROSS-CUTTING CONCERNS

## 7.1 Validation architecture

Validation lives entirely in the consumer, never in the primitive:

```
ProductForm.jsx:11-19   errors = { id, name, price, category, description, stockQuantity }
                              │
        ┌─────────────────────┼──────────────────────────┐
        ▼                     ▼                          ▼
  InputField errors   <button disabled=            (also used to decide
  prop → renders      errors.id || errors.name     nothing else;
  <p>{errors}</p>     || ... || errors.stock      no submit-time check
```

Rules, verbatim in intent:

| Field | Condition | Message | Empty-value behaviour |
|---|---|---|---|
| `id` | `!(Number(id))` | Product ID is required | `0` and `''` both fail |
| `id` | `!isExists && products.find(p => p.id == Number(id))` | Product with given ID already exists | add-mode only |
| `name` | `name.length < 3` | Product name is invalid | `''` fails |
| `price` | `!(Number(price))` | Product price should be greater than ₹0 | `0` and `''` both fail |
| `category` | `category.length < 3` | Product category is invalid | `''` fails |
| `description` | `description.length < 3` | Product description is invalid | `''` fails |
| `stockQuantity` | `!(Number(stockQuantity))` | Product stock should be greater than 0 | `0` and `''` both fail |

Enforcement is **preventive, not corrective**: the submit button is `disabled` while any error is
truthy, and the only guard inside `productSubmitHandler` is `e.preventDefault()`. Errors appear as
they are typed, not on blur or on submit.

## 7.2 Identifier and coercion architecture

`id` is simultaneously a DOM input value, a React state value, and a business key. The code bridges
those three roles with three mechanisms:

1. `inputChangeHandler` — `if (type == 'number' && value) value = Number(value)`; numeric fields
   store numbers, except the transient empty string a number input emits mid-edit.
2. The `errors` object — `Number(productForm.id)` / `Number(productForm.price)` /
   `Number(productForm.stockQuantity)` normalise before the truthiness test, so `''` and `0` are
   both rejected.
3. Comparisons — `==` / `!=` in `products.find`, `products.filter`, `findIndex`, and
   `p.id == selectedProductId`, so a string `'101'` still matches the number `101`.

`key` in the list is `product.id`; the `<select>` is keyed by category string; the details-branch
card has no key because it is a single child.

## 7.3 Identity and mode signalling

The app distinguishes three "modes" without a router or an explicit mode enum:

| Mode | Signal | Consequence |
|---|---|---|
| add | `productForm.isExists === false` | ID editable, duplicate check active, label "Add Product" |
| edit | `productForm.isExists === true` | ID `readOnly`, duplicate check skipped, label "Update Product" |
| list | `selectedProductId === 0` | `<ul>` rendered, cards show View/Edit/Delete |
| details | `selectedProductId !== 0` | single card, extra rows, no View button |

`isExists` is written in three places: `true` in all three seed products, `false` in the blank
template, and set to `true` on the add path (`ProductForm.jsx:38`).

## 7.4 Presentation architecture

- No stylesheets have content: `index.css` (0 bytes, imported at `main.jsx:2`) and `App.css`
  (0 bytes, never imported).
- No class names, no inline `style` attributes, no CSS modules, no framework.
- Styling is entirely default browser rendering plus semantic HTML: `<section>`, `<form>`, `<ul>`,
  `<li>`, `<label>`, `<select>`, `<option>`, `<button>`, and an `h1`–`h5` heading ladder.
- Accessibility wiring that does exist: every input has a matching `id` and a `<label htmlFor>`;
  error text is a sibling `<p>`; buttons are real `<button>` elements; the submit button declares
  `type="submit"`.

## 7.5 Error and edge-case handling

| Situation | Handling present in the code |
|---|---|
| Empty search result | `filteredProducts.length === 0 && <h3>No products found!</h3>` |
| Native form navigation | `e.preventDefault()` in the submit handler |
| Double submit | prevented by the `disabled` attribute driven by `errors` |
| Duplicate product ID | `errors.id` second rule |
| Stale category filter after delete | render-phase `!categories.includes(...)` check |
| Deleted product still open in details view | `ProductCard.jsx:11-14` → `setSelectedProductId(0)` and `return` |
| Zero-value fields | `Number()`-based truthiness checks in `errors` |
| Type coercion on numeric input | `Number(value)` in the change handler |
| Missing `product` prop in list mode | default `product = null` triggers the lookup path |

## 7.6 Things the architecture deliberately does not include

Effects (`useEffect`) for anything, custom hooks, `useReducer` + dispatch, `useMemo`,
`useCallback`, `React.memo`, refs, portals, context selectors, `Context.Consumer`, router,
state library, TypeScript types or PropTypes, tests or test runner, error boundaries, lazy
loading, caching, persistence, API layer, CSS, i18n, accessibility audit, performance
memoisation, barrel files, path aliases, environment variables.

---

# PART 8 — ARCHITECTURAL PATTERNS IN USE

| Pattern | Where | Expression of it here |
|---|---|---|
| Composition root | `main.jsx:5` | `createRoot(...).render(<App />)` |
| State colocation | `ProductList.jsx:9-12`, `ProductCard.jsx:17` | view state kept next to the view |
| Lift state up | `App.jsx:8,38` | the two shared records hoisted to the root |
| Context for shared state | `App.jsx:49-50` + 3 consumers each | avoids threading products through 3 levels |
| Prop drilling (shallow) | `ProductList` → `SearchBar`, `ProductCard` | one level, for state local to the parent |
| Context-as-provider (React 19) | `App.jsx:49-50` | `<Context value={...}>` instead of `.Provider` |
| Controlled component | all inputs | `value` from state + `onChange` setter |
| Derived state during render | `ProductList.jsx:19,31-38`, `ProductForm.jsx:11-19` | no `useMemo`, no mirroring in state |
| Single handler for N fields | `ProductForm.jsx:21-27` | `e.target.name` + computed `[name]` key |
| Functional setState | `ProductForm.jsx:24`, `ProductCard.jsx:20` | `prev => next` for updates based on prior value |
| Reusable primitive | `ui/InputField.jsx` | one input abstraction, zero dependencies, used in 2 places |
| Presentational / container split | `ui/InputField` vs `ProductForm` | primitive knows markup; container knows rules |
| Compound component role-switching | `ProductCard.jsx:5,9` | optional `product` prop selects list vs details mode |
| Conditional rendering via ternary | `ProductList.jsx:42,48` | two mutually exclusive screen branches |
| Conditional rendering via `&&` | `ProductList.jsx:64,69`, `ProductCard.jsx:34,52` | element-or-nothing |
| List rendering with keys | `ProductList.jsx:57,72` | `key={c}`, `key={product.id}` |
| Two-step destructive confirm | `ProductCard.jsx:17,43-56` | local boolean swaps the button row for a prompt |
| Form-mode switching | `isExists` | read-only field, swapped label, swapped submit branch |
| Self-healing derived UI | `ProductList.jsx:26-28` | invalid filter state corrected on render |
| Semantic HTML as structure | whole app | `form`/`ul`/`li`/`label`/`select`/`button`, h1–h5 |
| Blanket early return | `ProductCard.jsx:13` | `return` before the main JSX when data is missing |

---

# PART 9 — CODEBASE CONVENTIONS

| Convention | Rule observed |
|---|---|
| Indentation | 4 spaces, uniformly |
| Quotes | double in `app/`, `components/`, `context/`; single in `main.jsx`, `vite.config.js`, `eslint.config.js` |
| Semicolons | present everywhere except the two untouched scaffold config files |
| Component form | `function Name() { }` + hooks; no arrows, no classes, no `React.FC` |
| Module exports | components `export default`; contexts named `export const` |
| Import extensions | always explicit (`.jsx`, `.js`) |
| Import ordering | react → context → components; `ui/` imported last |
| JSX children | explicit closing tags (`<InputField></InputField>`) |
| Boolean props | expressions, e.g. `readOnly={productForm.isExists}` |
| Event handlers | named `function` declared above the `return` |
| Handler naming | `inputChangeHandler`, `productSubmitHandler`, `searchInputHandler`, `deleteProduct`, `editProduct`, `clearFilterByCategory` |
| Props naming | camelCase; `errors` for the error string, `changeHandler` for the change callback |
| Comparison | `==` / `!=` for ids, `===` for lengths and `typeof` checks |
| Comments | exactly one block in all of `src/` — `ProductList.jsx:21-25` |
| Lint rules | `js.recommended` + `react-hooks` recommended + `react-refresh` vite preset |

---

# PART 10 — GROWTH SURFACE

Where each new requirement would attach, given the current structure:

| Requirement | Attachment point | Existing pieces it would reuse |
|---|---|---|
| New product field | seed objects in `App.jsx:9-35`, blank template in `App.jsx:38-46` and `ProductForm.jsx:42-50`, `errors` in `ProductForm.jsx:11-19`, one `InputField` in `ProductForm.jsx:55-114`, `ProductCard.jsx:27` destructuring | `inputChangeHandler` (needs no change — it is name-driven), `errors`→`disabled` chain |
| A sixth filter dimension | `ProductList.jsx:9-10` (new `useState`), `:31-38` (new filter step), `:54-61` (new control) | the existing `clearFilterByCategory` self-heal pattern |
| Sorting | `ProductList.jsx:31-38` — derived, so it composes with the filter chain | `categories` derivation style |
| A new screen (e.g. stock report) | a new branch in `ProductList.jsx:40`'s ternary, or a new `selectedView` state replacing `selectedProductId` truthiness | `selectedProductId` mode-switch pattern |
| Persisting products | the three mutation sites: `ProductForm.jsx:35`, `:39`, `ProductCard.jsx:20` | the context already exposes `setProducts` app-wide |
| Per-card edit instead of global form | give `ProductCard` its own `useState` draft; `ProductForm` stays for add | the `ProductFormContext` write path from `ProductCard.editProduct` |
| Shared validation | a new module imported by `ProductForm.jsx:11-19`; `InputField` already accepts any error string | `InputField` needs no change |
| Any styling | `src/index.css` and/or `src/app/App.css`; `App.css` is currently unimported | semantic element structure is already in place |

---

# PART 11 — QUICK REFERENCE

**Runtime flow:** `index.html` → `/src/main.jsx` → `createRoot().render(<App />)` → `App` declares
`products` + `productForm` → publishes both contexts → renders `ProductForm` and `ProductsList` →
`ProductsList` renders `SearchBar` + `ProductCard × N` → `SearchBar` and `ProductForm` render
`InputField`.

**State locations:** `products` `App.jsx:8` · `productForm` `App.jsx:38` · `searchValue`
`ProductList.jsx:9` · `filterByCategory` `ProductList.jsx:10` · `selectedProductId`
`ProductList.jsx:12` · `isDeleteBtnClicked` `ProductCard.jsx:17`.

**Context files:** `ProductsContext` `createContext([])` · `ProductFormContext` `createContext({})`
— both provided as `<Context value={{...}}>` at `App.jsx:49-50`.

**Modes:** add vs edit ← `productForm.isExists`; list vs details ← `selectedProductId !== 0`;
normal vs confirming-delete ← `isDeleteBtnClicked`.

**Validation:** `ProductForm.jsx:11-19`, rendered by `InputField.jsx:19`, enforced by
`disabled` at `ProductForm.jsx:118-125`.

**Commands:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.
