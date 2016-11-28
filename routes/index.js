var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');
var csv = require('csv');
var _ = require('lodash');
/*
http://www.wroclaw.pl/open-data/opendata/its/parkingi/parkingi.csv
*/
router.get('/', function(req, res, next) {
  var parkings = [];

  // 0 - Czas rejestracji
  // 1 - Liczba wolnych miejsc
  // 2 - Liczba Poj wjezdzajacych
  // 3 - Liczba Poj wyjezdzajacych
  // 4 - Nazwa
  fs.readFile('parkingi.csv', 'utf8', (err, data) => {
    csv.parse(data, {
      delimiter: ";"
    }, (err, data) => {
        var names = [];

        _.eachRight(data, (row, index) => {
          if (names.includes(row[4])) {
            return false;
          }
          
          names.push(row[4]);
          parkings.push(row);
        });

        res.render('index', { parkings: parkings });
    });
  });
});

module.exports = router;
