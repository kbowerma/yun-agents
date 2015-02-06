/* Kyle Bowerman 1/9/2015
   the app will post  the temp and the anolog readings to Kue instead of Mongo.


   */


var request = require('request');
var moment = require('moment');
var moistureA1 = 0;
var lightA0 = 0;
var kueURL = process.env.KUE_URL;


function postToKue(payload) {
  //Make the post
  console.log(' called the post');
  request({
    method: 'POST',
    url: kueURL,
    body: payload,
    json: true
  }, function(err, rsp,body){
    if (err || rsp.statusCode != 200) { console.log('HTTP error:', err, rsp.statusCode, body); }
    else {
      console.log('Got HTTP Response code %d', 200);
    }

  });

}


function getReading(url, msg, pin, device, err, rsp, callback) {
  //Make the request
  request(url, function (error, response, body) {
    if(msg) { console.log(msg); }
    if (!error && response.statusCode == 200) {
      console.log(body);
      var parsebody = body.split(" ");
      pinValue =  Number(parsebody[4]);
      console.log('The Value of ' + pin + ' pin is ', pinValue);

      var d = new Date();

      var currentTime = moment();
      var epochtime = moment().valueOf();

      var payload = {
        type: 'analog',
        data: {
          title: 'analog ' + device + ' reading from Yun, getReading:' + pin + ' '+ pinValue,
          msg: 'device',
          body: body,
          pin: pin,
          device: device,
          class: 'analog',
          version: 2,
          value: pinValue,
          time: currentTime,
          epochtime: epochtime
        },
        options : {
          attempts: 5,
          priority: 'high'
        }
      };

      postToKue(payload);



    }
  });
}

function getTempReading(url, msg, pin, device, err, rsp, callback) {
  //Make the request
  request(url, function (error, response, body) {
    if(msg) { console.log(msg); }
    if (error ) { console.log('there is an error ' + error );}
    if (!error && response.statusCode == 200) {
      jsonBody = JSON.parse(body);
      var d = new Date();
      var currentTime = moment();
      var epochtime = moment().valueOf();
      var payload = {
        type: 'temp',
        data: {
          title: 'temp sensor reading from Yun, getTempReading ' + pin + ' '+ jsonBody.temp +'F',
          msg: device,
          body: jsonBody,
          pin: pin,
          device:  jsonBody.device,
          version: 2,
          class: 'temp',
          value: jsonBody.temp,
          time: currentTime,
          epochtime: epochtime
        },
        options : {
          attempts: 5,
          priority: 'high'
        }
      };

      postToKue(payload);

    }
  });
}

// Make the call to get moisture
  getReading('http://localhost/arduino/analog/1/', '  getting the moisture reading from A1', 'A1', 'moisture');
// Make the call to get light
  getReading('http://localhost/arduino/analog/0/', '  getting the light reading from A0', 'A0', 'light');
// Make the call to get T1
  getTempReading('http://localhost/arduino/temp/1', 'getting the reading from T1', 'T1', 'temp at window');
// Make the call to get T2
  getTempReading('http://localhost/arduino/temp/2', 'getting the reading from T2', 'T2', 'temp inside');
//getReading('http://localhost/arduino/analog/2/');
