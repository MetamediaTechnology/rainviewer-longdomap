![Longdo Map Logo](https://map.longdo.com/themes/longdo/logo.png)

# rainviewer - longomap
Longdo Map rain radar 
<img width="1440" alt="Screen Shot 2564-09-19 at 17 37 55" src="https://user-images.githubusercontent.com/20718635/133924425-1861cb95-9539-4262-ad4a-eb6a75052352.png">

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
 var rainRadar = new rainradar(map,options);
```
#### Parameter
map : Map object (Required).
options : Initial setup your rain radar (optional).
Example
```js
{
  opacity: 0.5,                // Opacity display in map.
  color: 4,                    // Color radar you can read more at : https://www.rainviewer.com/api/color-schemes.html
  tileSize: 256,              // image size, can be 256 or 512.
  timeDisplay: 'timeradar'    // If you want to display time of radar you can set id element.
 }
```
#### Methods
```js
setOpacity().     // Set opacity for layer 0 - 0.9
setColor().       // Set color rain radar colors.
rainNext();       // Next radar.
rainBack();       // Previos radar.
rainNow();        // Display current time rain radar.
playAnimation()   // Change radar automation. You can set time (ms) in this funtion
reload();          // Hot reload weather radar
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
     const playButton = document.getElementById('play')
     const isPlayed =  rainRadar.playAnimation()
     if(isPlayed){
        playButton.innerHTML = 'Stop';
     } else {
        playButton.innerHTML = 'Play';
     }
    }
    function clearLayer(){
      rainRadar.clearLayers(true)
    }
```

## References
* [Longdo Map](https://map.longdo.com/products)
* [Longdo Map API Documentation](https://map.longdo.com/docs/)
* [RainViewer API](https://www.rainviewer.com/th/api.html)
