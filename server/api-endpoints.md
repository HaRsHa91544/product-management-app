# Product Management API Endpoints

## Fetch Products:
- HTTP Method: `GET`
- API Endpoint: `products/`
- Request: GET https://localhost:6969/products
- Response Code: 200
- Response Body:
```json
{
    "products":[
        {
            "id":"",
            "name":"",
            "price":0,
            "stockQuantity":0,
            "category":""
        }
    ]
}
```

## Add Product:
- HTTP Method: `POST`
- API Endpoint: `products/`
- Request method & URL: POST https://localhost:6969/products
- Request body:
```json
{
    "name":"",
    "price":0,
    "stockQuantity":0,
    "category":""
}
```
- Response Code: 201
- Response Body:
```json
{
    "name":"",
    "price":0,
    "stockQuantity":0,
    "category":""
}
```

## Update Product:
- HTTP Method: `PATCH`
- API Endpoint: `products/:id`
- Request method & URL: PATCH https://localhost:6969/products/:id
- Request body:
```json
{
    "name":""
}
```
- Response Code: 200
- Response Body:
```json
{
    "id":"",
    "name":"",
    "price":0,
    "stockQuantity":0,
    "category":""
}
```

## Delete Product:
- HTTP Method: `DELETE`
- API Endpoint: `products/:id`
- Request method & URL: DELETE https://localhost:6969/products/:id
- Response Code: 204
- Response Body: ""