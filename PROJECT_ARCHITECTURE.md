# Product Management App — Complete Architecture

> A detailed, descriptive map of the codebase as it currently stands: what each layer is, how they
> connect, what every module owns, how data and events travel, and where each architectural decision
> is realised in the source. Descriptive only — this document records what the code is and does.
>
> Scope note: this reflects the post-refactor architecture. Four refactors landed after the first
> working version, and they changed the shape of the app significantly:
>
> | Commit                | Refactor                                                                             | Structural effect                                                          |
> | --------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
> | `b923e1c`             | Split `ProductCard` into `ProductCard` + `ProductDetails`; added `useProductActions` | two responsibilities became two components; duplicated logic became a hook |
> | `83c2786`             | Moved delete-confirmation state into `useProductActions`                             | hook became the single owner of all three concerns                         |
> | `b4ea4ba`             | Added `memo()` and `useMemo`                                                         | render-control layer added at 4 sites                                      |
> | `b923e1c` + `b4ea4ba` | Lifted `selectedProductId` to `App`; view switch moved to `App`                      | screen switching became the root's job                                     |
>
> `LESSONS.md` records the reasoning behind these decisions and is quoted in §13.

---

# PART 1 — SYSTEM OVERVIEW

## 1.1 What kind of system this is

A **single-page, client-only, in-memory CRUD application**. One HTML document, one React root, no
router, no server, no persistence. All state lives in `useState` hooks for the duration of the page
session and is discarded on reload.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             BROWSER (runtime)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ <div id="root">                            index.html:11           │  │
│  │  └─ <App />                                 main.jsx:5              │  │
│  │      │                                     createRoot().render()   │  │
│  │      ├─ useState × 3:  products, productForm, selectedProductId    │  │
│  │      ├─ derived: selectedProduct = products.find(id === selId)     │  │
│  │      ├─ useMemo × 2:  productsContextValue, productFormContextValue│  │
│  │      │                                                             │  │
│  │      └─ <ProductsContext value={productsContextValue}>              │  │
│  │          └─ <ProductFormContext value={productFormContextValue}>    │  │
│  │              ├─ <ProductForm />            [memo]                  │  │
│  │              │   └─ <InputField /> × 6                             │  │
│  │              │                                                       │  │
│  │              └─ {selectedProduct ?                                   │  │
│  │                    <ProductDetails product setSelectedProductId /> │  │
│  │                  : <ProductsList setSelectedProductId />            │  │
│  │                      ├─ <SearchBar /> → <InputField />            │  │
│  │                      ├─ <select> + <Clear Filter>                  │  │
│  │                      └─ <ul>                                        │  │
│  │                          └─ <ProductCard /> × N                     │  │
│  │                                └─ useProductActions()  (per card)   │  │
│  │                  }                                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Storage: none. No localStorage, no API, no cookies.                     │
└──────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Architectural style

A **top-down, single-source-of-truth, hook-and-context hybrid**:

* **One root owns all shared state.** `App` holds `products`, `productForm`, and
  `selectedProductId`. Nothing else keeps a second copy.
* **Context distributes data; props distribute intent.** State that *many* unrelated components need
  travels through context. The *navigation intent* (`setSelectedProductId`) travels as a prop because
  it belongs to `App` and only the two screens need it.
* **Custom hooks encapsulate behaviour + its local state.** `useProductActions` bundles two action
  functions and the confirmation flag they depend on, so the two consumer components stay presentational.
* **Derived state is computed, never stored.** `selectedProduct`, `categories`, `filteredProducts`,
  and `errors` are all expressions evaluated during render.
* **One responsibility per component.** After the refactor, no component serves two screens.
* **Render control is explicit.** `memo()` on two feature components, `useMemo` on both context
  values — the first time this codebase has optimised its render path.

## 1.3 Architectural invariants

1. **`App` is the only owner of shared state.** All three shared hooks are declared at `App.jsx:10,
   40, 50`.
2. **State flows down; setters flow up** — through context value or through props.
3. **Every input is controlled.** Every `<input>` gets `value` from a prop and reports changes via
   a supplied `onChange`. There is no uncontrolled input in `src/`.
4. **The DOM is a function of state.** Same state ⇒ identical markup. The single exception is the
   render-phase `setState` in `ProductList.jsx:24-26` (§5.6).
5. **`id` is the business key**; **`isExists`** distinguishes "new draft" from "already stored";
   **`selectedProductId`** selects the screen.
6. **Layers only depend downward or sideways-to-lower.** `ui/` depends on nothing; `hooks/` depends
   on `context/`; `components/` depends on `ui/`, `hooks/`, and `context/`; `app/` depends on
   `components/` and `context/`. Nothing depends upward. `app/App.css` is unreferenced.

---

# PART 2 — LAYERED STRUCTURE

## 2.1 The six layers

```
┌────────────────────────────────────────────────────────────────────────┐
│ L0  HOST / BUILD        index.html · vite.config.js · package.json      │
│                         eslint.config.js · .gitignore                  │
│                         → supplies #root, JSX transform, dev server    │
├────────────────────────────────────────────────────────────────────────┤
│ L1  ENTRY                src/main.jsx                (4 lines)          │
│                         → createRoot(#root).render(<App />)            │
├────────────────────────────────────────────────────────────────────────┤
│ L2  COMPOSITION ROOT     src/app/App.jsx            (73 lines)         │
│                         → owns 3 shared states, derives 1, memoizes 2  │
│                           context values, switches the screen          │
├────────────────────────────────────────────────────────────────────────┤
│ L3  STATE REGISTRY       src/context/*.js           (2 + 2 lines)       │
│                         → createContext() only. No provider component. │
├────────────────────────────────────────────────────────────────────────┤
│ L4  BEHAVIOUR HOOKS      src/hooks/*.js             (16 lines)          │
│                         → useProductActions: reusable state + actions  │
├────────────────────────────────────────────────────────────────────────┤
│ L5  FEATURE COMPONENTS   ProductForm · ProductList ·                     │
│                         ProductCard · ProductDetails · SearchBar        │
│                         (120+52+25+27+16 = 240 lines)                   │
│                         → screens, validation, filtering, events        │
├────────────────────────────────────────────────────────────────────────┤
│ L6  UI PRIMITIVES        src/components/ui/InputField.jsx  (20 lines)  │
│                         → zero imports; markup + a11y + error slot     │
└────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Layer contracts

| Layer        | Files                                                                      | May import        | Must not import | Knows about         |
| ------------ | -------------------------------------------------------------------------- | ----------------- | --------------- | ------------------- |
| L0 Host      | `index.html`, `vite.config.js`, `eslint.config.js`, `package.json`         | —                 | app internals   | only `#root`        |
| L1 Entry     | `main.jsx`                                                                 | L0, L2            | L3–L6           | `App` only          |
| L2 Root      | `app/App.jsx`                                                              | react, L3, L5     | L4, L6          | all shared state    |
| L3 Registry  | `context/ProductsContext.js`, `context/ProductFormContext.js`              | react             | everything      | nothing             |
| L4 Hooks     | `hooks/useProductActions.js`                                               | react, L3         | L2, L5, L6      | both contexts       |
| L5 Features  | `ProductForm`, `ProductList`, `ProductCard`, `ProductDetails`, `SearchBar` | react, L3, L4, L6 | L2, peers       | context + own props |
| L6 Primitive | `ui/InputField.jsx`                                                        | **nothing**       | everything      | its own props       |

`src/index.css` is imported at L1 and is 0 bytes. `src/app/App.css` is 0 bytes and **never imported
by any module**.

## 2.3 How the hook layer changed the graph

`useProductActions` is the only member of L4, and it exists because two L5 components needed the same
three things. Before the refactor, `deleteProduct`, `editProduct`, `isDeleteBtnClicked`, and
`setIsDeleteBtnClicked` were declared twice — once in `ProductCard`, once in the details view. The
hook turned four duplicated declarations into one.

```
ProductCard ────┐
                ├──► useProductActions()  ──► ProductsContext   (setProducts)
ProductDetails ─┘        │                └─► ProductFormContext (setProductForm)
                         │
                         └──► useState(false)  ← one INDEPENDENT instance per caller
```

Because `useState` lives inside the hook body, **each calling component gets its own
`isDeleteBtnClicked`**. Card 1 and card 2 never share a confirmation state, and the details view has
its own separate from all of them. That independence is a direct consequence of the hook being called
once per component instance rather than once centrally.

---

