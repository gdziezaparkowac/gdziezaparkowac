var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');
var csv = require('csv');
var _ = require('lodash');

var parkings = [];
setInterval(() => {
  getData();
}, 300000);

var getData = () => {
  console.log('Sendin request..');
  http.get('http://www.wroclaw.pl/open-data/opendata/its/parkingi/parkingi.csv', (res) => {
    console.log('Request sent.');
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
                        `Status Code: ${statusCode}`);
    } else if (!/^text\/csv/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
      try {
        csv.parse(rawData, {
          delimiter: ";"
        }, (err, data) => {
            var names = [];
            parkings = [];
            // 0 - Czas rejestracji
            // 1 - Liczba wolnych miejsc
            // 2 - Liczba Poj wjezdzajacych
            // 3 - Liczba Poj wyjezdzajacych
            // 4 - Nazwa
            _.eachRight(data, (row, index) => {
              // Show only last entry
              if (names.includes(row[4])) {
                return false;
              }

              names.push(row[4]);
              parkings.push(row);
            });
        });
      } catch (e) {
        console.log(e.message);
      }
    });
    }).on('error', (e) => {
      console.log(`Got error: ${e.message}`);
    });
};

getData();
router.get('/', function(req, res, next) {
  res.render('index', { parkings: parkings });
});

module.exports = router;
