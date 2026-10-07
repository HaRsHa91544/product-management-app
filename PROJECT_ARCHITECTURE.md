# Product Management App — Complete Architecture

> A detailed, descriptive map of the codebase as it stands in the working tree. Descriptive only —
> this records what the code *is* and *does*, file by file and line by line, with no corrections
> proposed.
>
> **Working-tree note.** Three files are currently modified and uncommitted:
> `src/components/ProductsView.jsx`, `src/components/ProductForm.jsx`,
> `src/utils/validateProducts.js`. This document describes the **working tree** (what is on disk),
> not the last commit. The differences are recorded in §10.4.

---

# PART 1 — SYSTEM OVERVIEW

## 1.1 What kind of system this is

A **single-page, client-only, in-memory CRUD application**. One HTML document, one React root, no
router, no server, no persistence. State lives in `useState` hooks for the duration of the page
session and is discarded on reload.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (runtime)                               │
│                                                                              │
│  <div id="root">                                     index.html              │
│   └─ <App />                                         main.jsx:5              │
│      │                                                  createRoot().render() │
│      ├─ useState × 2:  products, productForm                                 │
│      ├─ useMemo  × 2:  productsContextValue, productFormContextValue         │
│      │                                                                │       │
│      └─ <ProductsContext value={productsContextValue}>                       │
│         └─ <ProductFormContext value={productFormContextValue}>              │
│            │                                                                │
│            ├─ <ProductForm />                    [memo]                     │
│            │   └─ <InputField /> × 6                                        │
│            │   └─ Reset + submit <button>                                   │
│            │                                                                │
│            └─ <ProductsView />                    ← no props                │
│                │  owns: selectedProductId, searchValue, category             │
│                │                                                                │
│                ├─ if selectedProduct truthy  → EARLY RETURN:                │
│                │      <ProductDetails product setSelectedProductId />        │
│                │                                                                │
│                └─ otherwise:                                                 │
│                       derives: categories, filteredProducts,                │
│                                validationError   (via src/utils/)            │
│                       <section>                                             │
│                       ├─ <SearchBar searchValue setSearchValue />           │
│                       ├─ <FilterByCategory categories category setCategory />│
│                       └─ <ProductsList products validationError             │
│                                       setSelectedProductId />   [memo]       │
│                           └─ <ProductCard product setSelectedProductId /> × N│
│                                                                              │
│  Storage: none. No localStorage, no API, no cookies.                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Architectural style

A **top-down, single-source-of-truth, container + pure-leaf** structure, with three deliberate seams:

- **One root owns shared data.** `App` holds only `products` and `productForm`, and publishes both
  through context. It holds no view state at all.
- **A dedicated container owns view state.** `ProductsView` owns `selectedProductId`, `searchValue`,
  and `category`. The source comment at `ProductsView.jsx:13` states the intent:
  `// States which are living here for the persistence`.
- **Leaves own only interaction state.** `ProductCard` and `ProductDetails` each hold exactly one
  local flag: `isDeleteBtnClicked`.

Four kinds of code are separated by file type rather than by convention:

| File type | Location | Imports React? | Has state? |
|---|---|---|---|
| Components | `src/components/`, `src/app/` | yes | sometimes |
| Contexts | `src/context/` | yes (`createContext`) | no |
| Behaviour hooks | `src/hooks/` | yes | **no** |
| Pure functions | `src/utils/` | **no** | no |
| UI primitives | `src/components/ui/` | **no** | no |

## 1.3 Architectural invariants

1. **`App` is the only place shared state is declared** (`App.jsx:8, 38`) and the only place both
   contexts are provided (`App.jsx:57-58`).
2. **State flows down, setters flow up** — through a context value, or through a prop.
3. **Every input is controlled.** Every `<input>` receives `value` from a prop and reports changes
   through a supplied `onChange`. There is no uncontrolled input in `src/`.
4. **The DOM is a function of state.** Same state ⇒ identical markup. There is **no `setState` call
   during render anywhere in the codebase** — the render-phase self-heal that used to exist in the
   list was removed (see §5.7).
5. **`id` is the business key**; `isExists` distinguishes "new draft" from "already stored";
   `selectedProductId` selects the screen.
6. **Dependencies only point downward.** `utils/` and `ui/` import nothing. `hooks/` imports
   `context/` only. Components import `context/`, `hooks/`, `utils/`, `ui/`. `app/` imports
   `components/` and `context/`. Nothing imports upward. `src/app/App.css` is unreferenced.

---

# PART 2 — LAYERED STRUCTURE

