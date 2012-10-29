'use strict';

(function($) {

if ('geolocation' in navigator) {
  startSpeedometer();
} else {
  alert("I'm sorry, but geolocation services are not supported by your browser.");
}

var points = [];
var $speed = $('#speed .val');
var $units = $('#speed .units');
var $time = $('#geolocation .time');
var $lat = $('#geolocation .lat');
var $lon = $('#geolocation .lon');
var $acc = $('#geolocation .acc');
var EARTH_RADIUS = 6378000;  // meters
var GEO_QUERY_INTERVAL = 5000;  // milliseconds


function startSpeedometer() {
  /* This is buggy in Firefox :( - See https://bugzilla.mozilla.org/show_bug.cgi?id=732923
  navigator.geolocation.watchPosition(
    function(position) {
      addPoint(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    },
    function() {
      alert('error');
    },
    {
      enableHighAccuracy:true,
      maximumAge:30000,
      timeout:27000
    }
  );*/

  
  navigator.geolocation.getCurrentPosition(function(position) {
    addPoint(position);
    setTimeout(function() {
      startSpeedometer();
    }, GEO_QUERY_INTERVAL);
  }, function(err) { alert('Error getting your location: ' + err.message); }); 
}

function addPoint(position) {
  var point = {
    time: new Date(),
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: position.coords.accuracy
  };
  points.push(point);
  updatePoint(point);
  updateSpeed();
}

function updatePoint(point) {
  $time.text(point.time.getHours() + ':' + point.time.getMinutes() + ':' + point.time.getSeconds());
  $lat.text(point.lat.toFixed(2));
  $lon.text(point.lon.toFixed(2));
  $acc.text(point.accuracy);
}

function updateSpeed() {
  if (points.length > 1) {
    var p1 = points[points.length - 2];
    var p2 = points[points.length - 1];
    var distance = distanceBetween(p2, p1);  // meters
    var time = (p2.time.getTime() - p1.time.getTime()) / 1000 / 60 / 60;  // hours
    var speed = time ? (distance / time) / 1609 : 0;  // mph
    $speed.text(speed.toFixed(1));
  }
}

function toRadians(degrees) {
  return degrees * 3.1415926 / 180;
}

function distanceBetween(point1, point2) {
  // Since our points should be close to one another, we use the cheaper
  // Pythagoras’ theorem on an equirectangular projection.
  var lat1 = toRadians(point1.lat);
  var lat2 = toRadians(point2.lat);
  var lon1 = toRadians(point1.lon);
  var lon2 = toRadians(point2.lon);
  var x = (lon2 - lon1) * Math.cos((lat1 + lat2)/2);
  var y = lat2 - lat1;
  return Math.sqrt(x * x + y * y) * EARTH_RADIUS;
};

})(jQuery);
