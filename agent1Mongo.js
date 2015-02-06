/* Kyle Bowerman 1/9/2015
   the app will post the moisture and light reading to mongo using the mongo rest api
   Connection String: https://api.mongolab.com/api/1/databases?apiKey=<your-api-key>
   Mongo call to get the A1 (moisture) values and times
  2/4/2015 Updated from app.js to use process.env store Key
   Renamed agent1.js

   */


var request = require('request');
var moment = require('moment');
var moistureA1 = 0;
var lightA0 = 0;
var mongoLabKey = process.env.MONGOLAB_KEY;



function postToMongo(payload) {
  //Make the post
  request({
    method: 'POST',
    url: 'https://api.mongolab.com/api/1/databases/arduino/collections/sensors?apiKey=' + mongoLabKey,
    body: payload,
    json: true
  }, function(err, rsp, body) {
    if (err || rsp.statusCode != 200) {
      console.log('HTTP error:', err, rsp.statusCode, body);
    } else {
      console.log('Got HTTP Response code %d', 200);
    }

  });
}

function getReading(url, msg, pin, device, err, rsp, callback) {
  //Make the request
  request(url, function(error, response, body) {
    if (msg) {
      console.log(msg);
    }
    if (!error && response.statusCode == 200) {
      console.log(body);
      var parsebody = body.split(" ");
      pinValue = Number(parsebody[4]);
      console.log('The Value of ' + pin + ' pin is ', pinValue);

      var d = new Date();

      var currentTime = moment();
      var epochtime = moment().valueOf();

      var payload = {
        msg: 'sent from agent1 on yun',
        body: body,
        pin: pin,
        device: device,
        version: 2,
        value: pinValue,
        time: currentTime,
        epochtime: epochtime
      };

      postToMongo(payload);



    }
  });
}

function getTempReading(url, msg, pin, device, err, rsp, callback) {
  //Make the request
  request(url, function(error, response, body) {
    if (msg) {
      console.log(msg);
    }
    if (!error && response.statusCode == 200) {
      jsonBody = JSON.parse(body);
      var d = new Date();
      var currentTime = moment();
      var epochtime = moment().valueOf();
      var payload = {
        msg: device,
        body: jsonBody,
        pin: pin,
        device: jsonBody.device,
        version: 2,
        class: 'temp',
        value: jsonBody.temp,
        time: currentTime,
        epochtime: epochtime
      };

      postToMongo(payload);
      //console.log(payload);
    }
  });
}

// Make the call to get moisture
  getReading('http://localhost/arduino/analog/1/', '  getting the moisture reading from A1', 'A1', 'moisture');
// Make the call to get light
  getReading('http://localhost/arduino/analog/0/', '  getting the light reading from A0', 'A0', 'light');
// make the call to get the temp1
  getTempReading('http://localhost/arduino/temp/1', 'getting the reading from T1', 'T1', 'temp at window');
// make the call to get the temp1
  getTempReading('http://localhost/arduino/temp/2', 'getting the reading from T2', 'T2', 'temp inside');
