# Product Management App - The Full Journey, Explained Simply

This document explains how the project was built, how it is put together, what problems
came up along the way, and how each problem was solved. It is written for someone who is
new to React, Express, and MongoDB.

---

## 1. What the app does

It is a small product management app. A user can:

- See a list of products
- Add a new product
- Edit an existing product
- Delete a product (with a yes/no confirmation)
- View one product in a details page
- Search products by name
- Filter products by category
- Get validation messages when input is wrong, including errors that come from the server
- Edit a product without accidentally sending an update when nothing changed

The frontend is React + Vite. The backend is Express + MongoDB (through Mongoose).

---

## 2. The journey, phase by phase

The project was built feature by feature, mostly one commit per day. The git history shows
a clear path from a small frontend exercise to a full stack app.

### Phase 1: Build the frontend by hand (Sep 20 - Sep 26)

- Started the React project with Vite.
- Built `ProductForm` with controlled inputs and validation.
- Added delete with a confirmation step.
- Added edit. Editing works by copying the selected product into the form. At this stage an
  `isExists` flag told the form whether it was in "Add" mode or "Update" mode. This flag was
  removed later (see Phase 7), and `id` became the only source of truth.
- Added search by product name.
- Refactored repeated input markup into one reusable `InputField` component.
- Added category filtering and a "Clear filters" button.
- Added a product details view and a check to prevent duplicate product IDs.
- Wrote the first lessons and README.

### Phase 2: Refactor the frontend (Sep 27 - Oct 13)

The app worked, but the code needed cleaning up. This phase was about making the design
simpler and more reusable.

- Used `useMemo` to avoid unnecessary recalculations and re-renders.
- Split `ProductCard` into smaller pieces and moved shared edit/delete logic into a custom
  hook, `useProductActions`.
- Moved shared list/detail state into a parent (`ProductsView`) so it would survive when
  switching views.
- Moved filtering and validation logic into plain utility functions.
- Added styles and fonts.
- Fixed a bug where the form's open state and its data could get out of sync (Issue #6).
- Moved shared state out of `App` and into React Context providers.

### Phase 3: Build the backend (Oct 13 - Oct 26)

The frontend originally kept products in memory. Refreshing the page lost all data, so the
next step was a real backend.

- First tried a backend with Express and MongoDB.
- Then rebuilt it deliberately from scratch: first an Express server with an in-memory
  product array, so the basics of routing were clear.
- Wrote an API contract document (`server/api-endpoints.md`).
- Added the `Product` Mongoose model.
- Replaced the in-memory routes with real MongoDB create, read, update, and delete
  operations.
- Added Zod schemas to validate request bodies.
- Added Mongoose schema validation as a second safety layer.
- Added a global error handler so every error comes back in the same shape.
- Documented manual test cases for GET, POST, PUT, and DELETE, then fixed the bugs those
  tests found.

### Phase 4: Connect React to the API (Oct 31 - Nov 6)

- Added one API service file per operation:
  `getProductsService`, `addProductService`, `updateProductService`, and
  `deleteProductService`.
