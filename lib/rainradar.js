function RainRadar(map, options) {
	var _this = this;
	// Map Object
	this.map = null;
	this.apiData = null;
	// Setting Radar
	this.display = true,
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

	map.Event.bind("drop", () => {
		addLayer();
	});
	map.Event.bind("zoom", () => {
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
			apiRequest.onload = function (e) {
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
		let longdoLayer = map.Layers.list();
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
		if (!_this.display) return;
		var indexLayer = getLayersRadar();
		if (!_this.currentLayer || indexLayer === -1) {
			_this.currentLayer = new longdo.Layer(_this.layerkey, {
				type: longdo.LayerType.Custom,
				opacity: _this.opacity,
				url: function (projection, tile, zoom, hd) {
					return ("https://tilecache.rainviewer.com" + frame.path + "/" + _this.tileSize + "/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/1_1.png");
				  },
			});
			map.Layers.add(_this.currentLayer);
		} else {
			if (indexLayer !== -1) {
				let longdoLayer = map.Layers.list();
				longdoLayer[indexLayer] = new longdo.Layer(_this.layerkey, {
					type: longdo.LayerType.Custom,
					opacity: _this.opacity,
					url: function (projection, tile, zoom, hd) {
						return ("https://tilecache.rainviewer.com" + frame.path + "/" + _this.tileSize + "/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/1_1.png");
					  },
				});
			}
		}
		_this.displayRadarTime(frame.time)
	}

	function changeLayer(action) {
		let nextLayer = null;
		let currentLayer = _this.mapFrames[_this.animationPosition];
		switch (action) {
			case 'NEXT':
				nextLayer = _this.mapFrames[_this.animationPosition + 1];
				break;
			case 'PREVIOS':
				nextLayer = _this.mapFrames[_this.animationPosition - 1];
				break;
			case 'START':
				nextLayer = _this.mapFrames[0]
				break
			case 'END':
				nextLayer = _this.mapFrames[_this.mapFrames.length - 1]
				break
		}
		_this.displayRadarTime(nextLayer.time)
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
	this.clearLayers = (isClear = false) => {
		if (isClear) {
			const rainLayer = map.Layers.list()[getLayersRadar()];
			map.Layers.remove(rainLayer)
		}
		_this.display = isClear;
		clearInterval(_this.animationInterval)
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
				_this.next()
			}, _this.animationSpeed);
		} else {
			clearInterval(_this.animationInterval);
			_this.isAnimation = false;
		}
		return _this.isAnimation;
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
	this.radarNow = () => {
		getWeatherMap()
	}
	this.next = () => {
		if (_this.animationPosition == _this.mapFrames.length - 1) {
			changeLayer('START')
			_this.animationPosition = 0
		} else {
			changeLayer('NEXT')
			_this.animationPosition += 1;
		}
	};
	this.previos = () => {
		if (!_this.animationPosition <= 0) {
			changeLayer('PREVIOS')
			_this.animationPosition -= 1;
		} else {
			changeLayer('END')
			_this.animationPosition = _this.mapFrames.length - 1
		}
	};
}