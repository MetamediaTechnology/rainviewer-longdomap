# RainViewer-LongdoMap
This repository is basic example of using Longdo Map with rain viewer API.
<img width="1440" alt="Screen Shot 2564-09-19 at 17 37 55" src="https://user-images.githubusercontent.com/20718635/133924425-1861cb95-9539-4262-ad4a-eb6a75052352.png">
<br>
### Installation 
This is repository you don't need to install dependencies anything. After clone this repo you will have a key to use the Map service, which is free. Can read more document https://map.longdo.com/docs/

### How it use
1. Import rainradar.js into html file.
```
<script src="./lib/rainradar.js"></script>
```
2. script function.
```
 var rainRadar = new RainRadar(map,options);
```
<u>Parameter</u><br>
<b>map</b> : Map object (Required) <br>
<b>options></b> : Initial setup your rain radar (optional) <br>
Example
```
{
  opacity: 0.5,             // Opacity display in map.
  color: 4,                 // Color radar you can read more at : https://www.rainviewer.com/api/color-schemes.html
  tileSize: 256,             // image size, can be 256 or 512.
  timeDisplay: 'timeradar'   // If you want to display time of radar you can set id element.
 }
```
<br>

### Methods

```
setOpacity().   // Set opacity for layer 0 - 0.9
setColor().     // Set color rain radar colors.
nextRadar();    // Next radar.
previosRadar(); // Previos radar.
radarNow();     // Display current time rain radar.
playAnimation() // Change radar automation. You can set time (ms) in this funtion
reload();       // Hot reload weather radar
```


