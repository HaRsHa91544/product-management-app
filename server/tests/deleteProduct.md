# deleteProduct API Test Cases:

## Test Case 1: Valid Request
### Request: DELETE http://localhost:6969/products/6ade23369cc7a4a1e5746ba2
### Response: 204 No Content

## `Test Case 2:` Invalid Product ID in Request
### Request: DELETE http://localhost:6969/products/ade23369cc7a4a1e5746ba2
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
### Request: DELETE http://localhost:6969/products/
### Response: 404 Not Found

## Test Case 4: Deleting the product which is not existed
### Request: DELETE http://localhost:6969/products/6adb5d0c58e1ab1ff46a0dbe
### Response: 404 Not Found
```json
{
  "success": false,
  "message": "Product with id 6adb5d0c58e1ab1ff46a0dbe not found to delete",
  "data": null,
  "errors": null
}
```