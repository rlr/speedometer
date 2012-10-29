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
var GEO_QUERY_INTERVAL = 1000;  // milliseconds
var USE_WATCH_POSTION = true;


function startSpeedometer() {
  if (USE_WATCH_POSTION) {
    navigator.geolocation.watchPosition(
      function(position) {
        addPoint(position);
      },
      function() {
        alert('Error getting your location: ' + err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000
        //, timeout:27000 // This is buggy in Firefox :( - See https://bugzilla.mozilla.org/show_bug.cgi?id=732923
      }
    );
  } else {
      navigator.geolocation.getCurrentPosition(function(position) {
        addPoint(position);
        setTimeout(function() {
          startSpeedometer();
        }, GEO_QUERY_INTERVAL);
      }, function(err) { alert('Error getting your location: ' + err.message); });
  }
}

function addPoint(position) {
  var point = {
    time: new Date(),
    timestamp: (navigator.platform === 'iPhone' || navigator.platform === 'iPad') ?
                  position.timestamp / 1000 :
                  position.timestamp,
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: position.coords.accuracy
  };
  points.push(point);
  updatePoint(point);
  updateSpeed();
}

function updatePoint(point) {
  var d = new Date(point.timestamp);
  $time.text(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
  $lat.text(point.lat.toFixed(2));
  $lon.text(point.lon.toFixed(2));
  $acc.text(point.accuracy);
}

function updateSpeed() {
  if (points.length > 1) {
    var p1 = points[points.length - 2];
    var p2 = points[points.length - 1];
    var distance = distanceBetween(p2, p1);  // meters
    var time = (p2.timestamp - p1.timestamp) / 1000 / 60 / 60;  // hours
    if (time > 0) {
      $speed.text(((distance / time) / 1609).toFixed(1));
    }
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
