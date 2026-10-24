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

## Request 3:
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