## 2.1 The seven layers

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ L0  HOST / BUILD        index.html · vite.config.js · package.json           │
│                         eslint.config.js · .gitignore                        │
│                         → supplies #root, JSX transform, dev server, lint    │
├──────────────────────────────────────────────────────────────────────────────┤
│ L1  ENTRY                src/main.jsx                                 (5)    │
│                         → createRoot(#root).render(<App />)                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ L2  COMPOSITION ROOT     src/app/App.jsx                              (66)   │
│                         → owns products + productForm, derives two memoized  │
│                           context values, provides both contexts             │
├──────────────────────────────────────────────────────────────────────────────┤
│ L3  STATE REGISTRY       src/context/ProductsContext.js               (3)    │
│                         src/context/ProductFormContext.js             (3)    │
│                         → createContext() only. No provider component.       │
├──────────────────────────────────────────────────────────────────────────────┤
│ L4  BEHAVIOUR HOOK       src/hooks/useProductActions.js              (20)   │
│                         → editProduct + deleteProduct; context consumers;    │
│                           no state of its own                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ L5  CONTAINER            src/components/ProductsView.jsx             (63)   │
│                         → owns the 3 view states, picks the screen, derives  │
│                           categories/filteredProducts/validationError       │
├──────────────────────────────────────────────────────────────────────────────┤
│ L6  FEATURE COMPONENTS   ProductForm(143) · ProductsList(24) ·               │
│                         ProductCard(33) · ProductDetails(34) ·              │
│                         FilterByCategory(20) · SearchBar(20)                │
│                         → forms, display, interaction                        │
│                                                                              │
│ L7  PURE LOGIC           src/utils/filterProducts.js                (14)    │
│                         src/utils/validateProducts.js               (12)    │
│                         → zero React, zero state, plain input→output         │
│                                                                              │
│ L8  UI PRIMITIVE         src/components/ui/InputField.jsx            (23)    │
│                         → zero imports; markup + a11y + error slot           │
└──────────────────────────────────────────────────────────────────────────────┘
```

L7 and L8 sit at the same depth — both are stateless, both import nothing from this app. L7 is
logically below L6 (components call the functions); L8 is compositional (components render it).

## 2.2 Layer contracts

| Layer | Files | May import | Must not import | Knows about |
|---|---|---|---|---|
| L0 Host | `index.html`, `vite.config.js`, `eslint.config.js`, `package.json` | — | app internals | only `#root` |
| L1 Entry | `main.jsx` | L0, L2 | L3–L8 | `App` only |
| L2 Root | `app/App.jsx` | react, L3, L6 | L4, L5, L7, L8 | all shared state |
| L3 Registry | `context/*.js` | react | everything | nothing |
| L4 Hook | `hooks/useProductActions.js` | react, L3 | L2, L5, L6, L7, L8 | both contexts |
| L5 Container | `components/ProductsView.jsx` | react, L3, L6 | L2, L4 | `ProductsContext` |
| L6 Features | `ProductForm`, `ProductsList`, `ProductCard`, `ProductDetails`, `FilterByCategory`, `SearchBar` | react, L3, L4, L7, L8 | L2, L5, peers | own props (+ `ProductForm` reads both contexts) |
| L7 Logic | `utils/*.js` | **nothing** | everything | its parameters |
| L8 Primitive | `ui/InputField.jsx` | **nothing** | everything | its props |

## 2.3 What the pure-logic layer buys

Both functions were lifted out of `ProductsView` (commit `743bc4f`). The effect on the container:

| | Before | After |
|---|---|---|
| Filter chain | inline `if (category) … if (searchValue) …` in the component | `filterProducts(products, category, searchValue)` |
| Empty/stale messages | inline ternaries and a `setState` during render | `validateProducts(...)` returning a string |
| React awareness needed to understand either | yes — they read component state and called setters | **no** — plain arrays and strings in, string out |
| Unit-testable without rendering | no | yes |

The same applies to the fifth extraction: `FilterByCategory` was pulled out of the container's JSX
so that the select + clear button pair is one component rather than a block of markup (commit
`743bc4f`).

---

# PART 3 — MODULE INVENTORY

## 3.1 Complete file table

| File | Lines | Layer | Role | Imports | Exported |
|---|---:|---|---|---:|---|
| `index.html` | 15 | L0 | HTML host, provides mount node | — | — |
| `vite.config.js` | 7 | L0 | React plugin, nothing else | 2 | default config |
| `eslint.config.js` | 20 | L0 | Flat lint rules | 5 | default config |
| `package.json` | 27 | L0 | Deps + 4 scripts | — | — |
| `.gitignore` | 22 | L0 | Vite/Node/editor ignores | — | — |
| `README.md` | 90 | doc | Intro, run steps, day-by-day log | — | — |
| `LESSONS.md` | 12 | doc | 6 numbered lessons | — | — |
| `PROJECT_ARCHITECTURE.md` | this | doc | This document | — | — |
| `src/main.jsx` | 5 | L1 | Root mount | 3 | — |
| `src/index.css` | 0 | L1 | Imported, empty | — | — |
| `src/app/App.jsx` | 66 | L2 | State hub + provider host | 5 | default `App` |
| `src/app/App.css` | 0 | — | **orphan, never imported** | 0 | — |
| `src/context/ProductsContext.js` | 3 | L3 | products registry | 1 | named `ProductsContext` |
| `src/context/ProductFormContext.js` | 3 | L3 | form-draft registry | 1 | named `ProductFormContext` |
| `src/hooks/useProductActions.js` | 20 | L4 | edit + delete actions | 3 | default hook |
| `src/components/ProductsView.jsx` | 63 | L5 | Screen container, view state owner | 8 | default |
| `src/components/ProductForm.jsx` | 143 | L6 | Add/update/reset + validation · **`memo`** | 4 | `memo(ProductForm)` |
| `src/components/ProductsList.jsx` | 24 | L6 | Pure product display · **`memo`** | 2 | `memo(ProductsList)` |
| `src/components/ProductCard.jsx` | 33 | L6 | One product as a list row | 2 | default |
| `src/components/ProductDetails.jsx` | 34 | L6 | One product as a details view | 2 | default |
| `src/components/FilterByCategory.jsx` | 20 | L6 | Category select + clear button | 0 | default |
| `src/components/SearchBar.jsx` | 20 | L6 | Search input adapter | 1 | default |
| `src/components/ui/InputField.jsx` | 23 | L8 | Labelled input primitive | **0** | default |
| `src/utils/filterProducts.js` | 14 | L7 | Category + name filter chain | **0** | default function |
| `src/utils/validateProducts.js` | 12 | L7 | Empty/stale-state message picker | **0** | default function |

**Total application code: 483 lines across 15 JS/JSX files** (was 357 across 12 at the previous
architecture revision).

Largest module is still `ProductForm.jsx` at 143 lines — 30% of all application code. Median module
is 23 lines.

`public/` holds `day-1.png` … `day-7.png`, referenced by `README.md`.

## 3.2 Complete import graph (26 import statements)

```
main.jsx
 ├─ react-dom/client
 ├─ ./index.css
 └─ app/App.jsx
      ├─ react                                     (useMemo, useState)
      ├─ context/ProductsContext.js                named
      ├─ context/ProductFormContext.js             named
      ├─ components/ProductForm.jsx                default
      └─ components/ProductsView.jsx               default

components/ProductsView.jsx
 ├─ react                                          (useContext, useState)
 ├─ context/ProductsContext.js
 ├─ components/ProductDetails.jsx
 ├─ components/ProductsList.jsx
 ├─ components/SearchBar.jsx
 ├─ components/FilterByCategory.jsx
 ├─ utils/filterProducts.js                        default
 └─ utils/validateProducts.js                      default

components/ProductForm.jsx
 ├─ react                                          (memo, useContext)
 ├─ context/ProductsContext.js
 ├─ context/ProductFormContext.js
 └─ components/ui/InputField.jsx

components/ProductsList.jsx
 ├─ react                                          (memo)
 └─ components/ProductCard.jsx

components/ProductCard.jsx
 ├─ react                                          (useState)
 └─ hooks/useProductActions.js                     default

components/ProductDetails.jsx
 ├─ react                                          (useState)
 └─ hooks/useProductActions.js                     default

components/SearchBar.jsx
 └─ components/ui/InputField.jsx

hooks/useProductActions.js
 ├─ react                                          (useContext, useState ← UNUSED)
 ├─ context/ProductsContext.js
 └─ context/ProductFormContext.js

components/FilterByCategory.jsx   → NO IMPORTS
components/ui/InputField.jsx      → NO IMPORTS
utils/filterProducts.js           → NO IMPORTS
utils/validateProducts.js         → NO IMPORTS
context/*.js                      → react only
```

**No cycles. No barrel files. No aliases. No dynamic imports.** Every import spells its extension.
Four modules now import nothing at all — that is up from one at the previous revision.

## 3.3 Fan-in / fan-out

| Module | Out | In | Note |
|---|---:|---:|---|
| `InputField` | 0 | 2 | leaf, `ProductForm` + `SearchBar` |
| `FilterByCategory` | 0 | 1 | leaf, no state, no context |
| `filterProducts` | 0 | 1 | leaf function |
| `validateProducts` | 0 | 1 | leaf function |
| `ProductsContext` | 1 | 4 | `App`, `ProductForm`, `ProductsView`, `useProductActions` |
| `ProductFormContext` | 1 | 3 | `App`, `ProductForm`, `useProductActions` |
| `useProductActions` | 3 | 2 | `ProductCard`, `ProductDetails` |
| `SearchBar` | 1 | 1 | `ProductsView` |
| `ProductsList` | 2 | 1 | `ProductsView`, one call site |
| `ProductCard` | 2 | 1 | `ProductsList`, `.map()` |
| `ProductDetails` | 2 | 1 | `ProductsView`, early return |
| `ProductForm` | 4 | 1 | `App`, always mounted |
| `ProductsView` | 8 | 1 | `App`, always mounted |
| `App` | 5 | 1 | `main.jsx` |

`ProductsView` has the highest fan-out in the codebase (8 imports) — it is the orchestrator, and
that is exactly the shape of its job.

---

# PART 4 — STATE ARCHITECTURE

## 4.1 Three tiers of state

```
TIER 1 — SHARED      (declared once in App, distributed via context)
├── products[]         product records
└── productForm{}      shared draft / edit target

TIER 2 — CONTAINER    (declared in ProductsView, distributed via props)
├── selectedProductId    which product's details are open (null = none)
├── searchValue          current search text
└── category             current category filter

TIER 3 — INSTANCE     (one independent copy per component instance)
└── isDeleteBtnClicked   inline delete confirmation, in ProductCard AND ProductDetails
```

There is **no tier belonging to `App` itself** and **no state in `ProductsList`**. Every hook in the
codebase is accounted for by these six.

## 4.2 Where each state lives and why

| State | Declared | Type | Read by | Written by | Tier |
|---|---|---|---|---|---|
| `products` | `App.jsx:8` | `Array<Object>` | `ProductForm`, `ProductsView`, `useProductActions` | `ProductForm`, `useProductActions` | 1 |
| `productForm` | `App.jsx:38` | `Object` | `ProductForm` | `ProductForm`, `useProductActions` | 1 |
| `selectedProductId` | `ProductsView.jsx:14` | `Number \| null` | `ProductsView` | `ProductCard`, `ProductDetails`, `ProductsView` | 2 |
| `searchValue` | `ProductsView.jsx:15` | `string` | `ProductsView` | `SearchBar` (via prop) | 2 |
| `category` | `ProductsView.jsx:16` | `string` | `ProductsView` | `FilterByCategory` (via prop) | 2 |
| `isDeleteBtnClicked` | `ProductCard.jsx:7` | `boolean` | that card only | that card only | 3 |
| `isDeleteBtnClicked` | `ProductDetails.jsx:7` | `boolean` | that details view only | that details view only | 3 |

The comment block at `ProductsView.jsx:13-17` makes the ownership explicit:

```js
// States which are living here for the persistence
const [selectedProductId, setSelectedProductId] = useState(null);
const [searchValue, setSearchValue] = useState('');
const [category, setCategory] = useState('');
//---------------------------------------------------------------
```

"Persistence" here means surviving the screen switch — because `ProductsView` renders
`<ProductDetails>` via an **early return** rather than by replacing itself, the component instance
stays mounted and all three values survive a round trip to the details view and back.

## 4.3 The sentinel

`selectedProductId` starts as `null` (`ProductsView.jsx:14`) and is reset to `null`
(`ProductDetails.jsx:12`). `null` is used rather than `0` because `0` would collide with a
legitimate numeric id and `null` reads as "nothing selected".

## 4.4 Context contracts

Both contexts are created with a fallback and provided as JSX tags (React 19 shorthand), never as
`.Provider`.

**`ProductsContext`** — `src/context/ProductsContext.js` (3 lines)

| | |
|---|---|
| Created as | `createContext([])` |
| Provided by | `App.jsx:57` with `value={productsContextValue}` |
| Value shape | `{ products, setProducts }` |
| Memoised | yes — `useMemo(..., [products])` at `App.jsx:48-50` |
| Consumers | `ProductForm.jsx:7`, `ProductsView.jsx:11`, `useProductActions.js:6` |
| Mutators | add `setProducts([...products, productForm])`; update `setProducts(products.map(...))`; delete `setProducts(prev => prev.filter(...))` |

**`ProductFormContext`** — `src/context/ProductFormContext.js` (3 lines)

| | |
|---|---|
| Created as | `createContext({})` |
| Provided by | `App.jsx:58` with `value={productFormContextValue}` |
| Value shape | `{ productForm, setProductForm }` |
| Memoised | yes — `useMemo(..., [productForm])` at `App.jsx:52-54` |
| Consumers | `ProductForm.jsx:9`, `useProductActions.js:7` |
| Mutators | field update `setProductForm(prev => ({...prev, [name]: value}))`; edit load `setProductForm(product)`; reset via `clearProductForm()` |

### Consumer movement across revisions

| Context | Previously consumed by | Now consumed by |
|---|---|---|
| `ProductsContext` | `App`, `ProductForm`, `ProductsList`, `useProductActions` | `App`, `ProductForm`, **`ProductsView`**, `useProductActions` |
| `ProductFormContext` | `App`, `ProductForm`, `useProductActions` | `App`, `ProductForm`, `useProductActions` |

`ProductsList` stopped reading context and now takes `products` as a prop (commit `9a70b63`), which
is what makes `memo(ProductsList)` meaningful: it is now protected from *both* prop changes and has
no context subscription to bypass it.

## 4.5 The `useMemo` layer (unchanged from previous revision)

```js
const productsContextValue = useMemo(() => {
    return { products, setProducts };
}, [products]);                                   // App.jsx:48-50

const productFormContextValue = useMemo(() => {
    return { productForm, setProductForm };
}, [productForm]);                                // App.jsx:52-54
```

Without these, every render of `App` would allocate two new context objects and force every
consumer to re-render regardless of `memo()`. The setters are omitted from both dependency arrays
because `useState` setters are guaranteed stable.

## 4.6 The `memo()` layer

| Component | Wrapped? | Location | Why it works |
|---|---|---|---|
| `ProductForm` | yes | `ProductForm.jsx:143` | takes no props; `memo` bails when neither context value changed identity |
| `ProductsList` | yes | `ProductsList.jsx:24` | takes 3 props, no context; `setSelectedProductId` is stable, so it re-renders only when `products` or `validationError` actually change |
| `ProductsView` | **no** | `ProductsView.jsx:63` | takes no props, consumes context, is the container — `memo` would be a no-op |
| `ProductCard` | no | `ProductCard.jsx:33` | re-renders whenever `ProductsList` does |
| `ProductDetails` | no | `ProductDetails.jsx:34` | single instance |
| `FilterByCategory` | no | `FilterByCategory.jsx:20` | small; props are `categories` (new array each render) so `memo` would rarely bail |
| `SearchBar` | no | `SearchBar.jsx:20` | re-renders on each keystroke by design |
| `InputField` | no | `InputField.jsx:23` | leaf |

`ProductsList` is the component for which `memo` is now genuinely load-bearing: it no longer reads
context, so a `productForm`-only change at the root produces a new `productFormContextValue`, an
unchanged `productsContextValue`, no prop change for `ProductsList`, and therefore a bailed render.

## 4.7 Update mechanisms in use

| Mechanism | Location | Shape |
|---|---|---|
| Direct value | `setSelectedProductId(id/null)`, `setIsDeleteBtnClicked(true/false)`, `setSearchValue`, `setCategory`, `setCategory('')` | `setX(newValue)` |
| Functional updater (object) | `ProductForm.jsx:26-28` | `setProductForm(prev => ({ ...prev, [name]: value }))` |
| Functional updater (array) | `useProductActions.js:10` | `setProducts(prev => prev.filter(p => p.id != id))` |
| Immutable map-replace | `ProductForm.jsx:39-41` | `setProducts(products.map(p => p.id != productForm.id ? p : productForm))` |
| In-place mutation + new reference | `ProductForm.jsx:44-45` | `productForm.isExists = true` then `setProducts([...products, productForm])` |
| Reset to literal | `ProductForm.jsx:51-61` | `setProductForm({...blank template...})` |

**No `setState` occurs during render.** The previous version contained

```js
// REMOVED — this no longer exists anywhere in src/
if (filterByCategory && !categories.includes(filterByCategory)) {
    clearFilterByCategory();
}
```

It was deleted in commit `777497a` and replaced by a message (§5.7).

**The mutation asymmetry in `ProductForm`.** The update path was rewritten to `.map()` with the old
`findIndex` + `splice` + spread version preserved as a comment (`ProductForm.jsx:35-38`, annotated
`"It is mutating the original state directly which violates the state immutability rule"`). The add
path still mutates the draft in place at `ProductForm.jsx:44` before appending.

## 4.8 Derived state (nothing stored)

| Derived value | Computation | Location |
|---|---|---|
| `selectedProduct` | `(selectedProductId) ? products.find(p => p.id === selectedProductId) : null` | `ProductsView.jsx:20-21` |
| `categories` | `Array.from(new Set(products.map(p => p.category)))` | `ProductsView.jsx:31` |
| `filteredProducts` | `filterProducts(products, category, searchValue)` | `ProductsView.jsx:33` |
| `validationError` | `validateProducts(products, filteredProducts, categories, category, searchValue)` | `ProductsView.jsx:35-41` |
| `errors` (form) | six field rules, inline | `ProductForm.jsx:11-21` |
| submit `disabled` | `errors.id \|\| errors.name \|\| … \|\| errors.stockQuantity` | `ProductForm.jsx:130-137` |
| button label | `productForm.isExists ? 'Update Product' : 'Add Product'` | `ProductForm.jsx:138` |
| ID lock | `readOnly={productForm.isExists}` | `ProductForm.jsx:72` |
| action bundle | `{ editProduct, deleteProduct }` | `useProductActions.js:17` |

**Computation order matters and is deliberate.** In the working tree the early return at
`ProductsView.jsx:23-28` precedes all three derivations, so when the details screen is showing,
`categories`, `filteredProducts`, and `validationError` are never computed at all.

---

# PART 5 — COMPONENT ARCHITECTURE

## 5.1 Render tree with ownership annotations

```
<App>                                          L2
│  owns: products, productForm
│  memoizes: productsContextValue, productFormContextValue
│  provides: ProductsContext, ProductFormContext
│  renders: no markup of its own
│
└─ <ProductsContext value={productsContextValue}>
   └─ <ProductFormContext value={productFormContextValue}>
      │
      ├─ <ProductForm />                      L6  [memo]
      │     reads: products, setProducts, productForm, setProductForm
      │     state: none · computes: errors
      │     functions: inputChangeHandler, productSubmitHandler, clearProductForm
      │     ├─ <InputField /> × 6             L8  props only, zero imports
      │     ├─ <button type="button">Reset</button>
      │     └─ <button type="submit" disabled={...}>Add|Update Product</button>
      │
      └─ <ProductsView />                     L5  (no props)
            reads: products                      (context)
            owns:  selectedProductId, searchValue, category
            derives: selectedProduct
            │
            ├─ if selectedProduct  ──────────── EARLY RETURN
            │     <ProductDetails product setSelectedProductId />   L6
            │        state: isDeleteBtnClicked (own)
            │        calls: useProductActions() → editProduct, deleteProduct
            │        root:  <div>
            │        └─ Back to Products · h2 · h3 · h4 · p · h5
            │              then Edit + Delete,  or  the confirm block
            │
            └─ else  ────────────────────────── LIST SCREEN
                  derives: categories          (ProductsView.jsx:31)
                           filteredProducts    (:33)  ← filterProducts()
                           validationError     (:35)  ← validateProducts()
                  <section>                    ← ProductsView's own root
                  ├─ <SearchBar searchValue setSearchValue />        L6
                  │     └─ <InputField />                            L8
                  ├─ <FilterByCategory categories category          L6
                  │                  setCategory />
                  │     ├─ <select> + <option value=''> + options
                  │     └─ <button>Clear Filter</button>
                  └─ <ProductsList products validationError         L6  [memo]
                  │               setSelectedProductId />
                  │     <section>
                  │     ├─ <h1>Products List</h1>
                  │     ├─ {validationError && <h3>{validationError}</h3>}
                  │     └─ {products.length > 0 &&
                  │            <ul>  <ProductCard … /> × N  </ul>}
                  └─ ProductCard × N            L6
                        state: isDeleteBtnClicked (own)
                        calls: useProductActions() → editProduct, deleteProduct
                        root:  <li>
                        └─ h2 · h3 · h4
                             then View + Edit + Delete,  or  the confirm block
```

Note the nesting: `ProductsView` renders a `<section>`, and `ProductsList` renders another
`<section>` inside it. On the details path only `ProductDetails`' `<div>` is rendered — no
`<section>`, no `<h1>`.

## 5.2 Component contracts

### `App` — `src/app/App.jsx` (66 lines, L2)

| Aspect | Detail |
|---|---|
| Props | none |
| Hooks | `useState` × 2 (`products`, `productForm`), `useMemo` × 2 |
| Context | provides both; reads neither |
| Derived | none |
| Children | `<ProductForm />` and `<ProductsView />`, both unconditional, no props |
| Own markup | none |
| **No longer owns** | `selectedProductId` — moved to `ProductsView` in commit `f77abe1` |

### `ProductsView` — `src/components/ProductsView.jsx` (63 lines, L5)

| Aspect | Detail |
|---|---|
| Props | **none** — it is the orchestrator, not a leaf |
| Hooks | `useState` × 3 (`selectedProductId`, `searchValue`, `category`), `useContext` × 1 |
| Reads context | `{ products }` |
| Own functions | none — handlers are declared inline and passed down |
| Derived | `selectedProduct`, `categories`, `filteredProducts`, `validationError` |
| Control flow | early `return <ProductDetails/>` at `:23-28`, then the list screen |
| Root element | `<section>` (list path only) |
| Children | `SearchBar`, `FilterByCategory`, `ProductsList`, `ProductDetails` |
| Imports | 8 — the highest fan-out in the codebase |
| Not memoised | takes no props and consumes context, so `memo` would be a no-op |
| Source comment | `:13` `// States which are living here for the persistence` |

### `ProductForm` — `src/components/ProductForm.jsx` (143 lines, L6) — **`memo`**

| Aspect | Detail |
|---|---|
| Props | none |
| Reads context | `{ products, setProducts }`, `{ productForm, setProductForm }` |
| Hooks | none of its own |
| Functions | `inputChangeHandler(e)`, `productSubmitHandler(e)`, `clearProductForm()` |
| Own data | `errors`, rebuilt inline every render |
| Root element | `<form onSubmit>` |
| Children | 6 × `<InputField>`, a Reset `<button type="button">`, a submit `<button>` |
| Notable | the only commented-out code block in `src/` (`:35-38`), recording the previous mutation-based update |

`clearProductForm()` (`:51-61`) is the single reset definition, called from two places: the end of
`productSubmitHandler` (`:48`) and the Reset button (`:126`). The Reset button is
`type="button"`, so it does not trigger form submission.

### `ProductsList` — `src/components/ProductsList.jsx` (24 lines, L6) — **`memo`**

| Aspect | Detail |
|---|---|
| Props | `{ products, validationError, setSelectedProductId }` |
| Reads context | **none** |
| Hooks | none |
| Own functions | none |
| Root element | `<section>` |
| Children | `<h1>`, optional `<h3>`, optional `<ul>` of `<ProductCard>` |
| Purpose | display only — renamed from `ProductList` in `2648c2a` and stripped to this job in `9a70b63` |
| What it no longer does | no search box, no category filter, no details switch, no context read, no state, no render-phase `setState` |

Two empty-state branches: it renders the `<h3>` when `validationError` is truthy, and the `<ul>`
only when `products.length > 0`. If both are false, it renders only the `<h1>`.

### `FilterByCategory` — `src/components/FilterByCategory.jsx` (20 lines, L6)

| Aspect | Detail |
|---|---|
| Props | `{ categories, category, setCategory }` |
| Reads context | none |
| Hooks | none |
| Own functions | `clearCategory()` → `setCategory('')` |
| Root element | `<div>` |
| Children | one controlled `<select>` and one `<button>Clear Filter</button>` |
| No imports | zero — the only *component* in the app with no imports at all |

Both controls are driven through props, so this is a fully controlled, stateless presentational
component.

### `ProductCard` — `src/components/ProductCard.jsx` (33 lines, L6)

| Aspect | Detail |
|---|---|
| Props | `{ product, setSelectedProductId }` |
| Reads context | **none** |
| Hooks | `useState` × 1 (`isDeleteBtnClicked`, `:7`) + `useProductActions()` |
| Own functions | none — `editProduct` / `deleteProduct` come from the hook |
| Root element | `<li>` |
| Destructures | `{ id, name, price, category }` — not `description`, not `stockQuantity` |
| Renders | `h2` name, `h3` ₹price, `h4` category; then confirm block **or** View + Edit + Delete |

The confirmation flag was moved back out of the hook and into this component in commit `f77abe1`.
Each card instance therefore owns an independent flag.

### `ProductDetails` — `src/components/ProductDetails.jsx` (34 lines, L6)

| Aspect | Detail |
|---|---|
| Props | `{ product, setSelectedProductId }` |
| Reads context | **none** |
| Hooks | `useState` × 1 (`isDeleteBtnClicked`, `:7`) + `useProductActions()` |
| Root element | **`<div>`** — changed from `<li>` because it is mounted by `ProductsView`, not inside a `<ul>` |
| Destructures | `{ id, name, price, category, description, stockQuantity }` — all six |
| Renders | Back button, `h2`, `h3`, `h4`, `p` description, `h5` stock; then confirm block **or** Edit + Delete |
| vs `ProductCard` | has the back button and two extra data rows; has no View button |

`ProductCard` and `ProductDetails` are near-mirrors: same hook usage, same confirmation ternary,
same `h2`/`h3`/`h4` block. They differ only in root element, header button, extra rows, and the
presence of View.

### `SearchBar` — `src/components/SearchBar.jsx` (20 lines, L6)

| Aspect | Detail |
|---|---|
| Props | `{ searchValue, setSearchValue }` |
| Reads context | none |
| Hooks | none |
| Functions | `searchInputHandler(e)` — reads `e.target.value`, calls `setSearchValue` |
| Root element | none — returns the `<InputField>` directly |
| Purpose | controlled-input adapter: DOM event → state update in `ProductsView` |

### `InputField` — `src/components/ui/InputField.jsx` (23 lines, L8)

| Aspect | Detail |
|---|---|
| Props | `{ label, type, id, name, value, placeholder, changeHandler, readOnly = false, errors }` |
| Imports | **none** |
| Hooks | none |
| Root element | `<div>` |
| Children | `<label htmlFor={id}>`, `<input>`, conditional `<p>` |
| Purpose | markup + accessibility wiring + error display; owns no validation logic |

## 5.3 `useProductActions` — `src/hooks/useProductActions.js` (20 lines, L4)

```js
import { useContext, useState } from "react";
import { ProductsContext } from "../context/ProductsContext.js";
import { ProductFormContext } from "../context/ProductFormContext.js";

function useProductActions() {
    const { setProducts } = useContext(ProductsContext);        // :6
    const { setProductForm } = useContext(ProductFormContext);  // :7

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));      // :10
    }

    function editProduct(product) {
        setProductForm(product);                                // :14
    }

    return { editProduct, deleteProduct };                      // :17
}

export default useProductActions;
```

| Property | Value |
|---|---|
| Consumers | `ProductCard.jsx:5`, `ProductDetails.jsx:5` |
| Owns state | **none** — the confirmation flag was moved out in `f77abe1` |
| Reads context | `setProducts`, `setProductForm` |
| Returns | `{ editProduct, deleteProduct }` |
| Effect | removes both context imports from its two consumer components |
| `useState` import at `:1` | present but unused — see §9.3 |

The hook's role narrowed across two commits: `83c2786` made it own the confirmation state, then
`f77abe1` moved that state back out and left it holding only the two context-backed actions.

## 5.4 Who consumes what

| Component | `ProductsContext` | `ProductFormContext` | Own `useState` | Props in |
|---|---|---|---|---|
| `App` | provides | provides | 2 | — |
| `ProductsView` | ✅ `products` | — | 3 | — |
| `ProductForm` | ✅ `products`, `setProducts` | ✅ `productForm`, `setProductForm` | — | — |
| `ProductsList` | — | — | — | 3 |
| `ProductCard` | — | — | 1 | 2 |
| `ProductDetails` | — | — | 1 | 2 |
| `FilterByCategory` | — | — | — | 3 |
| `SearchBar` | — | — | — | 2 |
| `InputField` | — | — | — | 8 |
| `useProductActions` | ✅ `setProducts` | ✅ `setProductForm` | — | — |

Six of the nine components consume no context at all. Only two read `ProductsContext`, and only one
of those (`ProductForm`) also reads `ProductFormContext`.

## 5.5 Screen responsibilities compared

|  | `ProductsList` (list screen) | `ProductDetails` (details screen) |
|---|---|---|
| Rendered by | `ProductsView.jsx:55-59` | `ProductsView.jsx:24-27` (early return) |
| Reachable when | `selectedProduct` falsy | `selectedProduct` truthy |
| Root element | `<section>` | `<div>` |
| Own heading | `<h1>Products List</h1>` | none — starts at `<h2>` |
| Header control | — | `<button>Back to Products</button>` |
| Search box | yes (sibling, in `ProductsView`) | no |
| Category filter | yes (sibling, in `ProductsView`) | no |
| Empty/stale message | `validationError` as `<h3>` | n/a |
| Product rows | 0..N `<ProductCard>` | itself, one product |
| Data rows shown | 3 (name, price, category) | 5 (+ description, stock) |
| View button | yes | no |
| Edit button | yes | yes |
| Delete button | yes | yes |
| Confirm block | yes | yes |
| Wrapped in a `<ul>` | yes | no |

## 5.6 The two-state screen switch

```js
const selectedProduct = (selectedProductId) ?
    products.find(p => p.id === selectedProductId) : null;      // ProductsView.jsx:20-21

if (selectedProduct) {
    return <ProductDetails
        product={selectedProduct}
        setSelectedProductId={setSelectedProductId}>
    </ProductDetails>;
}                                                                // :23-28
```

Three properties follow from this shape:

1. **The guard is a truthiness test on the resolved product, not on the id.** If the open product is
   deleted, `products.find` yields `undefined`, the early return is skipped, and control falls
   through to the list screen — no reset call, no cleanup effect.
2. **`ProductsView` stays mounted.** The three tier-2 states survive the transition, so search text
   and the category filter are preserved across a round trip to details and back.
3. **`selectedProductId` is not cleared when the open product is deleted.** It keeps pointing at a
   non-existent id; the guard makes it harmless because `find` returns `undefined`. The next
   `View Product` click overwrites it.

## 5.7 The message system that replaced the render-phase `setState`

```js
// src/utils/validateProducts.js
export default function validateProducts(products, filteredProducts, categories, category, searchValue) {
    if (products.length === 0)
        return 'No products available';

    else if (category && !categories.includes(category))
        return 'The selected filter is no longer valid, clear the filter';

    else if (filteredProducts.length === 0 && searchValue)
        return 'No products found for your search';

    return '';
}
```

Precedence is strict — `if / else if / else if / return ''`. The four outcomes:

| Priority | Condition | Message | Rendered as |
|---|---|---|---|
| 1 | no products at all | `No products available` | `<h3>` in `ProductsList` |
| 2 | category selected but absent from `categories` | `The selected filter is no longer valid, clear the filter` | `<h3>` |
| 3 | filters match nothing **and** a search is active | `No products found for your search` | `<h3>` |
| 4 | anything else | `''` (falsy) | nothing |

This replaces two things from the previous architecture:

- the render-phase `setState` that silently cleared a stale category filter, now reported to the
  user instead of auto-corrected;
- the hard-coded `<h3>No products found!</h3>`, now a message chosen by rule.

Because `categories` is derived from `products`, a selected category always has at least one product
while it still exists — so rule 3 is what fires when a search narrows a valid category to nothing,
and rule 2 is what fires when the category's last product was deleted. Rule 4's explicit
`return ''` is part of the current uncommitted work; without it the function would fall through to
`undefined`.

---

# PART 6 — EVENT & DATA FLOW ARCHITECTURE

## 6.1 Complete event map

| # | Origin UI | Handler | Location | State touched | Owner's tier |
|---|---|---|---|---|---|
| 1 | 6 form inputs | `inputChangeHandler` | `ProductForm.jsx:23` | `productForm[field]` | 1 |
| 2 | submit / Enter | `productSubmitHandler` | `ProductForm.jsx:31` | `products` + `productForm` (reset) | 1 |
| 3 | **Reset** `<button type="button">` | `clearProductForm()` | `ProductForm.jsx:126` | `productForm` | 1 |
| 4 | search input | `searchInputHandler` | `SearchBar.jsx:5` | `searchValue` | 2 |
| 5 | `<select>` | inline arrow | `FilterByCategory.jsx:10` | `category` | 2 |
| 6 | **Clear Filter** | `clearCategory()` | `FilterByCategory.jsx:16` | `category` | 2 |
| 7 | **View Product** | `setSelectedProductId(id)` | `ProductCard.jsx:25` | `selectedProductId` | 2 |
| 8 | **Back to Products** | `setSelectedProductId(null)` | `ProductDetails.jsx:12` | `selectedProductId` | 2 |
| 9 | Delete button | `setIsDeleteBtnClicked(true)` | `ProductCard.jsx:27` / `ProductDetails.jsx:28` | `isDeleteBtnClicked` | 3 |
| 10 | No button | `setIsDeleteBtnClicked(false)` | `ProductCard.jsx:20` / `ProductDetails.jsx:23` | `isDeleteBtnClicked` | 3 |
| 11 | Yes button | `deleteProduct(id)` | `ProductCard.jsx:19` / `ProductDetails.jsx:22` | `products` | 1 |
| 12 | Edit button | `editProduct(product)` | `ProductCard.jsx:26` / `ProductDetails.jsx:27` | `productForm` | 1 |

Twelve events. **There is no longer a thirteenth automatic one** — the render-phase state update is
gone.

No `onBlur`, `onKeyDown`, `onFocus`, `onMouse*`. No `stopPropagation`. No refs. The only
`preventDefault` is in `productSubmitHandler`. Events 9–12 each have two call sites (one per screen
component) but one implementation, supplied by `useProductActions`.

## 6.2 Sequence: add a product

```
User types "104" in Product ID
  └─ InputField onChange ─────────────► ProductForm.inputChangeHandler
       • type=='number' && value  →  value = Number(value)
       └─ setProductForm(prev => ({...prev, id: 104}))
            └─ App re-renders
                 ├─ productFormContextValue recomputed (deps changed)
                 ├─ productsContextValue keeps identity → ProductsView re-renders
                 │   (context changed) → ProductsList's memo compares props:
                 │   products/filteredProducts unchanged for the filter-free
                 │   portion, but `validationError` may change → re-renders if so
                 └─ ProductForm re-renders
                      • errors.id = '' → submit enabled

User clicks "Add Product"
  └─ onSubmit ────────────────────────► productSubmitHandler
       • e.preventDefault()
       • isExists === false → add path
       • productForm.isExists = true            (draft mutated in place)
       • setProducts([...products, productForm])
       • clearProductForm()                      ← shared reset function
            └─ App re-renders; both context values recomputed
                 ├─ ProductForm: fields empty, errors repopulated, label "Add Product"
                 ├─ ProductsView: categories, filteredProducts recomputed
                 └─ ProductsList re-renders (products identity changed)
                      • new <option> if the category is new
                      • an N+1th <ProductCard> mounts
```

## 6.3 Sequence: edit a product

```
User clicks "Edit" on the card for id 102
  └─ ProductCard.editProduct(product)     ← from useProductActions
       └─ setProductForm(the whole 102 object)
            └─ App re-renders → productFormContextValue changes
                 ├─ ProductForm: id=102, name='Mechanical Keyboard', price=2499 …
                 │    • id input readOnly (isExists true)
                 │    • duplicate-ID check skipped (!isExists guard)
                 │    • button label "Update Product"
                 └─ ProductsView re-renders (context changed)
                      • products unchanged → productsContextValue identity stable
                      • filter/search untouched → filteredProducts recomputed,
                        same content, new array identity
                      • ProductsList re-renders only if validationError changed

User edits Price to 1999 and submits
  └─ inputChangeHandler → setProductForm(prev => ({...prev, price: 1999}))
  └─ onSubmit
       • isExists === true → update path
       • setProducts(products.map(p => (p.id != productForm.id) ? p : productForm))
            ← replaces the matching element; no mutation, no findIndex, no splice
       • clearProductForm()
            └─ card 102 now shows ₹1999; form blank again
```

## 6.4 Sequence: delete a product from the list

```
User clicks "Delete" on card 3
  └─ setIsDeleteBtnClicked(true)         ← this card instance's own useState
       └─ only card 3 re-renders; its <li> content is replaced by the confirm block

User clicks "Yes"
  └─ deleteProduct(id)                   ← from useProductActions
       └─ setProducts(prev => prev.filter(p => p.id != id))
            └─ App re-renders → productsContextValue changes
                 ├─ ProductsView re-renders → categories, filteredProducts,
                 │   validationError all recomputed
                 ├─ ProductsList re-renders → card 3 unmounts
                 └─ if a category lost its last product:
                      • `categories` no longer contains it
                      • if it was the selected category → rule 2 fires →
                        "The selected filter is no longer valid, clear the filter"
                      • the category itself is NOT auto-cleared; the user must
                        click "Clear Filter" (event #6)
```

## 6.5 Sequence: delete a product from the details view

```
User clicks "View Product"
  └─ setSelectedProductId(id)
       └─ ProductsView re-renders
            ├─ selectedProduct = products.find(...) → truthy
            ├─ EARLY RETURN: SearchBar, FilterByCategory, ProductsList, and all
            │   ProductCards unmount
            ├─ ProductDetails mounts (its own isDeleteBtnClicked = false)
            └─ selectedProductId / searchValue / category PERSIST — they live
               in ProductsView, which never unmounted

User clicks Delete → Yes
  └─ deleteProduct(id) → setProducts(filter)
       └─ ProductsView re-renders
            ├─ selectedProduct = products.find(p => p.id === <deleted id>) → undefined
            ├─ early return is SKIPPED (guard is falsy)
            ├─ control falls through to the list screen
            ├─ search text and category filter are still intact
            └─ selectedProductId still holds the deleted id (stale but inert)

User clicks "Back to Products"
  └─ setSelectedProductId(null)
       └─ ProductsView re-renders → find is skipped → list screen
```

## 6.6 Re-render propagation

```
                       ┌────────────────────────────────────────┐
    products ─────────►│ App re-renders                          │
    productForm ──────►│  useMemo × 2 → identity changes only   │
                       │  for whichever state actually moved     │
                       └───────┬───────────────────┬─────────────┘
                               │                   │
                   productsContextValue   productFormContextValue
                        changed                  changed
                               │                   │
                               ▼                   ▼
                    ProductsView (context)   ProductForm [memo]
                               │                   │
          ┌────────────────────┼─────────────┐     ├─ InputField × 6
          ▼                    ▼             ▼     └─ Reset / submit buttons
     SearchBar         FilterByCategory  ProductsList [memo]
          │                    │             │
     InputField        select + button   ProductCard × N
                                                  │
                                     useState + useProductActions
```

**How `memo` + `useMemo` interact in the current shape:**

| Change | `ProductForm` | `ProductsView` | `ProductsList` | Why |
|---|---|---|---|---|
| Typing in a form field | re-renders | re-renders | **often skipped** | `productFormContextValue` changes → `ProductsView` re-renders because it consumes context; but `products` is unchanged, so `filteredProducts` and `validationError` are recomputed — a new array identity, so `memo` sees a changed `products` prop and re-renders anyway. `memo` helps only when the recomputation produces the same values but the props compare equal — with arrays they never do. |
| Submit (add/update) | re-renders | re-renders | re-renders | `products` changed |
| Delete | re-renders | re-renders | re-renders | `products` changed |
| Typing in search | **skipped** | re-renders | re-renders | `searchValue` is `ProductsView`'s own state; `App` is not involved, so no context value changes → `ProductForm`'s `memo` bails |
| Category change | **skipped** | re-renders | re-renders | same as search |
| View Product | re-renders | re-renders | **unmounts** | `ProductsView` early-returns; `ProductForm` re-renders because `ProductsView`'s context read invalidated it — no, `ProductsContext` did not change, but the context *object* was not replaced either. `ProductForm` re-renders only if `App` re-rendered, which it did not. So `ProductForm` is actually skipped here. |
| Delete-flag toggle in a card | skipped | skipped | skipped | purely local `useState` in that one card |

The `View Product` row is the notable one: because `selectedProductId` lives in `ProductsView` and
not in `App`, clicking View does **not** re-render `App`, does not touch either context value, and
leaves `ProductForm` alone. This is the practical payoff of moving the view state down one level.

---

# PART 7 — CROSS-CUTTING CONCERNS

## 7.1 Validation architecture

Two entirely separate validation systems coexist.

### Form validation — `ProductForm.jsx:11-21`

Per-field, message-or-empty, consumed by `InputField`.

| Field | Condition | Message | Empty-value behaviour |
|---|---|---|---|
| `id` | `!(Number(id))` | Product ID is required | `0` and `''` both fail |
| `id` | `!isExists && products.find(p => p.id == Number(id))` | Product with given ID already exists | add-mode only |
| `name` | `name.length < 3` | Product name is invalid | `''` fails |
| `price` | `!(Number(price))` | Product price should be greater than ₹0 | `0` and `''` both fail |
| `category` | `category.length < 3` | Product category is invalid | `''` fails |
| `description` | `description.length < 3` | Product description is invalid | `''` fails |
| `stockQuantity` | `!(Number(stockQuantity))` | Product stock should be greater than 0 | `0` and `''` both fail |

Enforcement is **preventive**: the submit button is `disabled` while any error is truthy
(`:130-137`), and the only guard inside `productSubmitHandler` is `e.preventDefault()` (`:32`). No
`noValidate`, no touched/dirty tracking, no submit-time validation — errors appear from the first
keystroke.

### List validation — `src/utils/validateProducts.js`

Whole-screen, message-or-empty, consumed by `ProductsList`. Covered in §5.7.

| System | Declared in | Unit of failure | Consumer | Rendering |
|---|---|---|---|---|
| Form | `ProductForm` | one field | `InputField` | `<p>` beside the input |
| List | `validateProducts()` | the screen | `ProductsList` | single `<h3>` under the heading |

`ProductForm` does not import `validateProducts`, and `ProductsView` does not import `errors`. The
two systems do not interact.

## 7.2 Identifier and coercion architecture

`id` is simultaneously a DOM input value, React state, and a business key. Three mechanisms bridge
those roles:

1. **Coercion on input** — `if (type == 'number' && value) value = Number(value)`
   (`ProductForm.jsx:25`).
2. **Normalisation before testing** — `Number(productForm.id | price | stockQuantity)` inside
   `errors` (`:12, 17, 20`), so `''` and `0` are both rejected.
3. **Loose comparison at lookup** — `==` / `!=` in `useProductActions.js:10`,
   `filterProducts.js:5`, `ProductForm.jsx:14, 40`. The one exception is the screen guard at
   `ProductsView.jsx:21`, which uses `===`.

**Key usage:** `key={product.id}` in `ProductsList.jsx:17`, `key={c}` for category options in
`FilterByCategory.jsx:13`. No key is needed for `ProductDetails` — single child.

## 7.3 Mode signalling

Five modes, all plain state — no router, no enum, no discriminant field:

| Mode | Signal | Location | Consequence |
|---|---|---|---|
| add | `productForm.isExists === false` | `App.jsx:38-46` default | ID editable, duplicate check active, label "Add Product" |
| edit | `productForm.isExists === true` | set by `editProduct` and on add | ID `readOnly`, duplicate check skipped, label "Update Product" |
| list | `selectedProduct` falsy | `ProductsView.jsx:20-21` | list screen renders |
| details | `selectedProduct` truthy | `ProductsView.jsx:23` | `ProductDetails` early-returns |
| idle / confirming delete | `isDeleteBtnClicked` false / true | `ProductCard.jsx:7` or `ProductDetails.jsx:7` | action buttons ↔ confirm block, independently per instance |

`isExists` is `true` in all three seed products, `false` in the blank template, and set to `true` on
the add path (`ProductForm.jsx:44`).

## 7.4 Presentation architecture

- `src/index.css` — 0 bytes, imported at `main.jsx:2`.
- `src/app/App.css` — 0 bytes, **never imported** by any module.
- No `className`, no inline `style`, no CSS modules, no framework anywhere in `src/`.
- Rendering is default browser styling over semantic HTML: `<section>` (×2 nested), `<form>`,
  `<ul>`/`<li>`, `<label>`, `<select>`/`<option>`, `<button>`, `<div>`, and an `h1`–`h5` ladder.
- Accessibility wiring that does exist: every input has a matching `id` and `<label htmlFor>`; error
  text is a sibling `<p>`; all controls are real `<button>`/`<select>`/`<input>` elements; the
  submit button declares `type="submit"` and the Reset button declares `type="button"`.

## 7.5 Edge-case handling

| Situation | Handling present in the code |
|---|---|
| No products at all | rule 1 → `No products available` |
| Stale category filter after delete | rule 2 → `The selected filter is no longer valid, clear the filter` (message, not auto-reset) |
| Search matches nothing | rule 3 → `No products found for your search` |
| Filter matches nothing without a search | rules 3 does not fire; the `<ul>` is suppressed by `products.length > 0` and the `<h3>` is suppressed by the falsy message, so only the `<h1>` renders |
| Native form navigation | `e.preventDefault()` (`ProductForm.jsx:32`) |
| Invalid submit | submit `disabled` while any `errors.*` is truthy |
| Duplicate product id | second `errors.id` rule, add-mode only |
| Open product gets deleted | `find` returns `undefined` → guard falsy → falls through to list (`ProductsView.jsx:20-23`) |
| Accidental Reset click | `clearProductForm()` empties the form; there is no confirmation prompt |
| Search/filter reset by opening details | **preserved** — the states live in `ProductsView`, which does not unmount |
| Zero-valued fields | `Number()`-based truthiness checks in `errors` |
| Missing `product` prop | `ProductsView` only renders `ProductDetails` after resolving it |

## 7.6 Deliberate absences

No `useEffect` anywhere. No `useReducer`/dispatch. No `useCallback`. No `useRef`. No `React.memo`
on leaf components. No context selectors. No router. No state library. No TypeScript or PropTypes.
No tests or test runner. No error boundary. No CSS. No persistence. No API layer. No barrel files.
No path aliases. No environment variables. No accessibility tooling. No bundle or performance
measurement.

---

# PART 8 — ARCHITECTURAL PATTERNS IN USE

| Pattern | Where | Expression of it here |
|---|---|---|
| Composition root | `main.jsx:4` | `createRoot(#root).render(<App />)` |
| State colocation | `ProductsView.jsx:14-16`, `ProductCard.jsx:7`, `ProductDetails.jsx:7` | view state next to the view, interaction state next to the control |
| Lift state up | `App.jsx:8, 38` | only the two records that need context |
| Lowest-common-ancestor ownership | `ProductsView.jsx:14` | the three view states sit at the lowest ancestor that serves both screens — lesson 1 |
| Context for shared state | `App.jsx:57-58` + 3/2 consumers | avoids threading products — lesson 3 |
| Prop drilling (one level) | `ProductsView` → `ProductsList`/`FilterByCategory`/`SearchBar`; `ProductsList` → `ProductCard` | stable setters and derived data passed as props |
| **Container / leaf split** | `ProductsView` (stateful container) vs `ProductsList`, `FilterByCategory`, `SearchBar`, `ProductDetails` (stateless or single-flag leaves) | the container owns state and composes; leaves render |
| **Early return guard** | `ProductsView.jsx:23-28` | resolves the selected product, returns it if present, otherwise falls through |
| Custom hook for shared behaviour | `hooks/useProductActions.js` | one definition of edit/delete used by two components |
| Hook without state | `useProductActions.js` | stateless after `f77abe1` — only context-backed actions |
| Presentational / container split | `InputField` vs `ProductForm`; `FilterByCategory` vs `ProductsView` | primitives know markup, containers know state |
| Controlled component | every input | `value` from state + supplied `onChange` |
| Controlled-input adapter | `SearchBar.jsx:5-8` | converts a DOM event into a state update |
| Derived state during render | `ProductsView.jsx:20, 31, 33, 35`; `ProductForm.jsx:11-21` | no state for anything computable — lesson 2 |
| **Pure function extraction** | `utils/filterProducts.js`, `utils/validateProducts.js` | component-free logic with no React import |
| Single handler for N fields | `ProductForm.jsx:23-29` | `e.target.name` + computed `[name]` key |
| Functional setState | `ProductForm.jsx:26`, `useProductActions.js:10` | `prev => next` where the result depends on prior state |
| Immutable replace-in-array | `ProductForm.jsx:39-41` | `.map()` swap instead of `findIndex` + `splice` + spread — lesson 4 |
| New reference on change | `ProductForm.jsx:45`, `useProductActions.js:10` | spread / filter always produce a fresh array |
| Commented-out code as a record | `ProductForm.jsx:35-38` | previous mutation-based approach kept with an inline note |
| Memoised context value | `App.jsx:48-54` | prevents needless consumer renders |
| Memoised component | `ProductForm.jsx:143`, `ProductsList.jsx:24` | `memo()` on the two feature components that can benefit |
| Extracted reset function | `ProductForm.jsx:51-61`, used at `:48` and `:126` | one definition, two callers — lesson 6 in spirit |
| Single responsibility | `ProductsList` (display), `FilterByCategory` (filter control), `SearchBar` (search control), `ProductCard` (row), `ProductDetails` (detail), `ProductsView` (orchestration) | one job each — lesson 6 |
| Early-exit validation | `validateProducts.js:2-11` | sequential `if / else if` returning at the first match |
| Two-step destructive confirm | `isDeleteBtnClicked` + confirm block in both screen components | local boolean swaps the button row for a prompt |
| Conditional rendering | `ProductsView.jsx:23`, `ProductsList.jsx:8, 12`, `ProductCard.jsx:16`, `ProductDetails.jsx:19` | ternary / `&&`, no library |
| List rendering with keys | `ProductsList.jsx:17`, `FilterByCategory.jsx:13` | `key={product.id}`, `key={c}` |
| Semantic HTML as structure | whole app | `form`/`ul`/`li`/`label`/`select`/`button`, h1–h5 |

---

# PART 9 — CODEBASE CONVENTIONS

## 9.1 Style

| Convention | Rule observed |
|---|---|
| Indentation | 4 spaces, uniformly |
| Quotes | double in `app/`, `components/`, `context/`, `hooks/`, `utils/`; single in `main.jsx`, `vite.config.js`, `eslint.config.js` |
| Semicolons | present everywhere except the two untouched scaffold config files |
| Component form | `function Name() { }` + hooks; no arrow components, no classes, no `React.FC` |
| Hook form | `function useThing() { }`, default export, hooks first |
| Module exports | components `export default` (two wrapped in `memo()`); contexts named `export const`; utils default-export the function |
| Export style | `ProductForm.jsx:143` and `ProductsList.jsx:24` export the `memo()` wrapper directly |
| Import extensions | always explicit (`.jsx`, `.js`) |
| Import ordering | react → context → hooks → components → utils |
| JSX children | explicit closing tags (`<InputField></InputField>`) |
| Boolean props | expressions, e.g. `readOnly={productForm.isExists}` |
| Props naming | camelCase; `errors` for the form error string, `validationError` for the list message, `changeHandler` for the callback |
| Handler naming | `inputChangeHandler`, `productSubmitHandler`, `searchInputHandler`, `clearCategory`, `clearProductForm`, `deleteProduct`, `editProduct` |
| Comparison | `==`/`!=` for ids except `ProductsView.jsx:21`; `===` for lengths |
| Comments | two: `ProductsView.jsx:13-17` (state-ownership note with a `---` divider), `ProductForm.jsx:35-38` (superseded approach) |
| Blank-line separators | `ProductsView.jsx:17` uses a `//---…---` line to close the state block |
| Docs | `README.md`, `LESSONS.md`, `PROJECT_ARCHITECTURE.md` |
| Lint rules | `js.recommended` + `react-hooks` recommended + `react-refresh` vite preset |

## 9.2 Naming: `ProductList` → `ProductsList`, plus `ProductsView`

Two renames landed in `2648c2a` and `9a70b63`:

- `ProductList.jsx` → `ProductsList.jsx`, function `ProductsList`, export `ProductsList`
- the container introduced in `f77abe1` was originally `ProductsLayout`, renamed to `ProductsView`
  in a later commit

The resulting convention is that anything prefixed `Product`/`Products` at the top of the view is a
screen-level component (`ProductsView`, `ProductsList`) and anything singular is an item-level
component (`ProductCard`, `ProductDetails`, `ProductForm`).

## 9.3 Lint status

`npm run lint` currently reports **1 error, 0 warnings**:

```
src/hooks/useProductActions.js
  1:22  error  'useState' is defined but never used  no-unused-vars
```

`useState` is imported at `useProductActions.js:1` but no longer used — the confirmation state was
moved out of the hook into `ProductCard` and `ProductDetails` in commit `f77abe1`. It is the only
lint error in the project.

---

# PART 10 — WHAT CHANGED SINCE THE PREVIOUS ARCHITECTURE REVISION

## 10.1 Commits covered

| Commit | Change |
|---|---|
| `2648c2a` | Renamed `ProductList.jsx` → `ProductsList.jsx`; updated this document; deleted `PROJECT_CONTEXT.md` |
| `f77abe1` | Created the `ProductsLayout` (later `ProductsView`) parent to hold `ProductsList`/`ProductDetails` state for persistence and to keep it off `App`; moved `isDeleteBtnClicked` out of the hook back into the two components |
| `777497a` | Added `validationError` to `ProductsList`; **removed the render-phase `setState`** for `filterByCategory` |
| `1a6b599` | Added the Reset button and extracted `clearProductForm()` |
| `9a70b63` | Stripped `ProductsList` to display-only |
| `743bc4f` | Extracted `filterProducts()` and `validateProducts()` into `src/utils/`; extracted `FilterByCategory` |
| *(uncommitted)* | Moved the three derivations after the early return; added `return ''` to `validateProducts`; reformatted the submit button |

## 10.2 Structural delta

| Aspect | Previous | Now |
|---|---|---|
| Source files | 12 | **15** (+`ProductsView`, +`FilterByCategory`, +2 utils, −`ProductList` renamed) |
| Source lines | 357 | **483** |
| Layers | 6 | **7** (+ pure-logic layer) |
| `App`'s `useState` count | 3 | **2** |
| Container | none — `App` was the screen switch | **`ProductsView`** |
| Components reading `ProductsContext` | 4 | 3 |
| Components reading `ProductFormContext` | 3 | 2 |
| Modules with zero imports | 1 | **4** (`FilterByCategory`, `InputField`, `filterProducts`, `validateProducts`) |
| Render-phase `setState` | present | **removed** |
| Root element of `ProductDetails` | `<li>` (orphan) | `<div>` |
| Confirmation state owner | `useProductActions` | `ProductCard` / `ProductDetails` |
| `useProductActions` return | 4 keys | **2 keys** |
| Search/filter survive details view | no | **yes** |
| Reset button | none | **yes** |
| Lint status | clean | **1 error** (unused `useState`) |

## 10.3 Behaviour deltas worth knowing

1. **`App` no longer re-renders on "View Product".** Because `selectedProductId` moved from `App`
   to `ProductsView`, opening the details screen touches no context value, so `ProductForm` is not
   re-rendered.
2. **Search text and category filter now survive a trip to the details view.** Previously
   `ProductList` unmounted when the ternary flipped and its state was discarded. Now the states live
   in `ProductsView`, which early-returns instead of unmounting.
3. **A stale category filter is reported, not silently corrected.** The auto-reset is gone; the user
   gets a message and must click "Clear Filter".
4. **`ProductDetails` is now valid HTML** — `<div>` instead of a `<li>` rendered outside a `<ul>`.
5. **The form can be cleared on demand** via Reset, without submitting.
6. **Filtering and validation are no longer part of any component**, so understanding them no longer
   requires reading React code.

## 10.4 Uncommitted differences (working tree vs `743bc4f`)

| File | Change |
|---|---|
| `src/components/ProductsView.jsx` | The three derivations (`categories`, `filteredProducts`, `validationError`) were moved from **before** the early return to **after** it, so they are skipped entirely on the details screen. The `validationError` call was also split across multiple lines. |
| `src/utils/validateProducts.js` | Added an explicit `return '';` at the end, so the function returns `''` rather than `undefined` when no rule matches. |
| `src/components/ProductForm.jsx` | Purely formatting: the submit button's closing `}` now sits on the same line as `disabled={`, and the label text is indented onto its own line. No behaviour change. |

---

# PART 11 — GROWTH SURFACE

| Requirement | Attachment point | Reuses |
|---|---|---|
| New product field | seed objects `App.jsx:9-36`; blank template `App.jsx:38-46` and `clearProductForm()` `ProductForm.jsx:51-61`; `errors` `ProductForm.jsx:11-21`; one `<InputField>` `ProductForm.jsx:65-124`; destructuring in **both** `ProductCard.jsx:9` and `ProductDetails.jsx:9` | `inputChangeHandler` is name-driven and needs no change; the `errors` → `disabled` chain |
| New list-level message | add a rule to `validateProducts.js` **before** the others, or after if it is lowest priority | `ProductsList.jsx:8` already renders whatever string arrives |
| A sixth filter dimension | `ProductsView` gets a new `useState`, passes it to a new step inside `filterProducts()` or as a new argument | the pure-function seam means the component only grows by one state + one prop |
| Sorting | `filterProducts()` — or a sibling `sortProducts()` in `utils/` | derived, so it composes with the existing chain |
| A third screen | a new `useState` in `ProductsView` + another early return, or a richer reducer over the screen identity | the early-return guard at `:23-28` |
| Persisting products | the three mutation sites: `ProductForm.jsx:39`, `:45`, `useProductActions.js:10` | `setProducts` is already exposed app-wide |
| Sharing the `h2`/`h3`/`h4` + confirm markup duplicated across `ProductCard` and `ProductDetails` | a new `ui/` primitive, following the `InputField` precedent | the L8 pattern already exists |
| Per-card edit instead of the global form | give the card its own draft `useState`; `ProductForm` stays for add | `setProductForm` is reachable from `useProductActions` |
| Shared field validation rules | new module imported by `ProductForm.jsx:11-21` | `InputField` already accepts any error string |
| Unit tests | `src/utils/*.js` are importable with no React and no DOM | they are the only code that already supports this |
| Any styling | `src/index.css`, and/or import the currently orphaned `src/app/App.css` | semantic structure is already in place |

---

# PART 12 — QUICK REFERENCE

**Runtime flow:** `index.html` → `src/main.jsx:4` → `createRoot().render(<App />)` → `App` declares
`products` and `productForm`, memoizes both context values, provides both contexts → renders
`<ProductForm />` then `<ProductsView />` → `ProductsView` owns three view states; if
`selectedProduct` resolves it early-returns `<ProductDetails />`, otherwise it derives
`categories` / `filteredProducts` / `validationError` through `src/utils/` and renders
`<SearchBar />`, `<FilterByCategory />`, `<ProductsList />` → `ProductsList` renders `<ProductCard
/> × N` → `ProductCard` and `ProductDetails` both call `useProductActions()`.

**State locations:** `products` `App.jsx:8` · `productForm` `App.jsx:38` · `selectedProductId`
`ProductsView.jsx:14` · `searchValue` `ProductsView.jsx:15` · `category` `ProductsView.jsx:16` ·
`isDeleteBtnClicked` `ProductCard.jsx:7` and `ProductDetails.jsx:7`.

**Contexts:** `ProductsContext` = `createContext([])`, provided `App.jsx:57`, memoized `App.jsx:48-50`
· `ProductFormContext` = `createContext({})`, provided `App.jsx:58`, memoized `App.jsx:52-54`.

**Hook:** `useProductActions` returns `{ editProduct, deleteProduct }`; used by `ProductCard.jsx:5`
and `ProductDetails.jsx:5`.

**Screen switch:** early return at `ProductsView.jsx:23-28`, guarded by
`selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null` at
`:20-21`.

**Modes:** add vs edit ← `productForm.isExists` · list vs details ← truthiness of `selectedProduct` ·
idle vs confirming delete ← `isDeleteBtnClicked` in each component.

**Validation:** form rules `ProductForm.jsx:11-21` → `InputField.jsx:19` → `disabled`
`ProductForm.jsx:130-137` · list rules `src/utils/validateProducts.js` → `<h3>`
`ProductsList.jsx:8`.

**Filtering:** `src/utils/filterProducts.js` — category filter, then name search, both optional.

**Render control:** `useMemo` at `App.jsx:48` and `:52`; `memo()` at `ProductForm.jsx:143` and
`ProductsList.jsx:24`.

**Commands:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.

**Docs:** `README.md` (overview and build log) · `LESSONS.md` (6 lessons) ·
`PROJECT_ARCHITECTURE.md` (this file).