# addProduct API Test Cases:

## Request 1: POST http://localhost:6969/products/
### Request Body:
```json
{
  "name": "Mouse",
  "price": 1,
  "category": "Electronics",
  "description": "mouse",
  "stockQuantity": 1,
  "isExists": true,
  "__v": 0
}
```
## Response 1:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "name": "Mouse",
    "price": 1,
    "category": "Electronics",
    "description": "mouse",
    "stockQuantity": 1,
    "isExists": true,
    "_id": "6adcd60db6f030ec16a1f656",
    "__v": 0
  },
  "errors": null
}
```


## Request 2: POST http://localhost:6969/products/
### Request Body:
```json
{
  "name": "a",
  "price": -1,
  "category": "Electronics",
  "description": "mouse",
  "stockQuantity": -1,
  "isExists": true,
  "__v": 0
}
```
## Response 2:
```json
{
  "success": false,
  "message": "Product input data is invalid",
  "data": null,
  "errors": {
    "name": "Product name should be atleast 3 characters",
    "price": "Minimum product price must be ₹1",
    "stockQuantity": "Minimum product stock quantity must be 1"
  }
}
```


## Request 3: POST http://localhost:6969/products/
### Request body: empty
## Response 3:
```json
{
  "success": false,
  "message": "Product input data is invalid",
  "data": null,
  "errors": {
    "undefined": "Product input data is invalid"
  }
}
```

## `Request 3:` POST http://localhost:6969/products/ - Error messages has to be changed
```json
{}
```
## Response 3:
```json
{
  "success": false,
  "message": "Product input data is invalid",
  "data": null,
  "errors": {
    "name": "Product name is required",
    "price": "₹{VALUE} is not a valid price",
    "category": "Product category is required",
    "description": "Product description is required",
    "stockQuantity": "{VALUE} is not a valid stock quantity"
  }
}
```

## `Request 4:` POST http://localhost:6969/products/ - Handle the DuplicateKey Error
### Request body: Already existed product 
```json
{
  "_id": "6adcd60db6f030ec16a1f659",
  "name": "Mouse",
  "price": 1,
  "category": "Electronics",
  "description": "mouse",
  "stockQuantity": 1
}
```
### Response 4: No response because the Duplicate key error is not handled

## `Request 5:` POST http://localhost:6969/products/ - Handle the invalid JSON
### Request body: Invalid JSON
```json
{
  "name": "Mouse",
  "price": 1,
}
```
## Respone 5: No response because the SyntaxError is not handled