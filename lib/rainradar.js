"use strict";

/**
 * Construtor
 * @param {object} map Map object
 * @param {Number} Color Set color radar
 * @param {Number} Opacity Opaciy radar 0.0 - 1
 */
function RainRadar(map, options) {
  var _this = this;
  // Map Object
  this.map = null;
  this.apiData = null;
  // Setting Radar
  this.timeDisplay = options.timeDisplay || null;           // Display time of frames radar
  this.optionKind = "radar";                                //defult radar
  this.tileSize = options.tileSize || 256;                  // image size, can be 256 or 512.
  this.animation = false;
  this.radarColor = options.color || 2;
  this.opacity = options.opacity || 0.7;
  // Radar zone
  this.isReload = options.automation || false;
  this.reloadTime = 60000;                                  // 10 minute default time reload
  this.getDataInterval = false;
  this.radarLayers = [];
  this.mapFrames = [];
  this.lastPastFramePosition = 0;
  this.currentLayer = null;
  // Radar control
  this.isAnimation = false;
  this.animationInterval = null;
  this.animationPosition = 0;
  this.animationSpeed = 2000; // 2s / frames

  getWeatherMap();

  function getWeatherMap() {
    try {
      let apiRequest = new XMLHttpRequest();
      apiRequest.open(
        "GET",
        "https://api.rainviewer.com/public/weather-maps.json",
        true
      );
      apiRequest.onload = function (e) {
        _this.apiData = JSON.parse(apiRequest.response);
        initialize();
      };
      apiRequest.send();
    } catch (error) {
      _this.apiData = []
    }
  }

  function initialize() {
    _this.mapFrames = [];
    _this.radarLayers = [];
    _this.clearLayers()

    if (!_this.apiData) throw new Error(`Can't get data`);
    if (_this.apiData.radar && _this.apiData.radar.past) {
      _this.mapFrames = _this.apiData.radar.past;
      if (_this.apiData.radar.nowcast) {
        _this.mapFrames = _this.mapFrames.concat(_this.apiData.radar.nowcast);
      }
      _this.lastPastFramePosition = _this.apiData.radar.past.length - 1;
      _this.animationPosition = _this.lastPastFramePosition
      showFrame(_this.lastPastFramePosition);
    }
  }

  function showFrame(framePostion) {
    if (_this.animationPosition == _this.mapFrames.length) {
      _this.animationPosition = 0
      framePostion = _this.animationPosition
    }
    if (_this.animationPosition < 0) {
      _this.animationPosition = _this.mapFrames.length - 1
      framePostion = _this.animationPosition
    }
    var frame = _this.mapFrames[framePostion];
    addLayer(frame, getLayersRadar());
  }

  function addLayer(frame, currentLayer) {
    _this.currentLayer = frame.path
    if (!_this.radarLayers[frame.path]) {
      _this.radarLayers[frame.path] = new longdo.Layer(`rainLayers-${[frame.path]}`, {
        type: longdo.LayerType.Custom,
        opacity: _this.opacity,
        url: function (projection, tile, zoom, hd) {
          return ("https://tilecache.rainviewer.com" + frame.path + "/" + _this.tileSize + "/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/1_0.png");
        },
      }
      );
      if (currentLayer != -1) {
        var currentLayerObj = map.Layers.list()[currentLayer];
        currentLayerObj.opacity = 0
      }
      _this.currentLayer = frame.path;
      _this.displayRadarTime(frame.time);
      map.Layers.add(_this.radarLayers[frame.path]);
    } else {
      var indexNowLayer = getLayersRadar(frame.path)
      var currentLayerObj = map.Layers.list()[currentLayer];
      var nextRadarLayerObj = map.Layers.list()[indexNowLayer]
      if (!nextRadarLayerObj) {
        getWeatherMap()
        return
      }
      if (indexNowLayer != -1) {
        nextRadarLayerObj.opacity = _this.opacity
        _this.displayRadarTime(frame.time);
        _this.currentLayer = frame.path
        map.Layers.remove(currentLayerObj)
      } else {
        var currentLayerObj = map.Layers.list()[currentLayer];
        map.Layers.remove(currentLayerObj)
      }
    }
  }


  function getLayersRadar(layerPath) {
    var longdoLayer = map.Layers.list();
    var layerNameList = longdoLayer.map((layerName) => {
      return layerName.name();
    });
    if (layerPath) {
      return layerNameList.indexOf("rainLayers-" + layerPath);
    } else {
      return layerNameList.indexOf("rainLayers-" + _this.currentLayer);
    }
  }

  this.debugData = () => {
    // console.log('Map Frame');
    // console.log(_this.mapFrames);
    // console.log('Radar layer');
    // console.log(_this.radarLayers);
    // console.log('Longdo Map Layer');
    // console.log(map.Layers.list());
    console.log('CURRENT');
    console.log(_this.currentLayer);
    console.log(_this.radarLayers);
  }

  /**
   *
   * @todo Hot reload radar layer
   */
  this.fourceReload = () => {
    getWeatherMap();
  };
  /**
   *
   * @param {number} color Color radar map
   */
  this.setColor = (color) => {
    _this.radarColor = color;
  };
  /**
   *
   * @param {number} Opacity Opacity radar map
   */
  this.setOpacity = (opacity) => {
    _this.opacity = opacity;
  };

  this.reload = (time) => {
    if (time) _this.reloadTime = Number.parseInt(time) || 60000;
    if (!_this.isReload) {
      _this.isReload = true;
      _this.getDataInterval = setInterval(() => {
        getWeatherMap();
      }, _this.reloadTime);
    } else {
      _this.isReload = false;
      clearInterval(_this.getDataInterval);
    }
  };

  this.clearLayers = (init) => {
    if (init) {
      return
    }
    var rainLayers = Object.keys(_this.radarLayers)
    rainLayers.map((rainLayerName, index) => {

      var longdoLayer = map.Layers.list();
      var layerNameList = longdoLayer.map((layerName) => {
        return layerName.name();
      });
      var indexOfLayer = layerNameList.indexOf("rainLayers-" + rainLayerName);
      if ((index + 1) === rainLayers.length) {
        var oneRainLayer = longdoLayer[indexOfLayer]
        map.Layers.remove(oneRainLayer)
      } else {
        indexOfLayer !== -1 ? longdoLayer.splice(indexOfLayer, 1) : false
      }

    })

    return true;
  }

  /**
   * @todo Changes rain layer automation every 2s (default) / layers
   * @param {number} speed Speed can set interval loop millisecond units
   * @callback Boolean
   */
  this.playAnimation = (speed) => {
    if (speed) _this.animationSpeed = Number.parseInt(speed) || 1000;
    if (!_this.isAnimation) {
      _this.isAnimation = true;
      _this.animationInterval = setInterval(() => {
        _this.nextRadar()
      }, _this.animationSpeed);
    } else {
      clearInterval(_this.animationInterval);
      _this.isAnimation = false;
    }
    return _this.isAnimation;
  };
  this.radarNow = () => {
    _this.animationPosition = _this.mapFrames.length - 4;
    _this.lastPastFramePosition = _this.animationPosition;
    showFrame(_this.lastPastFramePosition);
  };
  this.nextRadar = () => {
    _this.animationPosition += 1;
    showFrame(_this.animationPosition);
  };
  this.previosRadar = () => {
    _this.animationPosition -= 1;
    showFrame(_this.animationPosition);
  };
  this.displayRadarTime = (time) => {
    if (_this.timeDisplay !== null) {
      document.getElementById(_this.timeDisplay).innerHTML = new Date(
        time * 1000
      ).toLocaleDateString("th-Th", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    }
  };
}