# PART 3 — MODULE INVENTORY

## 3.1 File table

| File                                | Lines | Layer | Role                                     | Imports | Exported                   |
| ----------------------------------- | ----: | ----- | ---------------------------------------- | ------: | -------------------------- |
| `index.html`                        |    15 | L0    | HTML host, provides mount node           |       — | —                          |
| `vite.config.js`                    |     7 | L0    | React plugin, nothing else               |       2 | default config             |
| `eslint.config.js`                  |    20 | L0    | Flat lint rules                          |       5 | default config             |
| `package.json`                      |    27 | L0    | Deps + 4 scripts                         |       — | —                          |
| `.gitignore`                        |    22 | L0    | Vite/Node/editor ignores                 |       — | —                          |
| `README.md`                         |    90 | doc   | Project intro, run steps, day-by-day log |       — | —                          |
| `LESSONS.md`                        |    12 | doc   | 6 architecture lessons learnt            |       — | —                          |
| `PROJECT_ARCHITECTURE.md`           |  this | doc   | This document                            |       — | —                          |
| `src/main.jsx`                      |     4 | L1    | Root mount                               |       3 | —                          |
| `src/index.css`                     |     0 | L1    | Imported, empty                          |       — | —                          |
| `src/app/App.jsx`                   |    73 | L2    | State hub, provider host, screen switch  |       6 | default `App`              |
| `src/app/App.css`                   |     0 | —     | orphan, never imported                   |       0 | —                          |
| `src/context/ProductsContext.js`    |     2 | L3    | products registry                        |       1 | named `ProductsContext`    |
| `src/context/ProductFormContext.js` |     2 | L3    | form-draft registry                      |       1 | named `ProductFormContext` |
| `src/hooks/useProductActions.js`    |    16 | L4    | Reusable product actions + confirm state |       3 | default hook               |
| `src/components/ProductForm.jsx`    |   120 | L5    | Add/update + validation · **`memo`**     |       4 | `memo(ProductForm)`        |
| `src/components/ProductList.jsx`    |    52 | L5    | Search, filter, card list · **`memo`**   |       4 | `memo(ProductsList)`       |
| `src/components/ProductCard.jsx`    |    25 | L5    | One product as a list row                |       1 | default                    |
| `src/components/ProductDetails.jsx` |    27 | L5    | One product as a full details view       |       1 | default                    |
| `src/components/SearchBar.jsx`      |    16 | L5    | Search input adapter                     |       1 | default                    |
| `src/components/ui/InputField.jsx`  |    20 | L6    | Labelled input primitive                 |   **0** | default                    |

**Total application code: 357 lines across 12 files** (was 384 across 8 before the refactor — net
−27 lines while gaining a whole layer, a new screen component, render optimisation, and a docs file).

`public/` holds `day-1.png` … `day-7.png`, progress screenshots referenced by `README.md`.

## 3.2 Complete import graph (23 import statements)

```
main.jsx
 ├─ react-dom/client
 ├─ ./index.css
 └─ app/App.jsx
      ├─ react                                    (useMemo, useState)
      ├─ context/ProductsContext.js               named
      ├─ context/ProductFormContext.js            named
      ├─ components/ProductList.jsx               default
      ├─ components/ProductForm.jsx               default
      └─ components/ProductDetails.jsx           default

components/ProductForm.jsx
 ├─ react                                        (memo, useContext)
 ├─ context/ProductsContext.js
 ├─ context/ProductFormContext.js
 └─ components/ui/InputField.jsx                 default

components/ProductList.jsx
 ├─ react                                        (memo, useContext, useState)
 ├─ context/ProductsContext.js
 ├─ components/ProductCard.jsx
 └─ components/SearchBar.jsx

components/SearchBar.jsx
 └─ components/ui/InputField.jsx

components/ProductCard.jsx
 └─ hooks/useProductActions.js                    default

components/ProductDetails.jsx
 └─ hooks/useProductActions.js                    default

hooks/useProductActions.js
 ├─ react                                        (useContext, useState)
 ├─ context/ProductsContext.js
 └─ context/ProductFormContext.js

components/ui/InputField.jsx   → NO IMPORTS AT ALL

context/*.js                   → react only
```

**No cycles. No barrel files. No aliases. No dynamic imports.** Every import spells its extension.
`InputField` remains the only zero-dependency module.

## 3.3 Fan-in / fan-out

| Module               | Out | In | Note                                                     |
| -------------------- | --: | -: | -------------------------------------------------------- |
| `InputField`         |   0 |  2 | leaf, most reused                                        |
| `ProductsContext`    |   1 |  4 | `App`, `ProductForm`, `ProductList`, `useProductActions` |
| `ProductFormContext` |   1 |  3 | `App`, `ProductForm`, `useProductActions`                |
| `useProductActions`  |   3 |  2 | `ProductCard`, `ProductDetails` — the only shared hook   |
| `SearchBar`          |   1 |  1 | single consumer                                          |
| `ProductCard`        |   1 |  1 | one call site, `.map()`                                  |
| `ProductDetails`     |   1 |  1 | one call site, in `App`'s ternary                        |
| `ProductForm`        |   4 |  1 | `App`, always mounted                                    |
| `ProductList`        |   4 |  1 | `App`, conditional                                       |
| `App`                |   6 |  1 | `main.jsx`                                               |

Compared to the pre-refactor graph: context fan-in dropped from 4→4 and 3→3 (the hook now consumes
both, while `ProductList` and `ProductCard` no longer do), and `ProductCard`'s fan-out fell from 3 to 1.

---

# PART 4 — STATE ARCHITECTURE

## 4.1 Four tiers of state

```
TIER 1 — GLOBAL / SHARED   (declared once in App, published via context)
├── products[]             product records
└── productForm{}          shared draft / edit target

TIER 2 — ROOT-LOCAL SHARED (declared in App, passed down as props, NOT via context)
└── selectedProductId      which product's details are open (null = none)

TIER 3 — CONTAINER-LOCAL  (declared in a feature component)
├── searchValue            ProductsList
└── filterByCategory       ProductsList

TIER 4 — INSTANCE-LOCAL   (one independent copy per calling component instance)
└── isDeleteBtnClicked     created inside useProductActions()
                           → one per ProductCard, one per ProductDetails
```

**Tier 2 is new.** Before the refactor `selectedProductId` lived in `ProductList`, which meant the
details view had to be rendered *by* `ProductList` and the card had to look the product up itself.
Lifting it to `App` created a third ownership tier: global enough that `App` needs it to choose the
screen, narrow enough that it is not worth a context.

## 4.2 Where each state lives and why

| State                | Declared                 | Type             | Read by                                            | Written by                                    | Tier |
| -------------------- | ------------------------ | ---------------- | -------------------------------------------------- | --------------------------------------------- | ---- |
| `products`           | `App.jsx:10`             | `Array<Object>`  | `ProductForm`, `ProductsList`, `useProductActions` | `ProductForm`, `useProductActions`            | 1    |
| `productForm`        | `App.jsx:40`             | `Object`         | `ProductForm`                                      | `ProductForm`, `useProductActions`            | 1    |
| `selectedProductId`  | `App.jsx:50`             | `Number \| null` | `App`                                              | `ProductCard`, `ProductDetails`, `App` (init) | 2    |
| `searchValue`        | `ProductList.jsx:9`      | `string`         | `ProductsList`, `SearchBar`                        | `SearchBar` (via prop)                        | 3    |
| `filterByCategory`   | `ProductList.jsx:10`     | `string`         | `ProductsList`                                     | `ProductsList` `<select>` + self-heal         | 3    |
| `isDeleteBtnClicked` | `useProductActions.js:6` | `boolean`        | calling component                                  | calling component                             | 4    |

### The `selectedProductId` sentinel

`useState(null)` — not `0` as before. Both `id` values and `null` are falsy-safe, and `null` states
the intent ("no product selected") without implying a numeric domain. `ProductDetails.jsx:9` resets
with `setSelectedProductId(null)`.

## 4.3 Context contracts

Both contexts are created with a fallback and provided as JSX tags (React 19 shorthand) rather than
`.Provider`.

**`ProductsContext`** — `src/context/ProductsContext.js` (2 lines)

