"use strict";

/**
 * Construtor
 * @param {object} map Map object
 * @param {Number} Color Set color radar 
 * @param {Number} Opacity Opaciy radar 0.0 - 1
 */
function RainRadar(map, color, opacity) {
    var _this = this
    // Map Object
    this.map = null;
    this.apiData = null;
    // Seting Radar
    this.optionKind = 'radar'  //defult redar
    this.animation = false
    this.radarColor = color || 2;
    this.opacity = opacity || 0.7;
    // Radar zone
    this.autoGetData = false
    this.autoGetDataTime = 60000 // 10 minute Default
    this.getDataInterval = false
    this.radarLayers = []
    this.mapFrames = []
    this.lastPastFramePosition = 0;
    this.currentLayer = null;
    // Radar control
    this.isAnimation = false,
    this.animationInterval = null
    this.animationPosition = 0;
    this.animationSpeed = 2000 // 2s / frames

    getWeatherMap()

    function getWeatherMap() {
        let apiRequest = new XMLHttpRequest();
        apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
        apiRequest.onload = function (e) {
            _this.apiData = JSON.parse(apiRequest.response);
            initialize()
        };
        apiRequest.send();
    }

    function initialize() {
        _this.mapFrames = []
        _this.radarLayers = []
        _this.animationPosition = 0

        if (!_this.apiData) throw new Error(`Can't get data`)

        if (_this.apiData.radar && _this.apiData.radar.past) {
            _this.mapFrames = _this.apiData.radar.past;
            if (_this.apiData.radar.nowcast) {
                _this.mapFrames = _this.mapFrames.concat(_this.apiData.radar.nowcast);
            }

            // show the last "past" frame
            _this.lastPastFramePosition = _this.apiData.radar.past.length - 1;
            showFrame(_this.lastPastFramePosition)
        }
    }

    function showFrame(framePostion) {
        var frame = _this.mapFrames[framePostion]
        if (_this.animationPosition == _this.mapFrames.length) {
            _this.animationPosition = 0
            _this.lastPastFramePosition = 0
            showFrame(_this.lastPastFramePosition)
        } else {
            addLayer(frame, getLayersRadar())
        }
    }

    function addLayer(frame, currentLayer) {
        var rainLayer = new longdo.Layer(`rainLayers-${[frame.path]}`, {
            type: longdo.LayerType.Custom,
            opacity: _this.opacity,
            url: function (projection, tile, zoom, hd) {
                return ("https://tilecache.rainviewer.com" + frame.path + "/256/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/1_0.png");
            }
        });
        if (currentLayer != -1) {
            console.log(map.Layers.list());
            var currentLayerObj = map.Layers.list()[currentLayer]
            map.Layers.remove(currentLayerObj)

        }
        _this.currentLayer = frame.path
        _this.displayRadarTime(frame.time)
        map.Layers.add(rainLayer)
    }

    function getLayersRadar() {
        var longdoLayer = map.Layers.list()
        var layerNameList = longdoLayer.map((layerName) => {
            return layerName.name();
        })
        return layerNameList.indexOf('rainLayers-' + _this.currentLayer)
    }

    /**
     * 
     * @todo Hot reload radar layer
     */
    this.reloadRadar = () => {
        initialize()
    }
    /**
     * 
     * @param {number} color Color radar map
     */
    this.setColor = (color) => {
        _this.radarColor = color
    }
    /**
     * 
     * @param {number} Opacity Opacity radar map
     */
    this.setOpacity = (opacity) => {
        _this.opacity = opacity
    }

    this.autoGetData = (time) => {
        if (time) _this.autoGetDataTime = Number.parseInt(time) || 60000
        if (!_this.autoGetData) {
            _this.autoGetData = true
            _this.getDataInterval = setInterval(() => {
                this.initialize()
            })
        } else {
            _this.autoGetData = false
            clearInterval(_this.getDataInterval)
        }
    }

    /**
     * @todo Change rain layer automation every 2s (default) / layers 
     * @param {number} speed Speed can set interval loop millisecond units
     * @callback Boolean
     */
    this.playAnimation = (speed) => {
        if (speed) _this.animationSpeed = Number.parseInt(speed) || 1000
        if (!_this.isAnimation) {
            _this.isAnimation = true;
            _this.animationInterval = setInterval(() => {
                this.nextRadar()
            }, _this.animationSpeed);
        } else {
            clearInterval(_this.animationInterval)
            _this.isAnimation = false
        }
        return _this.isAnimation
    }
    this.radarNow = () => {
        _this.animationPosition = _this.mapFrames.length - 4;
        _this.lastPastFramePosition = _this.animationPosition
        showFrame(_this.lastPastFramePosition)
    }
    this.nextRadar = () => {
        _this.animationPosition = _this.lastPastFramePosition
        _this.animationPosition += 1
        _this.lastPastFramePosition = _this.animationPosition
        showFrame(_this.animationPosition)
    }
    this.previosRadar = () => {
        _this.animationPosition = _this.lastPastFramePosition
        _this.animationPosition -= 1
        _this.lastPastFramePosition = _this.animationPosition
        showFrame(_this.animationPosition)
    }
    this.displayRadarTime = (time) => {
        try {
            document.getElementById('radartime').innerHTML = new Date(time * 1000).toLocaleDateString('th-Th', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            })
        } catch (error) {
            console.log('Can not set time element')
        }
    }
}
