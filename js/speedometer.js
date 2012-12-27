'use strict';

(function($) {

var settings = {
  debug: localStorage['settings.debug'] === 'true' || false,
  units: localStorage['settings.units'] || 'metric', // or 'imperial'
  geoQueryInterval: 1000 // milliseconds
};

var points = [];
var $val = $('#speed .val');
var $units = $('#speed .units');

var $time = $('#geolocation-debug .time');
var $lat = $('#geolocation-debug .lat');
var $lon = $('#geolocation-debug .lon');
var $acc = $('#geolocation-debug .acc');
var $speed = $('#geolocation-debug .speed');

var $gpsBars = $('#gps-bars');
var $gpsMessage = $('#gps-message');

var EARTH_RADIUS = 6378000;  // meters


if ('geolocation' in navigator) {
  initSettings();
  initSpeedometer();
} else {
  alert("I'm sorry, but geolocation services are not supported by your browser.");
}

function initSettings() {
  $('#settings-toggle').click(function() {
    $('body').toggleClass('settings');
  });
  updateSettings();

  $('#units').val(settings.units).change(function() {
    settings.units = $(this).val();
    localStorage['settings.units'] = settings.units;
    updateSettings();
  });

  $('#debug').attr('checked', settings.debug).change(function() {
    settings.debug = $(this).is(':checked');
    localStorage['settings.debug'] = settings.debug;
    updateSettings();
  });
}

function updateSettings() {
  if (settings.debug) {
    $('body').addClass('debug');
  } else {
    $('body').removeClass('debug');
  }

  if (settings.units === 'metric') {
    $units.text('km/h');
  } else {
    $units.text('mph');
  }
}

function initSpeedometer() {
  navigator.geolocation.watchPosition(
    function(position) {
      addPoint(position);
    },
    function() {
      alert('Error getting your location: ' + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: settings.geoQueryInterval
      //, timeout:27000 // This is buggy in Firefox - See https://bugzilla.mozilla.org/show_bug.cgi?id=732923
    }
  );
}

function addPoint(position) {
  var point = {
    time: new Date(),
    timestamp: (navigator.platform === 'iPhone' || navigator.platform === 'iPad') ?
                  position.timestamp / 1000 :
                  position.timestamp,
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speed: position.coords.speed * 3600/ 1609
  };
  points.push(point);
  updatePoint(point);
  updateSpeed();
  updateGPSAccuracy(point);
}

function updatePoint(point) {
  if (settings.debug) {
    var d = new Date(point.timestamp);
    $time.text(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
    $lat.text(point.lat.toFixed(2));
    $lon.text(point.lon.toFixed(2));
    $acc.text(point.accuracy);
    $speed.text(point.speed);
  }
}

function updateSpeed() {
  if (points.length > 1) {
    var p1 = points[points.length - 2];
    var p2 = points[points.length - 1];
    var distance = distanceBetween(p2, p1);  // meters
    var time = (p2.timestamp - p1.timestamp) / 1000 / 60 / 60;  // hours
    var divisor = settings.units === 'metric' ? 1000 : 1609;
    if (time > 0) {
      var speed = (distance / time) / divisor;
      if (speed < 5) {
        speed = speed.toFixed(1);
      } else {
        speed = Math.round(speed);
      }
      $val.text(speed);
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
}

function updateGPSAccuracy(point) {
  if(point.accuracy > 25) {
    $gpsBars.addClass('one').removeClass('two').removeClass('three');
    $gpsMessage.text('GPS Signal Weak');
  } else if (point.accuracy > 6) {
    $gpsBars.addClass('two').removeClass('one').removeClass('three');
    $gpsMessage.text('GPS Signal OK');
  } else {
    $gpsBars.addClass('three').removeClass('one').removeClass('two');
    $gpsMessage.text('GPS Signal OK');
  }
}

})(jQuery);