|             |                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Created as  | `createContext([])`                                                                                                                    |
| Provided by | `App.jsx:63` with `value={productsContextValue}`                                                                                       |
| Value shape | `{ products, setProducts }`                                                                                                            |
| Memoised?   | yes — `useMemo(..., [products])` at `App.jsx:54-56`                                                                                    |
| Consumers   | `ProductForm.jsx:7`, `ProductList.jsx:7`, `useProductActions.js:8`                                                                     |
| Mutated by  | add `setProducts([...products, productForm])`; update `setProducts(products.map(...))`; delete `setProducts(prev => prev.filter(...))` |

**`ProductFormContext`** — `src/context/ProductFormContext.js` (2 lines)

|             |                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Created as  | `createContext({})`                                                                                                          |
| Provided by | `App.jsx:64` with `value={productFormContextValue}`                                                                          |
| Value shape | `{ productForm, setProductForm }`                                                                                            |
| Memoised?   | yes — `useMemo(..., [productForm])` at `App.jsx:58-60`                                                                       |
| Consumers   | `ProductForm.jsx:9`, `useProductActions.js:9`                                                                                |
| Mutated by  | field update `setProductForm(prev => ({...prev, [name]: value}))`; edit load `setProductForm(product)`; reset blank template |

### What the context consumer list shows

| Context              | Before refactor                                    | Now                                                      |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| `ProductsContext`    | `App`, `ProductForm`, `ProductList`, `ProductCard` | `App`, `ProductForm`, `ProductList`, `useProductActions` |
| `ProductFormContext` | `App`, `ProductForm`, `ProductCard`                | `App`, `ProductForm`, `useProductActions`                |

`ProductCard` no longer touches context. It receives `product` and `setSelectedProductId` as props and
gets its edit/delete behaviour from the hook, so it is now a **pure presentational component** — the
first one in the codebase apart from `InputField` and `SearchBar`.

## 4.4 The `useMemo` render-control layer

```js
const productsContextValue = useMemo(() => {
    return { products, setProducts };
}, [products]);                                    // App.jsx:54-56

const productFormContextValue = useMemo(() => {
    return { productForm, setProductForm };
}, [productForm]);                                 // App.jsx:58-60
```

**What it prevents:** before this, both values were inline object literals, so *every* render of `App`
produced two brand-new context objects, which made every consumer re-render unconditionally. Now the
object identity only changes when the corresponding state actually changes.

**Why the dependency arrays are correct:** `useState` setters are guaranteed stable by React, so
`setProducts` and `setProductForm` are omitted from the deps without losing correctness — including
them would be harmless but redundant.

**Residual behaviour worth noting:** the two contexts are independent, so a keystroke in the form
changes only `productFormContextValue`; `productsContextValue` keeps its identity, and consumers of
only `ProductsContext` skip the re-render. That is what makes the next section's `memo()` calls pay
off.

## 4.5 The `memo()` render-control layer

| Component        | Wrapped? | Where                   | Why it works here                                                                                        |
| ---------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `ProductForm`    | yes      | `ProductForm.jsx:136`   | takes **no props**, so `memo` can bail out whenever neither context value changed identity               |
| `ProductsList`   | yes      | `ProductList.jsx:68`    | its only prop `setSelectedProductId` is a stable setter, so it bails out when only `productForm` changed |
| `ProductCard`    | **no**   | `ProductCard.jsx:30`    | not wrapped; re-renders whenever `ProductsList` renders                                                  |
| `ProductDetails` | **no**   | `ProductDetails.jsx:31` | not wrapped                                                                                              |
| `SearchBar`      | **no**   | `SearchBar.jsx:20`      | not wrapped                                                                                              |
| `InputField`     | **no**   | `InputField.jsx:23`     | not wrapped; re-renders with its form parent                                                             |

Both wrapped components consume context, so `memo` **cannot** stop them re-rendering when their own
context value changes — context propagation always wins. What `memo` buys them is protection against
re-renders caused by the *other* context and by `App`'s own renders. This is exactly why the two
mechanisms had to be introduced together: `useMemo` on the context values is what gives `memo` on the
components something to compare.

## 4.6 Update mechanisms in use

| Mechanism                         | Location                                                                                                                                                                                                      | Shape                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Direct value                      | `setSelectedProductId(id)` (`ProductCard.jsx:22`), `setSelectedProductId(null)` (`ProductDetails.jsx:9`), `setIsDeleteBtnClicked(true/false)`, `setFilterByCategory(e.target.value)`, `setSearchValue(value)` | `setX(newValue)`                                                             |
| Functional updater (object)       | `ProductForm.jsx:24-26`                                                                                                                                                                                       | `setProductForm(prev => ({ ...prev, [name]: value }))`                       |
| Functional updater (array)        | `useProductActions.js:12`                                                                                                                                                                                     | `setProducts(prev => prev.filter(p => p.id != id))`                          |
| **Immutable map-replace**         | `ProductForm.jsx:37-39`                                                                                                                                                                                       | `setProducts(products.map(p => p.id != productForm.id ? p : productForm))`   |
| In-place mutation + new reference | `ProductForm.jsx:42-43`                                                                                                                                                                                       | `productForm.isExists = true` then `setProducts([...products, productForm])` |
| Reset to literal                  | `ProductForm.jsx:47-55`                                                                                                                                                                                       | `setProductForm({...blank template...})`                                     |
| Set-during-render                 | `ProductList.jsx:24-26`                                                                                                                                                                                       | clears `filterByCategory` when the category no longer exists                 |

### The update path was rewritten

The old update path mutated the state array directly:

```js
// ProductForm.jsx:33-36 — kept as a commented record of the previous approach
/* It is mutating the original state directly which violates the state immutability rule*/
// const index = products.findIndex((p) => p.id == productForm.id);
// products.splice(index, 1, productForm);
// setProducts([...products]);
```

