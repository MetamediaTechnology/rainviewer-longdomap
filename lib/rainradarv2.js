function RainRadar(map, options) {
	var _this = this;
	// Map Object
	this.map = null;
	this.apiData = null;
	// Setting Radar
	this.timeDisplay = options.timeDisplay || null; // Display time of frames radar
	this.optionKind = "radar"; //defult radar
	this.tileSize = options.tileSize || 256; // image size, can be 256 or 512.
	this.animation = false;
	this.radarColor = options.color || 2;
	this.opacity = options.opacity || 0.7;
	// Radar zone
	this.isReload = options.automation || false;
	this.reloadTime = 60000; // 10 minute default time reload
	this.getDataInterval = false;
	this.mapFrames = [];
	this.lastPastFramePosition = 0;
	this.currentLayer = null;
	this.layerkey = "rainRadarLayers";
	// Radar control
	this.isAnimation = false;
	this.animationInterval = null;
	this.animationPosition = 0;
	this.animationSpeed = 2000; // 2s / frames

	getWeatherMap();

	map.Event.bind("zoom", function() {
		console.log("aa");
		addLayer();
	});

	function getWeatherMap() {
		try {
			let apiRequest = new XMLHttpRequest();
			apiRequest.open(
				"GET",
				"https://api.rainviewer.com/public/weather-maps.json",
				true
			);
			apiRequest.onload = function(e) {
				_this.apiData = JSON.parse(apiRequest.response);
				initialize();
			};
			apiRequest.send();
		} catch (error) {
			_this.apiData = [];
		}
	}

	function initialize() {
		_this.mapFrames = [];
		if (!_this.apiData) throw new Error(`Can't get data`);
		if (_this.apiData.radar && _this.apiData.radar.past) {
			_this.mapFrames = _this.apiData.radar.past;
			if (_this.apiData.radar.nowcast) {
				_this.mapFrames = _this.mapFrames.concat(_this.apiData.radar.nowcast);
			}
			_this.lastPastFramePosition = _this.apiData.radar.past.length - 1;
			_this.animationPosition = _this.lastPastFramePosition;
			showFrame(_this.lastPastFramePosition);
		}
	}

	function getLayersRadar() {
		var longdoLayer = map.Layers.list();
		var layerNameList = longdoLayer.map((layerName) => {
			return layerName.name();
		});
		return layerNameList.indexOf(_this.layerkey);
	}

	function showFrame(framePostion) {
		if (_this.animationPosition == _this.mapFrames.length) {
			_this.animationPosition = 0;
			framePostion = _this.animationPosition;
		}
		if (_this.animationPosition < 0) {
			_this.animationPosition = _this.mapFrames.length - 1;
			framePostion = _this.animationPosition;
		}
		var frame = _this.mapFrames[framePostion];
		addLayer(frame);
	}

	function addLayer(frame) {
		if (!frame) {
			frame = _this.mapFrames[_this.animationPosition];
		}
		if (!_this.currentLayer) {
			_this.currentLayer = new longdo.Layer(_this.layerkey, {
				type: longdo.LayerType.Custom,
				opacity: _this.opacity,
				url: function(projection, tile, zoom, hd) {
					return (
						"https://tilecache.rainviewer.com" +
						frame.path +
						"/" +
						_this.tileSize +
						"/" +
						zoom +
						"/" +
						tile.u +
						"/" +
						tile.v +
						"/" +
						_this.radarColor +
						"/1_0.png"
					);
				},
			});
			map.Layers.add(_this.currentLayer);
		} else {
			let indexLayer = getLayersRadar();
			if (indexLayer !== -1) {
				let longdoLayer = map.Layers.list();
				longdoLayer[indexLayer] = new longdo.Layer(_this.layerkey, {
					type: longdo.LayerType.Custom,
					opacity: _this.opacity,
					url: function(projection, tile, zoom, hd) {
						return (
							"https://tilecache.rainviewer.com" +
							frame.path +
							"/" +
							_this.tileSize +
							"/" +
							zoom +
							"/" +
							tile.u +
							"/" +
							tile.v +
							"/" +
							_this.radarColor +
							"/1_0.png"
						);
					},
				});
			}
		}
	}

	function changeLayer(action) {
        let nextLayer = null;
        let currentLayer =  _this.mapFrames[_this.animationPosition];
        switch(action) {
            case 'NEXT':
                nextLayer = _this.mapFrames[_this.animationPosition + 1];
                break;
            case 'PREVIOS':
                nextLayer = _this.mapFrames[_this.animationPosition - 1];
                break;
        }
        document.querySelectorAll('img[alt="Map tile"]').forEach((tileImg) => {
            let tileUrl = tileImg.src;
            const {
                hostname
            } = new URL(tileUrl);
            if (hostname === "tilecache.rainviewer.com") {
                const replacePath = tileUrl.replace(currentLayer.path, `/${nextLayer.path}`);
                tileImg.src = replacePath;
            }
        });
		
	}
	this.next = () => {
		changeLayer('NEXT')
        _this.animationPosition == _this.mapFrames.length ? console.log('55'):  _this.animationPosition += 1
	};
	this.previos = () => {
		changeLayer('PREVIOS')
        _this.animationPosition -= 1
	};
}