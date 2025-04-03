![Longdo Map Logo](https://map.longdo.com/themes/longdo/logo.png)

# Rain Viewer - Longo Map JS API 2
![Rain Viewer on Longdo Map](https://raw.githubusercontent.com/MetamediaTechnology/rainviewer-longdomap/main/screenshot/preview.gif)

This plugin integrates RainViewer's weather radar data with the Longdo Map JS API, allowing you to display real-time precipitation radar on your maps.

## Getting Started
### Usage
First, you need to get a [Longdo Map API key](https://map.longdo.com/docs/javascript/getapi). 
Then, after you have Longdo Map API key and cloned this project, you need to register it to your index.html file.

#### Register map api key
STEP 1 : Loading the API Code Libraries
Using the following script within tag
```js
<script src="https://api.longdo.com/map/?key=[YOUR_KEY_API]"></script>
```
STEP 2 : Initialize the Map
Using JavaScript function for creating longdo.Map object within tag
```js
var map;
function init() {
  map = new longdo.Map({
    placeholder: document.getElementById('map')
  });
}
```
STEP 3 : Complete with HTML
Create Div element and using onload for creating map within tag.
```html
<body onload="init();">
  <div id="map"></div>
</body>
```

#### Add script rainradar.js
STEP1: Import rainradar.js into html file.
```js
<script src="./lib/rainradar.js"></script>
```
STEP2: Using JavaScript function for creating rain radar layer on map.
```js
 var rainRadar = new RainRadar(map, options);
```
#### Parameter
map : Map object (Required).
options : Initial setup your rain radar (optional).
Example
```js
{
  opacity: 0.5,                // Opacity display in map.
  color: 4,                    // Color radar you can read more at : https://www.rainviewer.com/api/color-schemes.html
  locale: 'th-Th',            // Locale of displying datetime eg. "th-Th", "en-Us"
  tileSize: 256,              // image size, can be 256 or 512.
  timeDisplay: 'timeradar',   // If you want to display time of radar you can set id element.
  smooth: 0,                  // blur (1) or not (0) radar data. Large composite images are always not smoothed due to performance issues.
  snow: 1,                    // display (1) or not (0) snow in separate colors on the tiles.
  speed: 2000                 // set speed for animation frame (milisecond)
 }
```
#### Methods
```js
setOpacity()     // Set opacity for layer 0 - 0.9
setColor()       // Set color rain radar colors.
setLocale()      // Set locale of displying datetime eg. "th-Th", "en-Us"
rainNext()       // Next radar.
rainBack()       // Previos radar.
rainNow()        // Display current time rain radar.
playAnimation()  // Change radar automation. You can set time (ms) in this funtion
reload()         // Hot reload weather radar
```
#### Summary
```js
 var map = new longdo.Map({
      placeholder: document.getElementById("map"),
    });

    var rainRadar = new rainradar(map,{
      opacity: 0.5,
      color: 2,
      tileSize: 256,
      speed: 500,
      timeDisplay: 'timeradar'
    });

    function next() {
      rainRadar.rainNext();
    }
    function previos() {
      rainRadar.rainBack();
    }
    function radarNow() {
      rainRadar.rainNow();
    }
    function changeOpacity(e) {
      const val = e.target.value
      rainRadar.setOpacity(val)
    }
    function play() {
     const playButton = document.getElementById('play');
     const isPlayed =  rainRadar.playAnimation();
     if (isPlayed) {
        playButton.innerHTML = 'Stop';
     } else {
        playButton.innerHTML = 'Play';
     }
    }
    function clearLayer() {
      rainRadar.clearLayers();
    }
```

## References
* [Longdo Map](https://map.longdo.com/products)
* [Longdo Map API Documentation](https://map.longdo.com/docs/)
* [RainViewer API](https://www.rainviewer.com/th/api.html)
