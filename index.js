const express = require('express')
const app = express()
const port = 4224
const cors = require('cors');
const bodyParser = require('body-parser');
const csv2json = require('csv2json');
const request = require('request');
const fs = require('fs');

let aggregatedFile = `./assets/worldAggregated.json`;
let countryAggregatedFile = `./assets/countryAggregated.json`;
let isoCountry = require('./assets/isoCountry.json');

let countryMap = new Map()

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

app.get('/worldwide-aggregated', (req, res) => {
  let flag = false;
    let date = req.query;
    // console.log(date);
    getData()
    .then (() => {
      const data = require('./assets/worldAggregated.json');
      data.forEach(element => {
        if(date.date === element.Date) {
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

const countryData = () => new Promise((resolve, reject) => {
  request(countryAggregated)
  .pipe(csv2json({
    // Defaults to comma.
    separator: ','
  }))
  .pipe(fs.createWriteStream(countryAggregatedFile))
  .on('finish', () => {
    console.log('wrote all data to file');
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