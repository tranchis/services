const express = require('express')
const app = express()
const port = 4224
const cors = require('cors');
const bodyParser = require('body-parser');
const csv2json = require('csv2json');
const request = require('request');
const fs = require('fs');

// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port1 = process.env.PORT || 4225;
 
var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port1, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port1);
});




let aggregatedFile = `./assets/worldAggregated.json`;
let countryAggregatedFile = `./assets/countryAggregated.json`;
let isoCountry = require('./assets/isoCountry.json');

let countryMap = new Map()

// Convert isoCountry to hashMap
isoCountry.forEach(element => {
  try {
    countryMap.set(element.iso2, element)    
  } catch (error) {
    console.log('something already exits');
  }
})
app.use(cors());

const worldAggregated = 'https://raw.githubusercontent.com/datasets/covid-19/master/data/worldwide-aggregated.csv';
const countryAggregated = `https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv`;


// Parsing & Initialization
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.get('/is-alive', (req, res) => res.sendStatus(200));


app.get('/airport', (req, res) => {
    let tmp = req.query;
    // console.log(tmp);
    res.send('tmp');
});

// Get worldwide aggregate data
app.get('/worldwide-aggregated', (req, res) => {
  let flag = false;
    let date = req.query;
    getData()
    .then (() => {
      const data = require('./assets/worldAggregated.json');
      data.forEach(element => {
        if(date.date === element.Date) {
          flag = true;
          res.send(element);
        }
      });
      if(!flag){
        let tmp = {status: "no data"};
        res.send(tmp);
      }
    })
});

// Get country aggregate data
app.get('/country-aggregated', (req, res) => {
    let flag = false;
    let date = req.query.date;
    let tmp = countryMap.get(req.query.country)
    let country = tmp.Country_Region;
    // console.log(date, country);
    countryData()
    .then (() => {
      const data = require('./assets/countryAggregated.json');
      data.forEach(element => {
        if((date === element.Date) && (country === element.Country)) {
          // console.log(element);
          flag = true;
          res.send(element);
        }
      });
      if(!flag){
        let tmp = {status: "no data"};
        res.send(tmp);
      }
    })
});

// Get country aggregate data
app.get('/covid-aggregated', (req, res) => {

  let flag = false;
  let date = req.query.date;
  let tmp = countryMap.get(req.query.country)
  let country = tmp.Country_Region;
  // console.log(date, country);
  countryData()
  .then (() => {
    const data = require('./assets/countryAggregated.json');
    let total = [];
    for(let i=0;i<24; i++){
      total.push("0");
    }
    data.forEach(element => {
      if(country === element.Country) {
        // console.log(element);
        // let tmp = {
        //   Date: element.Date,
        //   Confirmed: element.Confirmed
        // }
        // if(total.length<92) {
          total.push(element.Confirmed);
          flag = true;
        // }
      }
    });
    if(flag){
      res.send({data: total});
      total =[];
    }
    else {
      let tmp = {status: "no data"};
      res.send(tmp);
    }
  })
})

const countryData = () => new Promise((resolve, reject) => {
  request(countryAggregated)
  .pipe(csv2json({
    // Defaults to comma.
    separator: ','
  }))
  .pipe(fs.createWriteStream(countryAggregatedFile))
  .on('finish', () => {
    // console.log('wrote all data to file');
    resolve();
});
});


const getData = () => new Promise((resolve, reject) => {
    request(worldAggregated)
    .pipe(csv2json({
      // Defaults to comma.
      separator: ','
    }))
    .pipe(fs.createWriteStream(aggregatedFile))
    .on('finish', () => {
      // console.log('wrote all data to file');
      resolve();
  });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))