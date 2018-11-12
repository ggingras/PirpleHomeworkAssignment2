
# Pirple Homework 2
## Delivery API

## Paths

* [Carts](#carts)
* [Menus](#menus)
* [Orders](#orders)
* [Tokens](#tokens)
* [Users](#users)


### Carts
#### Methods
- **[<code>GET</code> ](#cartsget)** /carts
- **[<code>POST</code> ](#cartspost)** /carts
- **[<code>PUT</code> ](#cartsput)** /carts
- **[<code>DELETE</code> ](#cartsdelete)** /carts

#### Carts/GET      
##### Path:
    /carts
##### Payload:
    none    
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    403: Unauthorized access
    404: items not Found
    500: Internal server error

#### Carts/POST      
##### Path:
    /carts
##### Payload:
    itemId (required)
    count (required)
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name,
            cartItems,
            orders // may not be present
        }
    }
##### Errors
    400: Required fields missing or invalid    
    404: Item not found
    500: Internal server error

#### Carts/PUT      
##### Path:
    /carts?itemId=string
##### Payload:
    count (required)
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name,
            cartItems,
            orders
        }
    }
##### Errors
    400: Required fields missing or invalid    
    404: Cart item not found
    500: Internal server error
    
#### Carts/DELETE
##### Path:
    /carts?itemId=string
##### Payload:
    none
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name,
            cartItems,
            orders
        }
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: Cart item not found
    404: User not found    
    500: Internal server error


### Menus
#### Methods
- **[<code>GET</code> ](#menuGet)** /menus
- **[<code>POST</code> ](#menuPost)** /menus
- **[<code>PUT</code> ](#menuPut)** /menus
- **[<code>DELETE</code> ](#menuDelete)** /menus

#### Menus/GET      
##### Path:
    /menus?id=string // if id is not present, will return the list of menu items
    /menus?name=string // if name is present, it will filter result according to name
    /menus?price=number // if price is present, it will filter result according to price
##### Payload:
    none
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: [
            {
            id,
            price,
            name
        }
        ]
    }
##### Errors
    404: Menu item not Found
    500: Internal server error

#### Menus/POST      
##### Path:
    /menus
##### Payload:
    name (required)
    price (required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    400: Required fields missing or invalid    
    500: Internal server error
    
#### Menus/PUT      
##### Path:
    /menus?id=string
##### Payload:    
    name (optional)
    price (optional)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            price,
            name
        }
    }
##### Errors
    400: id cannot be updated
    400: id in querystring is missing or invalid
    400: Nothing to update
    404: Menu Item not found     
    500: Internal server error    
    
#### Menus/DELETE
    Will remove the menu item and remove menu item from all users cart    
##### Path:
    /menus?id=string
##### Payload:
    none    
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {}
    }
##### Errors
    400: Required fields missing or invalid
    404: Item not found    
    500: Internal server error
       
### Orders
#### Methods
- **[<code>GET</code> ](#ordersget)** /orders
- **[<code>POST</code> ](#orderspost)** /orders

#### Orders/GET      
##### Path:
    /orders?id=string
##### Payload:
    none
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            items,
            iat,
            price,
            paymentProcessed
        }
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: Order not found
    500: Internal server error

#### Order/POST    
    Will create the order with the items on the cart  
##### Path:
    /orders
##### Payload:
    none
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            items,
            iat,
            price,
            paymentProcessed
        }
    }
##### Errors
    400: payment not processed   
    400: no items on cart to place an order
    400: Order already exists
    400: Required fields missing or invalid    
    500: Internal server error

### Tokens
#### Methods
- **[<code>GET</code> ](#tokensget)** /tokens
- **[<code>POST</code> ](#tokenspost)** /tokens
- **[<code>PUT</code> ](#tokensput)** /tokens
- **[<code>DELETE</code> ](#tokensdelete)** /tokens

#### Tokens/GET      
##### Path:
    /tokens?id=string
##### Payload:
    none
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            email,
            expires
        }
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: Token not Found
    500: Internal server error

#### Tokens/POST      
##### Path:
    /tokens
##### Payload:
    email (required)
    password (required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            email,
            expires
        }
    }
##### Errors
    400: Required fields missing or invalid
    400: wrong email or password
    400: Token already exists
    404: User does not exists    
    500: Internal server error
    
#### Token/PUT      
##### Path:
    /tokens?id=string
##### Payload:    
    expires
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            id,
            email,
            expires
        }
    }
##### Errors
    400: Nothing to update
    400: id in query is required
    403: Unauthorized access
    404: Token not found    
    421: id cannot be updated
    500: Internal server error    
    
#### Tokens/DELETE      
##### Path:
    /tokens?id=string
##### Payload:
    none    
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {}
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: Token not found    
    500: Internal server error

### Users
#### Methods
- **[<code>GET</code> ](#usersget)** /users
- **[<code>POST</code> ](#userspost)** /users
- **[<code>PUT</code> ](#usersput)** /users
- **[<code>DELETE</code> ](#usersdelete)** /users

#### Users/GET      
##### Path:
    /users?email=string
##### Payload:
    none
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name,
            cartItems, 
            orders 
        }
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: User not Found
    500: Internal server error

#### Users/POST      
##### Path:
    /users
##### Payload:
    email (required)
    password (required)
    name (required)
    address (required)
##### Headers:
    none
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name
        }
    }
##### Errors
    400: User already exists
    400: Required fields missing or invalid    
    500: Internal server error
    
#### Users/PUT      
##### Path:
    /users?email=string
##### Payload:    
    password
    name
    address
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {
            email,
            address,
            name
        }
    }
##### Errors
    400: Nothing to update
    400: Email in querystring is missing ot invalid
    403: Unauthorized access
    400: Email cannot be updated
    404: User not found    
    500: Internal server error    
    
#### Users/DELETE      
##### Path:
    /users?email=example@mail.com
##### Payload:
    none    
##### Headers:
    tokenid (required)
##### Response
    {   
        statusCode: 200,
        data: {}
    }
##### Errors
    400: Required fields missing or invalid
    403: Unauthorized access
    404: User not found    
    500: Internal server error