# Coinbase Orderbook

A clean and simple orderbook utilising Coinbase API Websocket feed.

![Basic Coinbase Orderbook](/img/sample.png)

## Description

#### What is an orderbook?

> An order book lists all the open orders with different offers from buyers and sellers for an underlying security. It provides investors with information such as the different prices of each order, the total volume of orders at that particular price, and the spread between the best buy and sell prices.
>
> Source: [The Balance](https://www.thebalance.com/what-is-an-order-book-5197237)

#### How would an orderbook be used?

- helps to understand supply pressure versus demand pressure on a currency pair
- maintain a high level of transparency on the exchange

Among the main characteristics of an orderbook:

1. It offers a quick visualization of market prices both for sale and purchase. **It allows to know the liquidity and depth of a market, observing the quantity and volume of purchase / sales orders, as well as its update frequency**.
2. It is a tool that **It allows to visualize in an organized way the flow of sales and purchases of cryptocurrencies.**
3. Offers a quick display of market prices for both purchase and sale. In this way, the trader has information at his disposal to give the best value in the operation he wishes to carry out.
4. **It allows to detect resistance** observing large amounts of purchase / sale at a certain price, generating a noticeable difference with other prices.



## Built with

Angular version 13.1.3 setup with eslint and prettier

Jest for unit testing



## How to use

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

#### Running unit tests

Run `npm test` to execute the unit tests via Jest.

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.



## Future To Do

- Highlight updated rows
- Bucket the data so that we can see the bigger picture
- Custom add coins to track
- e2e testing using cypress
