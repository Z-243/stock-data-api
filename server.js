// STEP 1 - define the web scraper

const cheerio = require("cheerio");
// let stockTicket = "pypl";
let type = "history";

async function scrapeData(ticker) {
  try {
    // STEP a - fetch the page html
    const url = `https://stockanalysis.com/stocks/${ticker}/${type}?p=${ticker}`;
    const res = await fetch(url);
    const html = await res.text();

    const $ = cheerio.load(html); //load HTML data from a server and insert it into a selected element.
    const price_history = getPrices($);
    return price_history;
    console.log(price_history);
  } catch (err) {
    console.log(err.message);
  }
}

function getPrices(cher) {
  const prices = cher("td:nth-child(6)")
    .get()
    .map((current_value) => {
      return cher(current_value).text();
    });
  return prices;
}

// STEP 2 - initialise server that serves up an html file that the user can play with

const express = require("express");
const app = express();
const port = 8383;

// middleware - configuration of our server
// it tells the app to expect JSON info // parses the JSON given in app.post
app.use(express.json());
// require the cors package & call it as a function - enable cross origin request
app.use(require("cors")());
// when someone access our server on browser, it serves the index.html file in public directory
app.use(express.static("public"));

// STEP 3 - define api endpoints to access stock data ( and call webscraper )

// listen to incoming post requests from a website
// destructure the ticker from <body> to be sent in the post
// async as we need to call async scrapeData()
// destuct stock_ticker from html & assign it to ticker
app.post("/api", async (req, res) => {
  const { stock_ticker: ticker } = req.body;
  console.log(ticker);
  // get prices for the ticker
  const prices = await scrapeData(ticker);
  // send back from server to acknowledge the request from the client
  // status(200) - means ok (HTTP status code)
  res.status(200).send({ prices });
});

// listen to incoming requests on the port - always at end of file
// when server runs this command, the app keeps listening and running, so to restart when we make changes we use the dev: nodemon server.js
app.listen(port, () => {
  console.log(`Server has started on port: ${port}`);
});