It is replaced by a single `.map()` that returns each product unchanged except the matching one.
This is the fourth entry in `LESSONS.md` ("When the reference state like array or object is modified
then the new reference has to be passed to setter Fn") applied retroactively — the code now produces
a new array without ever mutating the old one, and the old three-step mutation-plus-spread dance is
gone.

Note that the **add path still mutates** the draft (`productForm.isExists = true` at
`ProductForm.jsx:42`), and the **delete path** is already functional-updater based.

## 4.7 Derived state (nothing stored)

| Derived value      | Computation                                                                 | Location                  |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| `selectedProduct`  | `products.find(p => p.id === selectedProductId)`                            | `App.jsx:52`              |
| `categories`       | `Array.from(new Set(products.map(p => p.category)))`                        | `ProductList.jsx:17`      |
| `filteredProducts` | `products` → optional category filter → optional name search                | `ProductList.jsx:29-36`   |
| `errors`           | six field rules, evaluated inline                                           | `ProductForm.jsx:11-19`   |
| submit `disabled`  | `errors.id \|\| errors.name \|\| … \|\| errors.stockQuantity`               | `ProductForm.jsx:123-130` |
| button label       | `productForm.isExists ? 'Update Product' : 'Add Product'`                   | `ProductForm.jsx:131`     |
| ID lock            | `readOnly={productForm.isExists}`                                           | `ProductForm.jsx:67`      |
| screen choice      | `selectedProduct ? <ProductDetails/> : <ProductsList/>`                     | `App.jsx:67-75`           |
| empty state        | `filteredProducts.length === 0` / `> 0`                                     | `ProductList.jsx:53, 58`  |
| action bundle      | `{ editProduct, deleteProduct, isDeleteBtnClicked, setIsDeleteBtnClicked }` | `useProductActions.js:19` |

## 4.8 The screen switch is now derived state

```js
const [selectedProductId, setSelectedProductId] = useState(null);   // App.jsx:50
const selectedProduct = products.find(p => p.id === selectedProductId);   // App.jsx:52
...
{ selectedProduct ? <ProductDetails product={selectedProduct} … />
                  : <ProductsList setSelectedProductId={setSelectedProductId} /> }   // App.jsx:67-75
```

Three consequences fall out of this shape:

1. **The switch is driven by data, not a raw id.** The ternary tests the *found product*, not the
   id. If the open product is deleted, `products.find` returns `undefined`, the ternary falls to the
   falsy branch, and the app returns to the list with no extra code.
2. **Lookup moved out of the component.** `ProductDetails` receives the resolved object as a prop, so
   it contains no `find`, no `null` default, and no early return. It went from the compound
   dual-role component to the simplest component in the tree.
3. **Strict `===` here.** `App.jsx:52` is the only ID comparison in the codebase using `===`;
   everywhere else (`useProductActions.js:12`, `ProductList.jsx:32`, `ProductForm.jsx:13, 38`) uses
   `==`/`!=`.

## 4.9 State transition table

| Trigger                             | State change                                 | Re-render scope (after refactor)                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Any form field changes              | `productForm.<field>`                        | `ProductFormContext` value changes → `ProductForm` + `useProductActions` consumers re-render. `ProductsList` is protected by `memo` (its `productsContextValue` identity is unchanged and `setSelectedProductId` is stable) |
| "Add Product"                       | `products` grows; `productForm` resets       | both context values change → `ProductForm` and `ProductsList` re-render; cards mount                                                                                                                                        |
| "Update Product"                    | `products[i]` replaced; `productForm` resets | same                                                                                                                                                                                                                        |
| "Delete"                            | `isDeleteBtnClicked → true` (that instance)  | one card only                                                                                                                                                                                                               |
| "No"                                | `isDeleteBtnClicked → false`                 | one card only                                                                                                                                                                                                               |
| "Yes"                               | `products` shrinks                           | both contexts' consumers re-render; card unmounts; categories may shrink; **if the deleted product was open, `selectedProduct` becomes undefined and the screen switches back to the list**                                 |
| Search keystroke                    | `searchValue`                                | `ProductsList` subtree only — `App` is not involved                                                                                                                                                                         |
| Category picked                     | `filterByCategory`                           | `ProductsList` subtree only                                                                                                                                                                                                 |
| "Clear Filter"                      | `filterByCategory → ''`                      | `ProductsList` subtree                                                                                                                                                                                                      |
| Category disappears from `products` | `filterByCategory → ''` (render phase)       | one extra `ProductsList` render                                                                                                                                                                                             |
| "View Product"                      | `selectedProductId → id`                     | `App` re-renders; whole `<ul>` unmounts; `ProductDetails` mounts                                                                                                                                                            |
| "Back to Products"                  | `selectedProductId → null`                   | `App` re-renders; `ProductDetails` unmounts; list mounts with search/filter state intact                                                                                                                                    |

---

# PART 5 — COMPONENT ARCHITECTURE

## 5.1 Render tree with ownership annotations

```
<App>                                          L2
│  owns: products, productForm, selectedProductId
│  derives: selectedProduct
│  memoizes: productsContextValue, productFormContextValue
│
└─ <ProductsContext value={productsContextValue}>
   └─ <ProductFormContext value={productFormContextValue}>
      │
      ├─ <ProductForm />                      L5  [memo]  own state: none
      │      consumes: products, setProducts, productForm, setProductForm
      │      calls:      useProductActions — NO (it does not; see §5.4)
      │      computes:   errors, disabled, buttonLabel
      │      └── <InputField /> × 6           L6  props only, zero deps
      │
      └─ { selectedProduct ? … : … }           ternary in App.jsx:67
         │
         ├── TRUTHY ── <ProductDetails product setSelectedProductId />   L5
         │      consumes: props only
         │      calls:    useProductActions() → own isDeleteBtnClicked
         │      renders:  <li> back button, h2/h3/h4, p description, h5 stock,
         │                then Edit + Delete, or the confirm block
         │
         └── FALSY ── <ProductsList setSelectedProductId />   L5  [memo]
                owns:  searchValue, filterByCategory
                consumes: products
                computes: categories, filteredProducts
                │
                ├─ <h1>Products List</h1>
                ├─ <SearchBar searchValue setSearchValue />     L5
                │     └── <InputField />                          L6
                ├─ <select value={filterByCategory}>  + <option value=''>
                ├─ <button>Clear Filter</button>
                ├─ {empty && <h3>No products found!</h3>}
                └─ <ul>
                      └── <ProductCard product setSelectedProductId />  L5  × N
                            calls: useProductActions() → own isDeleteBtnClicked
                            renders: <li> h2/h3/h4, then View + Edit + Delete,
                                     or the confirm block
```

`App` renders **no markup of its own** beyond the providers and the ternary — no headings, no
wrappers. The `<h1>` for each screen lives inside its screen component (`ProductList.jsx:39`;
`ProductDetails` has none and relies on its own heading hierarchy starting at `h2`).

## 5.2 Component contracts

### `App` — `src/app/App.jsx` (73 lines, L2)

| Aspect        | Detail                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- |
| Props         | none                                                                                    |
| Hooks         | `useState` × 3 (`products`, `productForm`, `selectedProductId`), `useMemo` × 2          |
| Reads context | none — it *provides* both                                                               |
| Provides      | `ProductsContext` (`:63`), `ProductFormContext` (`:64`)                                 |
| Derived       | `selectedProduct` (`:52`)                                                               |
| Children      | `<ProductForm />` always; then exactly one of `<ProductDetails />` / `<ProductsList />` |
| Own markup    | none                                                                                    |

### `ProductsList` — `src/components/ProductList.jsx` (52 lines, L5) — **`memo`**

| Aspect            | Detail                                                           |
| ----------------- | ---------------------------------------------------------------- |
| Props             | `{ setSelectedProductId }` — one prop, a stable setter           |
| Reads context     | `{ products }`                                                   |
| Hooks             | `useState` × 2                                                   |
| Own functions     | `clearFilterByCategory()`                                        |
| Root element      | `<section>`                                                      |
| Children          | `<SearchBar>`, `<select>`, 2 `<button>`s, `0..N` `<ProductCard>` |
| Own markup        | `<h1>Products List</h1>`                                         |
| No longer owns    | `selectedProductId` — **moved to `App`**                         |
| No longer renders | the details branch — **moved to `App`**                          |

### `ProductForm` — `src/components/ProductForm.jsx` (120 lines, L5) — **`memo`**

| Aspect        | Detail                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Props         | none                                                                                                   |
| Reads context | `{ products, setProducts }`, `{ productForm, setProductForm }`                                         |
| Hooks         | none of its own                                                                                        |
| Own functions | `inputChangeHandler(e)`, `productSubmitHandler(e)`                                                     |
| Own data      | `errors`, recomputed inline every render                                                               |
| Root element  | `<form onSubmit>`                                                                                      |
| Children      | 6 × `<InputField>`, 1 submit `<button>`                                                                |
| Contains      | the only commented-out code block in `src/` (`:33-36`), documenting the previous mutation-based update |

### `ProductCard` — `src/components/ProductCard.jsx` (25 lines, L5)

| Aspect        | Detail                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| Props         | `{ product, setSelectedProductId }` — no defaults, no optional props                  |
| Reads context | **none**                                                                              |
| Hooks         | `useProductActions()` (which internally calls `useState` + two `useContext`)          |
| Own functions | none — `editProduct` / `deleteProduct` come from the hook                             |
| Root element  | `<li>`                                                                                |
| Destructures  | `{ id, name, price, category }` — **not** `description`, **not** `stockQuantity`      |
| Renders       | `h2` name, `h3` ₹price, `h4` category; then confirm block **or** View + Edit + Delete |
| Purpose       | a single row in the list, nothing more                                                |

### `ProductDetails` — `src/components/ProductDetails.jsx` (27 lines, L5)

| Aspect                      | Detail                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Props                       | `{ product, setSelectedProductId }`                                                                                      |
| Reads context               | **none**                                                                                                                 |
| Hooks                       | `useProductActions()`                                                                                                    |
| Own functions               | none                                                                                                                     |
| Root element                | `<li>`                                                                                                                   |
| Destructures                | `{ id, name, price, category, description, stockQuantity }` — all six                                                    |
| Renders                     | Back button, `h2` name, `h3` ₹price, `h4` category, `p` description, `h5` stock; then confirm block **or** Edit + Delete |
| Difference vs `ProductCard` | has the back button and the two extra data rows; has **no** "View Product" button                                        |
| Structural note             | renders an `<li>` but is mounted by `App`, not inside a `<ul>`                                                           |

`ProductCard` and `ProductDetails` are now near-mirror images: identical hook usage, identical
confirm-vs-actions ternary, identical `h2`/`h3`/`h4` block. They differ only in the header button,
the two extra rows, and the absence of the View button. That residual similarity is what the two
components were split to expose — each is now short enough that the duplication is legible rather
than hidden.

### `SearchBar` — `src/components/SearchBar.jsx` (16 lines, L5)

| Aspect        | Detail                                             |
| ------------- | -------------------------------------------------- |
| Props         | `{ searchValue, setSearchValue }`                  |
| Reads context | none                                               |
| Hooks         | none                                               |
| Own functions | `searchInputHandler(e)`                            |
| Root element  | none — returns the `<InputField>` directly         |
| Purpose       | controlled-input adapter: DOM event → state update |

### `InputField` — `src/components/ui/InputField.jsx` (20 lines, L6)

| Aspect       | Detail                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| Props        | `{ label, type, id, name, value, placeholder, changeHandler, readOnly = false, errors }` |
| Imports      | **none**                                                                                 |
| Hooks        | none                                                                                     |
| Root element | `<div>`                                                                                  |
| Children     | `<label htmlFor={id}>`, `<input>`, conditional `<p>`                                     |
| Purpose      | markup + accessibility wiring + error display; owns no validation logic                  |

## 5.3 `useProductActions` — `src/hooks/useProductActions.js` (16 lines, L4)

```js
function useProductActions() {
    const [isDeleteBtnClicked, setIsDeleteBtnClicked] = useState(false);       // :6

    const { setProducts } = useContext(ProductsContext);                        // :8
    const { setProductForm } = useContext(ProductFormContext);                  // :9

    function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id != id));                     // :12
    }

    function editProduct(product) {
        setProductForm(product);                                               // :16
    }

    return { editProduct, deleteProduct, isDeleteBtnClicked, setIsDeleteBtnClicked };  // :19
}

export default useProductActions;
```

| Property                           | Value                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Consumers                          | `ProductCard.jsx:4`, `ProductDetails.jsx:4`                                          |
| State it owns                      | `isDeleteBtnClicked` — **one independent instance per caller**                       |
| Context it reads                   | `setProducts` (from `ProductsContext`), `setProductForm` (from `ProductFormContext`) |
| Actions it exposes                 | `deleteProduct(id)`, `editProduct(product)`                                          |
| Returns                            | `{ editProduct, deleteProduct, isDeleteBtnClicked, setIsDeleteBtnClicked }`          |
| Rules of hooks                     | two hooks, called unconditionally at the top — legal in both consumers               |
| Returns a fresh object each render | not memoised, so a consumer re-renders whenever the hook runs                        |

The hook is the reason both consumer components are 25–27 lines with zero context imports. It also
changes *where* the context dependency lives: `ProductCard` no longer subscribes to either context,
so it only re-renders because its parent `ProductsList` renders.

## 5.4 What each component does and does not consume

| Component           | `ProductsContext`           | `ProductFormContext`              | Own `useState` | Props in                          |
| ------------------- | --------------------------- | --------------------------------- | -------------- | --------------------------------- |
| `App`               | provides                    | provides                          | 3              | —                                 |
| `ProductForm`       | ✅ `products`, `setProducts` | ✅ `productForm`, `setProductForm` | —              | —                                 |
| `ProductsList`      | ✅ `products`                | —                                 | 2              | `setSelectedProductId`            |
| `ProductCard`       | —                           | —                                 | via hook       | `product`, `setSelectedProductId` |
| `ProductDetails`    | —                           | —                                 | via hook       | `product`, `setSelectedProductId` |
| `SearchBar`         | —                           | —                                 | —              | `searchValue`, `setSearchValue`   |
| `InputField`        | —                           | —                                 | —              | 8 props                           |
| `useProductActions` | ✅ `setProducts`             | ✅ `setProductForm`                | 1              | —                                 |

## 5.5 Screen responsibilities compared

|                       | `ProductsList`             | `ProductDetails`                    |
| --------------------- | -------------------------- | ----------------------------------- |
| Rendered when         | `selectedProduct` is falsy | `selectedProduct` is truthy         |
| Rendered by           | `App.jsx:73-75`            | `App.jsx:68-71`                     |
| Root element          | `<section>`                | `<li>`                              |
| Own heading           | `<h1>Products List</h1>`   | none — starts at `<h2>`             |
| Header control        | —                          | `<button>Back to Products</button>` |
| Search box            | yes                        | no                                  |
| Category filter       | yes                        | no                                  |
| Empty state           | `No products found!`       | n/a                                 |
| Product rows          | `N` cards                  | itself, 1                           |
| Data-row count        | 3 (name, price, category)  | 5 (+ description, stock)            |
| View button           | yes                        | no                                  |
| Edit button           | yes                        | yes                                 |
| Delete button         | yes                        | yes                                 |
| Confirm block         | yes                        | yes                                 |
| Sibling "list" markup | `<ul>` wrapper present     | none                                |

## 5.6 Render-phase work in `ProductsList`

```js
const categories = Array.from(new Set(products.map(p => p.category)));        // :17

if (filterByCategory && !categories.includes(filterByCategory)) {              // :24-26
    clearFilterByCategory();
}
```

The comment at `:19-23` states the purpose: when the last product of the active category is deleted,
the dropdown no longer offers that category while `filterByCategory` still holds it, so the filter
resets on the next render. The same function also serves the "Clear Filter" button. This is the one
place in the codebase where a setter is called during the render phase rather than from an event.

---

# PART 6 — EVENT & DATA FLOW ARCHITECTURE

## 6.1 Complete event map

| #  | Origin UI                | Handler                               | Location                                       | State touched                | Downstream effect                                                   |
| -- | ------------------------ | ------------------------------------- | ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| 1  | 6 form inputs            | `inputChangeHandler`                  | `ProductForm.jsx:21`                           | `productForm[field]`         | `errors` recompute, submit enable/disable, ID lock                  |
| 2  | submit / Enter           | `productSubmitHandler`                | `ProductForm.jsx:29`                           | `products`, `productForm`    | list grows or updates; form clears                                  |
| 3  | "Edit" (card or details) | `editProduct` → `useProductActions`   | `ProductCard.jsx:23` / `ProductDetails.jsx:24` | `productForm` (whole object) | form enters update mode                                             |
| 4  | "Delete"                 | `setIsDeleteBtnClicked(true)`         | `ProductCard.jsx:24` / `ProductDetails.jsx:25` | `isDeleteBtnClicked`         | row becomes a confirm prompt                                        |
| 5  | "No"                     | `setIsDeleteBtnClicked(false)`        | `ProductCard.jsx:17` / `ProductDetails.jsx:20` | `isDeleteBtnClicked`         | row returns to normal                                               |
| 6  | "Yes"                    | `deleteProduct` → `useProductActions` | `ProductCard.jsx:16` / `ProductDetails.jsx:19` | `products`                   | item disappears; if it was the open one, screen returns to the list |
| 7  | "View Product"           | `setSelectedProductId(id)`            | `ProductCard.jsx:22`                           | `selectedProductId`          | list → details, whole `<ul>` unmounts                               |
| 8  | "Back to Products"       | `setSelectedProductId(null)`          | `ProductDetails.jsx:9`                         | `selectedProductId`          | details → list                                                      |
| 9  | search input             | `searchInputHandler`                  | `SearchBar.jsx:5`                              | `searchValue`                | list re-filters                                                     |
| 10 | `<select>`               | inline arrow                          | `ProductList.jsx:43`                           | `filterByCategory`           | list re-filters                                                     |
| 11 | "Clear Filter"           | `clearFilterByCategory`               | `ProductList.jsx:13`                           | `filterByCategory`           | filter removed                                                      |
| 12 | (automatic)              | render-phase check                    | `ProductList.jsx:24`                           | `filterByCategory`           | stale filter cleared                                                |

Twelve distinct events. No `onBlur`, `onKeyDown`, `onFocus`, `onMouse*`, no `stopPropagation`, no
refs, no `preventDefault` outside the submit handler. Events 3–6 each have **two** implementation
sites — one per screen component — but only one implementation each, inside the hook.

## 6.2 Sequence: add a product

```
User types "104" in Product ID
  └─ InputField onChange ─────────────► ProductForm.inputChangeHandler
       • type=='number' && value  →  value = Number(value)
       └─ setProductForm(prev => ({...prev, id: 104}))
            └─ App re-renders
                 ├─ productFormContextValue recomputed (deps changed)
                 ├─ productsContextValue keeps identity → ProductsList's memo bails out
                 ├─ ProductForm re-renders (new context value)
                 │    • errors.id = '' (no duplicate, isExists false)
                 │    • submit button enabled
                 └─ useProductActions consumers re-render (they read ProductFormContext,
                      though they destructure only setProductForm)

User clicks "Add Product"
  └─ form onSubmit ──────────────────► ProductForm.productSubmitHandler
       • e.preventDefault()
       • isExists === false → add path
       • productForm.isExists = true            (draft object mutated in place)
       • setProducts([...products, productForm])
       • setProductForm({ id:0, name:'', price:0, category:'', description:'',
                         stockQuantity:0, isExists:false })
            └─ App re-renders
                 ├─ both context values recomputed
                 ├─ ProductForm: fields empty, errors populated, button disabled,
                 │   label back to "Add Product"
                 └─ ProductsList re-renders (memo cannot help: context changed)
                      • categories recomputed — a new category adds an <option>
                      • an N+1th <ProductCard> mounts
```

## 6.3 Sequence: edit a product

```
User clicks "Edit" on the card for id 102
  └─ ProductCard.editProduct(product)          ← from useProductActions
       └─ setProductForm(the whole 102 object) ← context write from a leaf
            └─ App re-renders
                 ├─ ProductForm: id=102, name='Mechanical Keyboard', price=2499, …
                 │    • id input readOnly (isExists true)
                 │    • duplicate-ID check skipped (!isExists guard)
                 │    • button label "Update Product"
                 └─ ProductsList: memo bails out — productsContextValue unchanged,
                    setSelectedProductId identity unchanged. No visible change.

User edits Price to 1999 and submits
  └─ inputChangeHandler → setProductForm(prev => ({...prev, price: 1999}))
  └─ onSubmit
       • isExists === true → update path
       • setProducts(products.map(p => (p.id != productForm.id) ? p : productForm))
            ← replaces the matching element; no mutation, no findIndex, no splice
       • setProductForm(blank template)
            └─ App re-renders; productsContextValue changes → ProductsList re-renders
               → card 102 shows ₹1999; form is blank again
```

## 6.4 Sequence: delete a product

```
User clicks "Delete" on card 3
  └─ setIsDeleteBtnClicked(true)      ← this card instance's own hook state
       └─ only card 3 re-renders; its <li> content is replaced by the confirm block
          ("Are you sure to delete?" / Yes / No)

User clicks "Yes"
  └─ deleteProduct(id)
       └─ setProducts(prev => prev.filter(p => p.id != id))
            └─ App re-renders
                 ├─ productsContextValue recomputed
                 ├─ ProductForm re-renders (duplicate check now sees fewer ids)
                 ├─ card 3 unmounts
                 ├─ ProductsList recomputes categories
                 └─ if that category has no products left, the render-phase check at
                    :24 clears filterByCategory → one further ProductsList render
```

**Same flow while the details view is open** — because the screen is derived from
`selectedProduct`, deleting the open product makes `products.find` return `undefined`, so `App`'s
ternary falls through to `ProductsList` automatically. No reset call, no cleanup effect.

## 6.5 Sequence: view details and go back

```
User clicks "View Product" on a card
  └─ setSelectedProductId(id)                  ← App's state, passed down as a prop
       └─ App re-renders
            ├─ selectedProduct = products.find(p => p.id === id)   ← derived
            ├─ ternary picks the truthy branch
            ├─ <ProductsList> unmounts entirely — the whole <ul> and all N cards go
            │   (searchValue and filterByCategory are lost with it)
            └─ <ProductDetails product={selectedProduct} /> mounts
                 • its own useProductActions() → fresh isDeleteBtnClicked = false
                 • renders Back, name, price, category, description, stock
                 • Edit + Delete, no View button

User clicks "Back to Products"
  └─ setSelectedProductId(null)
       └─ App re-renders
            ├─ products.find(...) → undefined → falsy branch
            ├─ <ProductDetails> unmounts
            └─ <ProductsList> mounts fresh — search box empty, filter cleared
```

Because `App` switches between the two screens, **the list's local state does not survive a trip to
the details view.** Previously `ProductList` rendered both branches internally, so `searchValue` and
`filterByCategory` persisted across the switch; now `ProductList` unmounts and its state is
discarded.

## 6.6 Re-render propagation

```
                     ┌──────────────────────────────────────────┐
   products ────────►│ App re-render (only if products or        │
   productForm ─────►│ selectedProductId changed, OR a context  │
   selectedProductId►│ consumer forces it)                      │
                     │                                          │
                     │ useMemo × 2 → identity changes only for  │
                     │ whichever state actually moved            │
                     └────┬──────────────────────────────┬───────┘
                          │                              │
              productsContextValue          productFormContextValue
                    changed                        changed
                          │                              │
                          ▼                              ▼
                  ProductsList [memo]            ProductForm [memo]
                          │                              │
          ┌───────────────┼──────────┐            ┌──────┴──────┐
          ▼               ▼          ▼            ▼             ▼
      SearchBar        <select>  ProductCard×N  InputField    useProductActions
                                                  ×6          (via ProductCard/Details)
```

**How `memo` + `useMemo` interact here:**

| Change                     | `ProductForm` | `ProductsList` | Why                                                                                                                                        |
| -------------------------- | ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Typing in the form         | re-renders    | **skipped**    | `productFormContextValue` changed; `productsContextValue` did not, and `setSelectedProductId` is stable → `memo` bails                     |
| Submit (add/update)        | re-renders    | re-renders     | `products` changed → `productsContextValue` changed → context propagation overrides `memo`                                                 |
| Delete                     | re-renders    | re-renders     | same reason                                                                                                                                |
| Typing in the search box   | **skipped**   | re-renders     | `searchValue` is local to `ProductsList`; `App` is not involved at all                                                                     |
| Clicking "View Product"    | re-renders    | unmounts       | `selectedProductId` changed → `App` re-renders → new context objects → `ProductForm` re-renders even though nothing about the form changed |
| Clicking a card's "Delete" | re-renders    | re-renders     | local `useState` inside the hook re-renders that card; its parent does not                                                                 |

---

# PART 7 — CROSS-CUTTING CONCERNS

## 7.1 Validation architecture

Validation lives in the consumer; the primitive only displays.

```
ProductForm.jsx:11-19   errors = { id, name, price, category, description, stockQuantity }
                              │
        ┌─────────────────────┼──────────────────────────────┐
        ▼                     ▼                              ▼
  InputField errors   <button disabled={                  errors also gate
  prop → renders      errors.id || … || errors.stockQuantity}>  the button label
  <p>{errors}</p>                                         and the readOnly flag
```

| Field           | Condition                                             | Message                                 | Empty-value behaviour  |
| --------------- | ----------------------------------------------------- | --------------------------------------- | ---------------------- |
| `id`            | `!(Number(id))`                                       | Product ID is required                  | `0` and `''` both fail |
| `id`            | `!isExists && products.find(p => p.id == Number(id))` | Product with given ID already exists    | add-mode only          |
| `name`          | `name.length < 3`                                     | Product name is invalid                 | `''` fails             |
| `price`         | `!(Number(price))`                                    | Product price should be greater than ₹0 | `0` and `''` both fail |
| `category`      | `category.length < 3`                                 | Product category is invalid             | `''` fails             |
| `description`   | `description.length < 3`                              | Product description is invalid          | `''` fails             |
| `stockQuantity` | `!(Number(stockQuantity))`                            | Product stock should be greater than 0  | `0` and `''` both fail |

Enforcement is **preventive**: the submit button is `disabled` while any error is truthy, and the only
guard in `productSubmitHandler` is `e.preventDefault()`. No validation runs at submit time, no
`noValidate`, no error summary, no per-field touched/dirty tracking — errors show from the first
keystroke.

`errors` is a plain object rebuilt on every render; it is never stored in state, which is the second
item in `LESSONS.md` applied.

## 7.2 Identifier and coercion architecture

`id` is simultaneously a DOM input value, a React state value, and a business key. Three mechanisms
bridge those roles:

1. **Coercion on input** — `if (type == 'number' && value) value = Number(value)`
   (`ProductForm.jsx:23`). Numeric fields store numbers, except the transient empty string a number
   input emits mid-edit.
2. **Normalisation before testing** — `Number(productForm.id | price | stockQuantity)` inside
   `errors` (`:12, 15, 18`), so `''` and `0` are both rejected.
3. **Loose comparison at lookup** — `==` / `!=` in `useProductActions.js:12`,
   `ProductList.jsx:32`, `ProductForm.jsx:13, 38`, so a string `'101'` still matches the number `101`.
   The one exception is the screen switch at `App.jsx:52`, which uses `===`.

**Key usage:** `key={product.id}` in the card list (`ProductList.jsx:61`), `key={c}` for category
options (`:46`). `ProductDetails` has no key — single child.

## 7.3 Mode signalling

Four modes, all expressed as plain state — no router, no enum, no discriminant:

| Mode                     | Signal                            | Location                        | Consequence                                                    |
| ------------------------ | --------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| add                      | `productForm.isExists === false`  | `App.jsx:40-48` default         | ID editable, duplicate check active, label "Add Product"       |
| edit                     | `productForm.isExists === true`   | set in `editProduct` and on add | ID `readOnly`, duplicate check skipped, label "Update Product" |
| list                     | `selectedProduct` falsy           | `App.jsx:52`                    | `ProductsList` renders                                         |
| details                  | `selectedProduct` truthy          | `App.jsx:52`                    | `ProductDetails` renders                                       |
| idle / confirming delete | `isDeleteBtnClicked` false / true | `useProductActions.js:6`        | action buttons ↔ confirm block, independently per instance     |

`isExists` is `true` in all three seed products, `false` in the blank template, and set to `true` on
the add path (`ProductForm.jsx:42`).

## 7.4 Presentation architecture

* `src/index.css` — 0 bytes, imported at `main.jsx:2`.
* `src/app/App.css` — 0 bytes, **never imported**.
* No class names, no inline `style`, no CSS modules, no framework, no `className` attribute anywhere
  in `src/`.
* Rendering is default browser styling over semantic HTML: `<section>` (list), `<form>`, `<ul>`/`<li>`,
  `<label>`, `<select>`/`<option>`, `<button>`, and an `h1`–`h5` ladder.
* Accessibility wiring that does exist: every input has a matching `id` and `<label htmlFor>`; error
  text is a sibling `<p>`; all controls are real `<button>`/`<select>`/`<input>` elements; the submit
  button declares `type="submit"`.

## 7.5 Edge-case handling

| Situation                              | Handling present in the code                                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Empty search result                    | `filteredProducts.length === 0 && <h3>No products found!</h3>` (`ProductList.jsx:53`)                                       |
| Native form navigation                 | `e.preventDefault()` (`ProductForm.jsx:30`)                                                                                 |
| Invalid submit                         | submit button `disabled` while any `errors.*` is truthy                                                                     |
| Duplicate product id                   | second `errors.id` rule, add-mode only                                                                                      |
| Stale category filter after delete     | render-phase `!categories.includes(...)` check (`ProductList.jsx:24`)                                                       |
| **Open product gets deleted**          | `products.find` returns `undefined` → `App`'s ternary falls through to the list (`App.jsx:52, 67`)                          |
| Search/filter reset by opening details | `ProductsList` unmounts, discarding its local state                                                                         |
| Zero-valued fields                     | `Number()`-based truthiness checks in `errors`                                                                              |
| Type coercion on numeric input         | `Number(value)` in `inputChangeHandler`                                                                                     |
| Missing `product` prop                 | no longer applicable — both screen components require it, and `App` only renders `ProductDetails` when the product resolved |

## 7.6 Deliberate absences

No `useEffect` anywhere. No `useReducer`/dispatch. No `useCallback`. No `useRef`. No
`React.memo` on the leaf components. No context selectors or multiple contexts per concern. No router.
No state library. No TypeScript or PropTypes. No tests or test runner. No error boundary. No CSS. No
persistence. No API layer. No barrel files. No path aliases. No environment variables. No
accessibility audit tooling. No bundle or performance measurement.

---

# PART 8 — ARCHITECTURAL PATTERNS IN USE

| Pattern                          | Where                                                                                                            | Expression of it here                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Composition root                 | `main.jsx:4`                                                                                                     | `createRoot(#root).render(<App />)`                                                                                                 |
| State colocation                 | `ProductsList.jsx:9-10`, `useProductActions.js:6`                                                                | view and interaction state kept next to the view                                                                                    |
| Lift state up                    | `App.jsx:10, 40, 50`                                                                                             | three shared values hoisted to the root                                                                                             |
| Lowest-common-ancestor ownership | `App.jsx:50`                                                                                                     | `selectedProductId` sits at the root because the root is the lowest ancestor that can serve both screens — lesson 1 of `LESSONS.md` |
| Context for shared state         | `App.jsx:63-64` + 3 consumers                                                                                    | avoids threading products through three levels — lesson 3                                                                           |
| Custom hook for shared behaviour | `hooks/useProductActions.js`                                                                                     | one definition of edit/delete/confirm, used by two components                                                                       |
| Hook-owned local state           | `useProductActions.js:6`                                                                                         | the confirmation flag lives with the actions that consume it, not in the components                                                 |
| Prop drilling (one level)        | `App` → both screens; `ProductsList` → `SearchBar`, `ProductCard`                                                | stable setters and screen-local data passed as props                                                                                |
| Context-as-provider (React 19)   | `App.jsx:63-64`                                                                                                  | `<Context value={…}>` instead of `.Provider`                                                                                        |
| Controlled component             | every input                                                                                                      | `value` from state + supplied `onChange`                                                                                            |
| Derived state during render      | `App.jsx:52`, `ProductList.jsx:17, 29-36`, `ProductForm.jsx:11-19`                                               | no state for anything computable — lesson 2                                                                                         |
| **Derived screen selection**     | `App.jsx:52, 67-75`                                                                                              | the ternary tests the resolved product, not the id, so deletion self-heals                                                          |
| Single handler for N fields      | `ProductForm.jsx:21-27`                                                                                          | `e.target.name` + computed `[name]` key                                                                                             |
| Functional setState              | `ProductForm.jsx:24`, `useProductActions.js:12`                                                                  | `prev => next` where the result depends on prior state                                                                              |
| Immutable replace-in-array       | `ProductForm.jsx:37-39`                                                                                          | `.map()` swap instead of `findIndex` + `splice` + spread — lesson 4                                                                 |
| New reference on change          | `ProductForm.jsx:43`, `useProductActions.js:12`                                                                  | spread / filter always produce a fresh array for React to see                                                                       |
| Memoised context value           | `App.jsx:54-60`                                                                                                  | prevents needless consumer renders and needless object allocation                                                                   |
| Memoised component               | `ProductForm.jsx:136`, `ProductList.jsx:68`                                                                      | `memo()` on the two heaviest feature components                                                                                     |
| Single responsibility            | `ProductCard`, `ProductDetails`                                                                                  | one screen each; no prop-switching dual mode — lesson 6                                                                             |
| Presentational / container split | `InputField` vs `ProductForm`; `ProductCard`/`ProductDetails` vs `useProductActions`                             | primitives know markup, containers know rules, hooks know behaviour                                                                 |
| Controlled-input adapter         | `SearchBar.jsx:5-8`                                                                                              | converts a DOM event into a state update                                                                                            |
| Form-mode switching              | `isExists`                                                                                                       | read-only field, swapped label, swapped submit branch                                                                               |
| Two-step destructive confirm     | `useProductActions.js:6` + `:15-26` in both consumers                                                            | hook-owned boolean swaps the button row for a prompt                                                                                |
| Self-healing derived UI          | `ProductList.jsx:24-26`                                                                                          | invalid filter state corrected on render                                                                                            |
| Conditional rendering            | `App.jsx:67` ternary · `ProductList.jsx:53, 58` and `ProductCard.jsx:12`, `ProductDetails.jsx:15` ternaries/`&&` | element-or-branch, no library                                                                                                       |
| List rendering with keys         | `ProductList.jsx:46, 61`                                                                                         | `key={c}`, `key={product.id}`                                                                                                       |
| Semantic HTML as structure       | whole app                                                                                                        | `form`/`ul`/`li`/`label`/`select`/`button`, h1–h5                                                                                   |
| Commented-out code as a record   | `ProductForm.jsx:33-36`                                                                                          | previous mutation-based approach kept with a note on why it was replaced                                                            |

---

# PART 9 — CODEBASE CONVENTIONS

| Convention                  | Rule observed                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Indentation                 | 4 spaces, uniformly                                                                                                                     |
| Quotes                      | double in `app/`, `components/`, `context/`, `hooks/`; single in `main.jsx`, `vite.config.js`, `eslint.config.js`                       |
| Semicolons                  | present everywhere except the two untouched scaffold config files                                                                       |
| Component form              | `function Name() { }` + hooks; no arrows, no classes, no `React.FC`                                                                     |
| Hook form                   | `function useThing() { }`, default export, hooks at the top                                                                             |
| Module exports              | components `export default` (or `export default memo(X)`); contexts named `export const`                                                |
| Export style after refactor | `ProductForm.jsx:136` and `ProductList.jsx:68` export the `memo()` wrapper directly rather than wrapping a separately exported function |
| Import extensions           | always explicit (`.jsx`, `.js`)                                                                                                         |
| Import ordering             | react → context → hooks/components → `ui/`                                                                                              |
| JSX children                | explicit closing tags (`<InputField></InputField>`)                                                                                     |
| Boolean props               | expressions, e.g. `readOnly={productForm.isExists}`                                                                                     |
| Props naming                | camelCase; `errors` for the error string, `changeHandler` for the change callback                                                       |
| Handler naming              | `inputChangeHandler`, `productSubmitHandler`, `searchInputHandler`, `deleteProduct`, `editProduct`, `clearFilterByCategory`             |
| Comparison                  | `==`/`!=` for ids except `App.jsx:52`; `===` for lengths                                                                                |
| Contexts                    | created in one file, provided as a JSX tag in `App`, consumed with `useContext`                                                         |
| Comments                    | one explanatory block in `ProductsList.jsx:19-23`; one commented-out block plus a note in `ProductForm.jsx:33-36`                       |
| Docs                        | `README.md` (intro + run + day log), `LESSONS.md` (6 numbered lessons)                                                                  |
| Lint rules                  | `js.recommended` + `react-hooks` recommended + `react-refresh` vite preset                                                              |

---

# PART 10 — WHAT THE REFACTOR CHANGED

## 10.1 Component count

|                    | Before                                                                            | After                   |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------- |
| Components         | 6 (`App`, `ProductForm`, `ProductList`, `ProductCard`, `SearchBar`, `InputField`) | 7 (+ `ProductDetails`)  |
| Hooks              | 0                                                                                 | 1 (`useProductActions`) |
| Total source lines | 384                                                                               | 357                     |
| Longest module     | `ProductForm.jsx` 131                                                             | `ProductForm.jsx` 120   |
| Second longest     | `ProductList.jsx` 81                                                              | `ProductList.jsx` 52    |

## 10.2 Behaviour deltas

| #  | Change                                                                                                           | Where                                |
| -- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1  | `ProductCard` no longer performs two jobs; the details view is its own component                                 | new `ProductDetails.jsx`             |
| 2  | Delete/edit logic and the confirmation flag exist once, not twice                                                | `hooks/useProductActions.js`         |
| 3  | `selectedProductId` and the screen switch moved from `ProductsList` to `App`                                     | `App.jsx:50-52, 67-75`               |
| 4  | Sentinel changed from `0` to `null`                                                                              | `App.jsx:50`, `ProductDetails.jsx:9` |
| 5  | The product lookup moved from inside the card to the root                                                        | `App.jsx:52`                         |
| 6  | Deleting the open product now returns to the list automatically, via `undefined` from `find`                     | consequence of 3 and 5               |
| 7  | The `<ul>` no longer unmounts the details view as a branch — the whole list component unmounts                   | consequence of 3                     |
| 8  | **Search text and category filter are lost when a product's details are opened**                                 | consequence of 7                     |
| 9  | Update path is now a single immutable `.map()`; `findIndex` + `splice` + spread removed, old code kept commented | `ProductForm.jsx:33-39`              |
| 10 | Both context values are memoised                                                                                 | `App.jsx:54-60`                      |
| 11 | `ProductForm` and `ProductsList` are wrapped in `memo`                                                           | `:136`, `:68`                        |
| 12 | Typing in the form no longer re-renders the product list                                                         | consequence of 10 + 11               |
| 13 | `ProductCard` and `ProductDetails` no longer import or read context                                              | consequence of 2                     |
| 14 | `ProductCard`'s props lost their defaults (`product = null`, `selectedProductId = 0`)                            | `ProductCard.jsx:3`                  |

## 10.3 Additions outside `src/`

| File               | Purpose                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `LESSONS.md`       | 6 numbered lessons — the reasoning trail behind every refactor above                     |
| `README.md`        | Project intro, run instructions, folder structure, day-by-day build log with screenshots |
| `public/day-7.png` | 7th progress screenshot, referenced by `README.md`                                       |

---

# PART 11 — GROWTH SURFACE

Where a new requirement would attach, given the current structure:

| Requirement                                                      | Attachment point                                                                                                                                                                                                                 | Reuses                                                                              |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| New product field                                                | seed objects `App.jsx:10-38`; blank template `App.jsx:40-48` and `ProductForm.jsx:47-55`; `errors` `ProductForm.jsx:11-19`; one `<InputField>` `ProductForm.jsx:60-119`; destructuring in `ProductCard` **and** `ProductDetails` | `inputChangeHandler` needs no change (name-driven); the `errors` → `disabled` chain |
| Preserving search state across the details view                  | the switch is in `App.jsx:67`; lifting `searchValue`/`filterByCategory` there, or keeping both screens mounted with a CSS toggle                                                                                                 | the current derived-switch pattern                                                  |
| A sixth filter dimension                                         | new `useState` in `ProductsList.jsx`, a new step in the chain at `:29-36`, a new control beside `:43-48`                                                                                                                         | the self-heal check at `:24`                                                        |
| Sorting                                                          | `ProductsList.jsx:29-36` — derived, so it composes with the existing chain                                                                                                                                                       | `categories` derivation style                                                       |
| A third screen (e.g. stock report)                               | a new `useState` in `App` + another branch in the ternary at `:67-75`                                                                                                                                                            | the `selectedProduct` truthiness switch                                             |
| Persisting products                                              | the three mutation sites: `ProductForm.jsx:37`, `:43`, `useProductActions.js:12`                                                                                                                                                 | `setProducts` is already exposed app-wide                                           |
| Sharing the identical markup in `ProductCard` + `ProductDetails` | extract the confirm block or the `h2`/`h3`/`h4` group into `ui/`                                                                                                                                                                 | the L6 pattern already used by `InputField`                                         |
| Per-card edit instead of the global form                         | give the card its own draft `useState`; `ProductForm` stays for add                                                                                                                                                              | `setProductForm` from the hook                                                      |
| Shared validation rules                                          | new module read by `ProductForm.jsx:11-19`                                                                                                                                                                                       | `InputField` needs no change                                                        |
| Any styling                                                      | `src/index.css`, and/or import the currently orphaned `src/app/App.css`                                                                                                                                                          | semantic structure is already in place                                              |

---

# PART 12 — QUICK REFERENCE

**Runtime flow:** `index.html:11` → `src/main.jsx:4` → `createRoot().render(<App />)` →
`App` declares `products` / `productForm` / `selectedProductId`, derives `selectedProduct`, memoizes
both context values → provides both contexts → always renders `<ProductForm />`, then renders
either `<ProductDetails />` or `<ProductsList />` → `ProductsList` renders `<SearchBar />` and
`<ProductCard /> × N` → `ProductCard` and `ProductDetails` both call `useProductActions()` →
`SearchBar` and `ProductForm` render `<InputField />`.

**State locations:** `products` `App.jsx:10` · `productForm` `App.jsx:40` · `selectedProductId`
`App.jsx:50` · `searchValue` `ProductList.jsx:9` · `filterByCategory` `ProductList.jsx:10` ·
`isDeleteBtnClicked` `useProductActions.js:6` (one instance per caller).

**Contexts:** `ProductsContext` = `createContext([])`, provided `App.jsx:63`, memoized `:54-56` ·
`ProductFormContext` = `createContext({})`, provided `App.jsx:64`, memoized `:58-60`.

**Hook:** `useProductActions` returns `{ editProduct, deleteProduct, isDeleteBtnClicked,
setIsDeleteBtnClicked }`; used by `ProductCard.jsx:4` and `ProductDetails.jsx:4`.

**Screen switch:** `selectedProduct ? <ProductDetails/> : <ProductsList/>` at `App.jsx:67`, driven
by `products.find(p => p.id === selectedProductId)` at `App.jsx:52`.

**Modes:** add vs edit ← `productForm.isExists` · list vs details ← truthiness of `selectedProduct` ·
idle vs confirming delete ← `isDeleteBtnClicked`.

**Validation:** rules `ProductForm.jsx:11-19` · rendered by `InputField.jsx:19` · enforced by
`disabled` `ProductForm.jsx:123-130`.

**Render control:** `useMemo` at `App.jsx:54` and `:58`; `memo()` at `ProductForm.jsx:136` and
`ProductList.jsx:68`.

**Commands:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.

**Docs:** `README.md` (overview and build log) · `LESSONS.md` (6 lessons) · `PROJECT_ARCHITECTURE.md`
(this file).
