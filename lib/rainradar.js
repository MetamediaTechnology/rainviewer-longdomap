function RainRadar(map, options) {
	var _this = this;
	this.map = map;
	this.apiData = [];

	this.isDisplay = true;

	this.timeDisplay = options.timeDisplay || null; // Display time of frames radar
	this.locale = options.locale || 'th-Th';

	this.tileSize = options.tileSize || 512; // image size, can be 256 or 512.
	this.animation = false;
	this.radarColor = options.color || 7;
	this.opacity = options.opacity || 0.7;
	this.smooth = options.smooth || 0;
	this.snow = options.snow || 1;

	this.currentLayer = null;
	this.layerkey = 'rain_radar'

	// Radar frames
	this.mapFrames = [];

	// Radar control
	var _nowPosition = 12;
	this.animationPosition = _nowPosition; // default now 

	// animation
	this.isAnimation = false;
	this.animationInterval = null;
	this.animationSpeed = options.speed || 2000; // 2s / frames


	getWeatherMap()

	_this.map.Event.bind('zoom', () => {
		if (_this.isDisplay) {
			addLayer()
		}
	})
	_this.map.Event.bind("resize", () => {
		if (_this.isDisplay) {
			addLayer()
		}
	});

	function getWeatherMap() {
		try {
			let apiRequest = new XMLHttpRequest();
			apiRequest.open(
				"GET", "https://api.rainviewer.com/public/weather-maps.json", true,
			);
			apiRequest.onload = function (e) {
				if (!_this.apiData) throw new Error(`Can't get data`);
				_this.apiData = JSON.parse(apiRequest.response);
				initialize()
			};
			apiRequest.send();
		} catch (error) {
			_this.apiData = [];
		}
	}

	function initialize() {
		var map_frames_length = 0;
		if (_this.apiData.radar && _this.apiData.radar.past) {
			_this.mapFrames = _this.apiData.radar.past;
			if (_this.apiData.radar.nowcast) {
				_this.mapFrames = _this.mapFrames.concat(_this.apiData.radar.nowcast);
				map_frames_length = _this.mapFrames.length;
			}
		}
		_this.animationPosition = map_frames_length - 4;
		const frame = _this.mapFrames[_this.animationPosition]
		addLayer(frame)
	}

	function addLayer(frame) {
		_this.isDisplay = true;
		if (!frame) {
			frame = _this.mapFrames[_this.animationPosition];
		}
		if (!frame) {
			return false;
		}
		var indexLayer = getLayersRadar();
		if (!_this.currentLayer || indexLayer === -1) {
			_this.currentLayer = new longdo.Layer(_this.layerkey, {
				type: longdo.LayerType.Custom,
				opacity: _this.opacity,
				url: function (projection, tile, zoom, hd) {
					return ("https://tilecache.rainviewer.com" + frame.path + "/" + _this.tileSize + "/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/" + _this.smooth + "_" + _this.snow + ".png");
				},
			});
			_this.map.Layers.add(_this.currentLayer);
		} else {
			if (indexLayer !== -1) {
				let longdoLayer = map.Layers.list();
				longdoLayer[indexLayer] = new longdo.Layer(_this.layerkey, {
					type: longdo.LayerType.Custom,
					opacity: _this.opacity,
					url: function (projection, tile, zoom, hd) {
						return ("https://tilecache.rainviewer.com" + frame.path + "/" + _this.tileSize + "/" + zoom + "/" + tile.u + "/" + tile.v + "/" + _this.radarColor + "/" + _this.smooth + "_" + _this.snow + ".png");
					},
				});
			}
		}
		_this.displayRadarTime(frame.time)
	}


	function getLayersRadar() {
		var longdoLayer = map.Layers.list();
		var layerNameList = longdoLayer.map((layerName) => {
			return layerName.name();
		});
		return layerNameList.indexOf(_this.layerkey);
	}


	// Control rain layer
	function changeLayer(control = '') {
		var newLayer = null;
		var nowLayer = _this.mapFrames[_this.animationPosition];
		switch (control) {
			case 'next': {
				if ((_this.animationPosition += 1) == 16) {
					_this.animationPosition = _nowPosition
					newLayer = _this.mapFrames[_this.animationPosition]
				} else {
					newLayer = _this.mapFrames[_this.animationPosition]
				}
				changeImages(newLayer, nowLayer)
				return
			}
			case 'back': {
				if ((_this.animationPosition -= 1) < _nowPosition) {
					_this.animationPosition = _this.mapFrames.length - 1
					newLayer = _this.mapFrames[_this.animationPosition]
				} else {
					newLayer = _this.mapFrames[_this.animationPosition]
				}
				changeImages(newLayer, nowLayer)
				return
			}
			case 'now': {
				_this.animationPosition = _nowPosition;
				_this.reload()
			}
		}
	}
	function changeImages(newLayer, now_layer) {
		_this.displayRadarTime(newLayer.time)
		document.querySelectorAll('img[alt="Map tile"]').forEach((tileImg) => {
			let tileUrl = tileImg.src;
			const {
				hostname
			} = new URL(tileUrl);
			if (hostname === "tilecache.rainviewer.com") {
				const replacePath = tileUrl.replace(now_layer.path, `${newLayer.path}`);
				tileImg.src = replacePath;
			}
		});
	}


	/**
	 * @todo Changes rain layer automation every 2s (default) / layers
	 * @param {number} speed Speed can set interval loop millisecond units
	 * @callback Boolean
	 */
	this.playAnimation = (speed) => {
		_this.isDisplay = true;
		if (speed) _this.animationSpeed = Number.parseInt(speed) || 1000;
		if (!_this.isAnimation) {
			_this.isAnimation = true;
			_this.animationInterval = setInterval(() => {
				_this.rainNext()
			}, _this.animationSpeed);
		} else {
			clearInterval(_this.animationInterval);
			_this.isAnimation = false;
			_this.rainNow();
		}
		return _this.isAnimation;
	};

	this.rainNext = () => {
		changeLayer('next')
	}

	this.rainBack = () => {
		changeLayer('back')
	}

	this.rainNow = () => {
		changeLayer('now')
	}

	this.reload = () => {
		this.clearLayers();
		addLayer();
		if (_this.isAnimation) {
			_this.animationInterval = setInterval(() => {
				_this.rainNext()
			}, _this.animationSpeed);
		}
	}

	this.clearLayers = (isClear = true) => {
		if (isClear) {
			const index = getLayersRadar();
			if (index >= 0) {
				const rainLayer = map.Layers.list()[getLayersRadar()];
				if (rainLayer) {
					_this.map.Layers.remove(rainLayer)
				}
			}
		}
		if (_this.animationInterval) {
			clearInterval(_this.animationInterval)
		}
		_this.isDisplay = false;
		return true;
	}

	/**
   * @todo Display radar time 
   * @param {Datetime} datetime return html 
   * @callback Datetime
   */
	this.displayRadarTime = (time) => {
		if (_this.timeDisplay !== null) {
			const el = document.getElementById(_this.timeDisplay);
			if (!el) {
				return false;
			}

			el.innerHTML = new Date(
				time * 1000
			).toLocaleDateString(_this.locale, {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
			});
		}
	};

	/**
	   *
	   * @param {number} Opacity Opacity radar map
	   */
	this.setOpacity = (opacity) => {
		_this.opacity = opacity;
		_this.reload()
	};

	/**
	   *
	   * @param {number} color Color radar map
	   */
	this.setColor = (color) => {
		_this.radarColor = color;
		_this.reload()
	};

	/**
	   *
	   * @param {string} locale Locale radar map
	   */
	 this.setLocale = (locale) => {
		_this.locale = locale || 'th-Th';
		_this.reload()
	};

};