- `ProductsProvider` fetches products when the app starts.
- Added loading, success, and failure states for the product list.
- Added form submit error handling.
- Fixed the form clearing itself even when the server request failed (Issue #14).
- Fixed CORS problems in the browser.

### Phase 5: Deploy and polish (Nov 7 - Nov 12)

- Deployed the React app to GitHub Pages using a GitHub Actions workflow.
- The backend was hosted separately (Render) and reached through `VITE_API_URL`.
- Fixed deployment details: Vite `base` path, npm lock file path, environment variable in
  the workflow, and the exact allowed CORS origin.
- Removed redundant form-state updates.
- Merged the separate form-open context into the main form context (Issue #13).
- Prevented duplicate requests caused by double-clicking buttons (Issue #16).

### Phase 6: Better validation and safe updates (Nov 14)

Two more issues were fixed, and the validation design became clearer.

- Added client-side error message constants in `client/src/errors/product/`, so the
  frontend uses the same wording as the backend.
- Stopped showing only one general submit error. Server errors are now stored in local form
  state and displayed under the matching input fields (Issue #15).
- Stopped the form from sending an update when no field has changed. The Update button stays
  disabled until the user actually edits something (Issue #17).
- Fixed an operator-precedence bug in the "is update allowed" ternary expression (a
  follow-up to Issue #17).
- Simplified `ProductFormContext` by removing the old single `productSubmitError` state.

### Phase 7: Safer form closing and a simpler data model (Nov 15 - Nov 21)

The final changes fixed two more issues and then removed an unnecessary piece of state.

- Simplified `closeProductForm` so it decides what happened from the event type and CSS
  classes, instead of a special string argument (Nov 15).
- Fixed Issue #18: a submit button click was bubbling to the overlay and unmounting the form
  before the save request finished. The form now closes only after a successful submit.
- Fixed Issue #19: a newly added product could not be updated. The immediate fix made sure
  the add path marked the saved product as an existing one.
- Then removed the `isExists` flag from the frontend form state, `useProductActions`, the
  Mongoose schema, and the Zod add validator (Nov 21). The presence of `product.id` now
  decides whether the form adds or updates.

---

## 3. Simple architecture

### Frontend

```
main.jsx
  |
  v
App
  |
  +-- ProductsProvider        (products + loading state, talks to the API)
  |
  +-- ProductFormProvider     (form fields + form open/closed)
        |
        +-- Header            (+ Product button opens the form)
        +-- ProductForm       (add/edit form + local server validation errors)
        +-- ProductsView      (search + filter + list/details)
              |
              +-- SearchBar
              +-- FilterByCategory
              +-- ProductsList
                    |
                    +-- ProductCard
                          |
                          +-- ProductActions   (View / Edit / Delete)
              +-- ProductDetails   (shown when a product is selected)
```

Important idea: **state is kept as close as possible to the components that need it.**

- Shared list data lives in `ProductsContext` because many components need it.
- Shared form data lives in `ProductFormContext` because the header and the form need it.
- The individual form's server validation errors live inside `ProductForm` itself, because
  no other component needs them.
- Search text, selected category, and selected product ID live in `ProductsView` because
  only that part of the screen uses them.
- Filtered products are **calculated**, not stored. Storing them separately would create
  two sources of truth that could disagree.

### The custom hook

`useProductActions` is a small bridge between components and the API:

```
Browser component
   -> useProductActions
      -> addProductService / updateProductService / deleteProductService
         -> fetch(...) to the Express server
```

It decides whether to add or update by checking `product.id`, updates the products state
after success, and passes the server's error details back to the form when something fails.

### How the form knows "Add" or "Update"

There is no longer an `isExists` flag anywhere in the data model:

- A fresh form has no `id`, so the button says **Add Product** and `saveProduct` sends a
  `POST /products` request.
- Clicking Edit puts a real product into the form, including its `id`. The button then says
  **Update Product** and `saveProduct` sends a `PUT /products/:id` request.
- The same `id` check also decides whether to compare the form with the stored product and
  block an update when nothing changed.

This is simpler because the mode is derived from data the app already has, instead of being
stored as a second flag that can get out of sync.

### How validation errors reach the right input

There are two validation layers, and they now work together:

1. `validateProductForm` checks the fields in the browser. Its messages come from
   `client/src/errors/product/`.
2. The server validates again with Zod. If it rejects a request, the response contains an
   `errors` object such as `{ "price": "Minimum product price must be ₹1" }`.
3. The service files attach that `errors` object to the thrown error as its `cause`.
4. `useProductActions` rejects with that `cause`.
5. `ProductForm` saves it in local state called `serverValidationErrors`.
6. Each `InputField` shows `clientError || serverError`, so the message appears directly
   under the field that caused it.

This is why the general `productSubmitError` state is no longer needed in
`ProductFormContext`.

### Backend

```
Request
  |
  v
server.js
  |
  +-- express.json()          reads JSON request bodies
  +-- cors middleware         allows only known frontend origins
  +-- requestValidator(zod)   checks the request body for POST and PUT
  |
  +-- controller              getProducts / addProduct / updateProduct / deleteProduct
        |
        +-- Product model     Mongoose schema and MongoDB rules
              |
              +-- MongoDB
  |
  +-- errorHandler            catches all errors in one place
  +-- sendResponse            always returns the same JSON shape
```

The server returns responses in this consistent shape:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { },
  "errors": null
}
```

Routes:

| Method | Route           | Purpose        |
|--------|-----------------|----------------|
| GET    | `/products`     | List products  |
| POST   | `/products`     | Add a product  |
| PUT    | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

The database document has these fields:

```
name           string, required, at least 3 characters
price          number, required, at least 1
category       string, required, at least 3 characters
description    string, required, at least 3 characters
stockQuantity  number, required, at least 1
```

MongoDB creates the unique `id` for each document. The schema turns it into `id` in JSON
responses and hides MongoDB's internal `_id` and `__v` fields.

---

## 4. What happens when a user adds a product

1. The user clicks **+ Product**. `setFormOpened(true)` makes the form appear.
2. The new form has no `id`, so it is in "Add" mode. Each typed change updates `productForm`
   in `ProductFormContext`.
3. `validateProductForm` runs on every render. The submit button stays disabled until all
   fields are valid. When editing (the form has an `id`), it also stays disabled until at
   least one field changes.
4. On submit, the button is disabled to stop double clicks, then `saveProduct` runs. The form
   is not closed yet; it waits for the request to finish.
5. `saveProduct` calls `addProductService`, which sends a `POST /products` request.
6. The server validates the body with Zod, creates the product with Mongoose, and saves it
   in MongoDB.
7. The new product comes back in the response and is added to the products state.
8. Only after success, the form is cleared, its server errors are reset, and it closes.
9. If the request fails, the server's field errors are shown under the matching inputs and
   the form stays open so the user does not lose their input.

---

## 5. Problems encountered and how they were solved

### Problem 1: Passing state through too many components

**What happened:** The form open/close state was in `App`, but the Edit button lives deep
inside `ProductCard`. Passing the setter down through every level was messy ("props
drilling").

**Solution:** Created a React Context so any component can read the state directly. Later,
the separate "form open" context was merged into `ProductFormContext`, because both pieces
of state belong to the same feature.

**Lesson:** Use Context when many distant components need the same state.

### Problem 2: The form and its open state got out of sync (Issue #6)

**What happened:** Closing the form did not always clear the typed product data, so opening
the form again could show old values.

**Solution:** Created one `closeProductForm` function that closes the form, clears the form
data, and clears any server validation errors. Clicking the overlay and clicking Close now
use the same function.

**Lesson:** When two pieces of state must change together, change them in one place.

### Problem 3: Add/update logic was repeated

**What happened:** The code deciding whether to add or update a product was buried inside
the form component. Any other component that needed it would have to copy it.

**Solution:** Moved the logic into `useProductActions.saveProduct`. Now any component can
call it.

**Lesson:** Put repeated business logic in a hook or utility function.

### Problem 4: Edit/delete UI was duplicated

**What happened:** `ProductCard` and `ProductDetails` both had the same edit/delete state,
buttons, and logic.

**Solution:** Created a `ProductActions` component and used it in both places.

**Lesson:** If the same state, UI, and logic appear in two components, extract a component.

### Problem 5: One component had too many jobs

**What happened:** `ProductCard` displayed a product, showed details, handled edit, and
handled delete.

**Solution:** Split it into `ProductCard`, `ProductDetails`, and `ProductActions`, and moved
shared logic into `useProductActions`.

**Lesson:** One component should have one main responsibility.

### Problem 6: Data disappeared after refresh

**What happened:** Products lived only in a React state array. Refreshing wiped everything.

**Solution:** Built the Express + MongoDB backend and replaced in-memory operations with
real database operations.

**Lesson:** Browser memory is temporary. Real data belongs on a server in a database.

### Problem 7: Invalid data could reach the database

**What happened:** A user could send empty, negative, or wrong-type values.

**Solution:** Two layers of protection:
1. **Zod** checks the request body before the controller runs.
2. **Mongoose** validates again when saving to MongoDB.

**Lesson:** Validate on the frontend for a good experience, and validate on the backend for
real safety. Never trust the browser alone.

### Problem 8: Errors came back in different formats

**What happened:** Zod errors, Mongoose validation errors, invalid MongoDB IDs, duplicate
keys, and database connection failures all behaved differently.

**Solution:** A single `errorHandler` middleware detects each error type and returns a
consistent response using `sendResponse`. Helper functions `getZodSchemaErrors` and
`getModelErrors` turn errors into a simple `{ field: message }` object.

**Lesson:** A global error handler keeps responses predictable for the frontend.

### Problem 9: The server returned `_id` but the frontend expected `id`

**What happened:** MongoDB uses `_id`, while the frontend was written around `id`.

**Solution:** Added a `toJSON` transform in the Mongoose schema. It deletes `_id` and `__v`
and exposes a normal `id`.

**Lesson:** Keep the API shape consistent with what the frontend expects.

### Problem 10: The browser blocked API requests (CORS)

**What happened:** The frontend and backend run on different addresses. Browsers block
cross-origin requests unless the server explicitly allows them.

**Solution:** Wrote a custom CORS middleware that:
- allows only known frontend origins,
- allows GET, POST, PUT, PATCH, and DELETE,
- allows the `content-type` header,
- answers preflight `OPTIONS` requests with `204`.

During deployment, the GitHub Pages URL was added and a trailing slash was removed so the
origin matched exactly.

**Lesson:** CORS is a server permission system. The server must name the exact frontend
origin.

### Problem 11: The form cleared even when saving failed (Issue #14)

**What happened:** The submit handler called `saveProduct()` and then cleared the form
immediately. It did not wait to see whether the request succeeded.

**Solution:** The form now clears only after the promise resolves. On failure,
`saveProduct` rejects with the server's field errors, those errors are displayed under the
inputs, and the form keeps the user's input.

**Lesson:** Only do the "success" action after the request actually succeeds.

### Problem 12: Double-clicking caused duplicate requests (Issue #16)

**What happened:** Clicking Submit or the delete "Yes" button twice sent two requests.

**Solution:** Added a small `disableButton` utility that disables the button as soon as it
is clicked, before the request finishes.

**Lesson:** Network requests take time. Prevent repeated actions while one is in progress.

### Problem 13: Redundant state updates

**What happened:** The add and update actions called `setFormOpened(false)` even though the
form's own close function already did that.

**Solution:** Removed the extra calls. The form close function is now the only place that
sets the form to closed and clears it.

**Lesson:** If two places update the same state for the same reason, keep only one.

### Problem 14: Category filtering would slow down as data grew

**What happened:** Filtering by category means searching the `category` field.

**Solution:** Added a MongoDB index on `category` so lookups are faster.

**Lesson:** Index the fields you frequently search or filter by.

### Problem 15: Deployment was not working

**What happened:** Several small issues appeared during deployment.

**Solutions:**
- GitHub Pages needs the repository name as a base path, so Vite uses
  `base: '/product-management-app/'`.
- The workflow file had to live at the repository root.
- The npm cache needed the correct lock file path (`client/package-lock.json`).
- The API URL is provided to the build through `VITE_API_URL`.
- The deployed frontend URL had to be allowed by the backend CORS middleware.

**Lesson:** Deployment has its own configuration layer. A working local app is not
automatically a working deployed app.

### Problem 16: API tests found edge cases

**What happened:** Manual tests revealed problems such as:
- an invalid product ID returned a confusing server error instead of a clear `400`,
- updating a product that did not exist returned success with `null`,
- an empty update body produced an error keyed as `"undefined"`.

**Solution:**
- Invalid MongoDB IDs are detected and returned as `400`.
- Updating or deleting a missing product returns `404`.
- The update validator requires at least one real field, and error mapping uses field names
  properly.

**Lesson:** Test the unhappy paths, not just the happy path. Errors are part of the API.

### Problem 17: Server validation errors were not shown next to fields (Issue #15)

**What happened:** The backend already returned field-level errors like
`{ "price": "Minimum product price must be ₹1" }`, but the form only had one general error
message. The user could not easily tell which field was wrong, and the client and server
used different wording.

**Solution:**
- Added matching error message constants in `client/src/errors/product/`, so both sides say
  the same thing.
- Passed the server's `errors` object through the service layer as the error's `cause`, then
  through `useProductActions` to `ProductForm`.
- Stored those errors in local `serverValidationErrors` state and displayed
  `clientError || serverError` under each input.
- Removed the old general `productSubmitError` from the form context.

**Lesson:** Server errors should be mapped back to the exact field that caused them. Keep UI
error state as local as possible, and keep shared wording in constants instead of repeating
strings.

### Problem 18: Update requests were sent even when nothing changed (Issue #17)

**What happened:** Opening a product in edit mode and pressing Update sent a request even if
the user had not changed anything. After adding a "has anything changed?" check, a second
bug appeared: the disabled condition mixed `&&` and `?:` without parentheses, so it was
evaluated in the wrong order.

**Solution:**
- Compare the product in the form with the product in the list, field by field.
- Keep the Update button disabled until at least one field is different.
- Guard against a missing product before comparing.
- Wrap the ternary in parentheses. It was first written as
  `(productForm.isExists ? isExistingProductChanged : true)` and later became
  `(productForm.id ? isExistingProductChanged : true)` when the flag was removed.

**Lesson:** Avoid pointless network requests. When mixing `&&` and `?:`, use parentheses to
make the intended order obvious, and test the exact edge case you are fixing.

### Problem 19: The form unmounted while a save was still running (Issue #18)

**What happened:** The submit button's click bubbled up to the form overlay. The overlay's
close handler saw the button's CSS class and closed the form immediately. That unmounted the
form while the asynchronous save was still in progress, so the submission was cancelled.

**Solution:**
- `closeProductForm` now checks both the event type and the target's CSS class.
- A click on the overlay or the Close button still closes the form.
- A submit event is different: `closeProductForm(e)` is called only inside the `.then()` of
  `saveProduct`, after the server has responded successfully.
- The submit button no longer triggers the close handler just by being clicked.

**Lesson:** Do not remove a component while async work is using its state. Also remember
that clicks bubble up in React; a parent's click handler can run for child clicks too.

### Problem 20: Newly added products could not be updated (Issue #19)

**What happened:** After adding a product, opening it in edit mode did not allow it to be
updated. At the time, add and update were decided by the `isExists` flag, and the add flow
was not reliably marking the saved product as existing.

**Solution:**
- The immediate fix was to set the flag on the product before saving a new one.
- The cleaner fix came next: remove `isExists` from the form state, the context, the action
  hook, the Mongoose schema, and the Zod add validator.
- Now `product.id` is the only check. If there is an `id`, the product exists and can be
  updated; if there is no `id`, it is new.

**Lesson:** A duplicate flag is a second source of truth. When real data already answers the
question (here, "does this product have an id?"), use that instead of maintaining a flag.

---

## 6. The main lessons, in beginner language

1. **Put state in the lowest common parent that needs it.** Do not put everything in `App`,
   and do not hide it too deep either.
2. **Do not store data you can calculate.** `filteredProducts` comes from `products`,
   `category`, and `searchValue`. Storing it separately creates bugs.
3. **Use Context when props would pass through many components that do not use them.**
4. **Arrays and objects are compared by reference in React.** To trigger an update, pass a
   new array or object, not the same mutated one.
5. **A component re-render is just a function call.** Normal local variables reset, but
   `useState` and `useRef` values survive.
6. **One component, one responsibility.** Split big components into smaller focused ones.
7. **Extract repeated logic.** Hooks and utility functions keep components readable.
8. **Validate on both sides.** Frontend validation helps the user; backend validation
   protects the data.
9. **Always handle loading, success, and failure.** The UI should tell the user what is
   happening.
10. **Keep API responses consistent.** A single response shape makes frontend code simple.
11. **Show errors where they belong.** A server field error is more useful under that input
    than as one general message at the bottom.
12. **Avoid no-op requests.** If nothing changed, there is nothing to save.
13. **Keep repeated messages in constants.** Matching client and server wording prevents
    confusing, slightly different validation messages.
14. **Wait for the request before closing the form.** Closing early can cancel the work and
    lose the user's input.
15. **Use data you already have as the source of truth.** `id` tells you if a product exists;
    a separate `isExists` flag only creates another thing to keep in sync.

---

## 7. Folder map

```
product-management-app/
|
+-- client/                     React frontend
|   +-- src/
|   |   +-- app/                App entry layout
|   |   +-- components/         UI components
|   |   +-- context/            ProductsContext and ProductFormContext
|   |   +-- errors/             Validation message constants used by the form
|   |   +-- hooks/              useProductActions
|   |   +-- services/           fetch calls to the API
|   |   +-- utils/              validation, filtering, button helper
|   |   +-- styles/             CSS files
|   |   +-- main.jsx
|   +-- vite.config.js          base path for GitHub Pages
|   +-- .env                    VITE_API_URL
|   +-- engineering-decision-notes/   Why certain refactors were done
|
+-- server/                     Express backend
|   +-- server.js               app setup, routes, database connection
|   +-- controllers/            one function per route
|   +-- models/                 Product Mongoose schema
|   +-- validators/             Zod schemas
|   +-- middlewares/            CORS, request validation, global errors
|   +-- errors/                 reusable error message constants
|   +-- utils/                  response and error formatting helpers
|   +-- tests/                  documented manual API test cases
|   +-- api-endpoints.md        API contract
|   +-- example.env
|
+-- .github/workflows/deploy.yml   GitHub Pages deployment
+-- README.md
+-- LESSONS.md                     Short list of the main React lessons learnt
+-- PROJECT_JOURNEY.md             this file
```

---

## 8. How to run the project locally

Backend:

```bash
cd server
npm install
```

Create a `.env` file using `example.env` as a template:

```
MONGODB_URI=your_mongodb_connection_string
PORT=6969
```

Then:

```bash
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Make sure `client/.env` points to the backend:

```
VITE_API_URL=http://localhost:6969/
```

Open the address Vite prints, usually `http://localhost:5173`.

---

## 9. Summary

This project started as a small React practice app and grew in clear stages:

1. Build features with plain React state.
2. Refactor toward reusable components, hooks, and utilities.
3. Move shared state into Context.
4. Replace temporary in-memory data with a real Express + MongoDB backend.
5. Validate and handle errors properly on the server.
6. Connect the frontend to the API with loading and error states.
7. Deploy the frontend and backend, then fix the real-world configuration issues.
8. Polish edge cases such as failed saves and double-click requests.
9. Improve validation feedback by showing server errors per field, and prevent updates when
   nothing has changed.
10. Make form closing safe during async requests and simplify the model by removing
    `isExists`; `id` now decides add versus update.

The biggest takeaway is not any single library. It is the habit of noticing duplication,
unclear responsibilities, and repeated bugs, then moving code so that each piece has one
clear job and one clear source of truth.
