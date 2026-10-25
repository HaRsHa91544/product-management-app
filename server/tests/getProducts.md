# getProducts Test Cases:
## Request 1: GET http://localhost:6969/products/
## Response 1:
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
        {
        "_id": "6ad4cf57dad018340392bf75",
        "name": "Wireless Mouse",
        "price": 799,
        "category": "Electronics",
        "description": "Ergonomic wireless mouse with adjustable DPI.",
        "stockQuantity": 255,
        "isExists": true,
        "__v": 0
        } 
    ],
  "errors": null
}
```

## `Request 2:` GET http://localhost:6969/products/ - Removed MongoDB Connection
## Response 2:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Error</title>
  </head>
  <body>
    <pre>TypeError: Cannot convert undefined or null to object<br> &nbsp; &nbsp;at Function.keys (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at getModelErrors (file:///C:/Users/harsh/OneDrive/Desktop/product-management-app/server/utils/getModelErrors.js:8:27)<br> &nbsp; &nbsp;at errorHandler (file:///C:/Users/harsh/OneDrive/Desktop/product-management-app/server/middlewares/errorHandler.js:26:13)<br> &nbsp; &nbsp;at Layer.handleError (C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\lib\layer.js:116:17)<br> &nbsp; &nbsp;at trimPrefix (C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\index.js:340:13)<br> &nbsp; &nbsp;at C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\index.js:297:9<br> &nbsp; &nbsp;at processParams (C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\index.js:582:12)<br> &nbsp; &nbsp;at next (C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\index.js:291:5)<br> &nbsp; &nbsp;at next (C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\lib\route.js:132:14)<br> &nbsp; &nbsp;at C:\Users\harsh\OneDrive\Desktop\product-management-app\server\node_modules\router\lib\layer.js:161:9</pre>
  </body>
</html>
```

### I need to make sure the correct response as to be sent when DB is not connected.