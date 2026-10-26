# updateProduct API Test Cases:

## Test Case 1: Valid Request
### Request: PUT http://localhost:6969/products/6adcd60db6f030ec16a1f659
```json
{
  "name": "Slim Mouse"
}
```
### Response: 200 OK
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "6adcd60db6f030ec16a1f659",
    "name": "Slim Mouse",
    "price": 1,
    "category": "Electronics",
    "description": "mouse",
    "stockQuantity": 1,
    "isExists": true,
    "__v": 0
  },
  "errors": null
}
``` 

## `Test Case 2:` Invalid Product ID in Request
### Request: PUT http://localhost:6969/products/ade23369cc7a4a1e5746ba2
```json
{
  "name": "Slim Mouse"
}
```
### Response: 503 Service Unavailable
```json
{
  "success": false,
  "message": "Web server is temporarily unavailable to serve your request",
  "data": null,
  "errors": null
}
```

## Test Case 3: No Product ID is in Request
### Request: PUT http://localhost:6969/products/
### Response: 404 Not Found

## `Test Case 4:` Updating the product which is not existed
### Request: PUT http://localhost:6969/products/6adb5d0c58e1ab1ff46a0dbe
```json
{
  "name": "Slim Mouse"
}
```
### Response: 200 OK
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": null,
  "errors": null
}
```

## Test Case 5: No product fields in request body
### Request: PUT http://localhost:6969/products/6adcd60db6f030ec16a1f659
```json
{}
```
### Response: 400 Bad Request
```json
{
  "success": false,
  "message": "Product input data is invalid",
  "data": null,
  "errors": {
    "undefined": "At least one field must be provided"
  }
}
```

## Test Case 6: Invalid product fields in request body
### Request: PUT http://localhost:6969/products/6adcd60db6f030ec16a1f659
```json
{
  "name": "",
  "price": -1,
  "stockQuantity": 0
}
```
### Response: 400 Bad Request
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

## Test Case 7: Updating Product ID of the Product
### Request: PUT http://localhost:6969/products/6adcd60db6f030ec16a1f659
```json
{
  "id": "6adcd60db6f030ec16a1f658",
  "name":"SLIM MOUSE"
}
```
### Response: Product ID not updated
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "6adcd60db6f030ec16a1f659",
    "name": "SLIM MOUSE",
    "price": 1,
    "category": "Electronics",
    "description": "mouse",
    "stockQuantity": 1,
    "isExists": true,
    "__v": 0
  },
  "errors": null
}
```