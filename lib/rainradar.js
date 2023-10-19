function RainRadar(map, options) {
	const _this = this;
	const {
		timeDisplay = null,
		locale = "th-Th",
		tileSize = 512,
		color = 7,
		opacity = 0.7,
	} = options;

	this.map = map;
	this.enableCoverage = true;
	this.apiData = [];
	this.isDisplay = true;
	this.timeDisplay = timeDisplay;
	this.animationSpeed = 500;
	this.animationInterval = null;
	this.locale = locale;
	this.tileSize = tileSize;
	this.animation = false;
	this.radarColor = color;
	this.opacity = opacity;
	this.mapFrames = [];
	this.layerChangeTimer = null;
	this.animationPosition = 12;

	this.initialize = () => {
		getWeatherMap();
		_this.map.Event.bind("layerChange", () => {
			clearInterval(_this.animationInterval);
			if (_this.layerChangeTimer) {
				clearTimeout(_this.layerChangeTimer);
			}
			_this.layerChangeTimer = setTimeout(function () {
				removeRainLayers();
			}, 1000);
		});
	};

	function removeRainLayers() {
		const removePromise = new Promise((resolve, reject) => {
			resolve(
				_this.mapFrames.forEach((frame) => {
					if (_this.map.Renderer.getLayer(`rainviewer_${frame.path}`)) {
						_this.map.Renderer.removeLayer(`rainviewer_${frame.path}`);
						_this.map.Renderer.removeSource(`rainviewer_${frame.path}`);
					}
				})
			);
		});
		removePromise.then(() => {
			addLayers();
		});
	}

	function getWeatherMap() {
		try {
			const apiRequest = new XMLHttpRequest();
			apiRequest.open(
				"GET",
				"https://api.rainviewer.com/public/weather-maps.json",
				true
			);
			apiRequest.onload = function () {
				if (!_this.apiData) {
					_this.apiData = [];
					return;
				}
				_this.apiData = JSON.parse(apiRequest.response);
				initializeMapFrames();
			};
			apiRequest.send();
		} catch (error) {
			_this.apiData = [];
		}
	}

	function initializeMapFrames() {
		const { past, nowcast } = _this.apiData.radar;
		if (past) {
			_this.mapFrames = [...past];
			_this.animationPosition = past.length - 1;
			const startPastPosition = _this.animationPosition - 3;
			if (nowcast) {
				_this.mapFrames = _this.mapFrames.concat(nowcast);
			}
			_this.animationPosition = startPastPosition;
			_this.map.Event.bind("ready", () => {
				_this.map.Renderer.on("load", () => {
					addLayers();
					converageLayer();
				});
			});
		}
	}

	function converageLayer() {
		const isExist = _this.map.Renderer.getLayer('rainviewer_coverage')
		if (_this.enableCoverage) {
			_this.map.Renderer.addLayer({
				id: "rainviewer_coverage",
				type: "raster",
				source: {
					type: "raster",
					tiles: [
						`${_this.apiData.host}/v2/coverage/0/512/{z}/{x}/{y}/0/0_0.png`,
					],
					tileSize: _this.tileSize,
				},
				paint: {
					"raster-opacity": 0.2,
				},
			});
		} else {
			if (isExist) {
				_this.map.Renderer.removeLayer("rainviewer_coverage");
				_this.map.Renderer.removeSource("rainviewer_coverage");
			}
		}
	}

	function addLayers() {
		_this.mapFrames.forEach((frame) => {
			const layerExist = _this.map.Renderer.getSource(
				`rainviewer_${frame.path}`
			);
			if (!layerExist) {
				_this.map.Renderer.addLayer({
					id: `rainviewer_${frame.path}`,
					type: "raster",
					source: {
						type: "raster",
						tiles: [
							`${_this.apiData.host}/v2/radar/${frame.path}/${_this.tileSize}/{z}/{x}/{y}/${_this.radarColor}/1_1.png`,
						],
						tileSize: _this.tileSize,
					},
					paint: {
						"raster-opacity": 0,
					},
				});
			}
		});


		_this.map.Renderer.setPaintProperty(
			`rainviewer_${_this.mapFrames[_this.animationPosition].path}`,
			"raster-opacity",
			opacity
		);

		_this.displayRadarTime(_this.mapFrames[_this.animationPosition].time);
	}

	function changeLayer(control = "") {
		const nowLayer = _this.mapFrames[_this.animationPosition];
		switch (control) {
			case "next": {
				_this.animationPosition = (_this.animationPosition + 1) % 16;
				break;
			}
			case "back": {
				_this.animationPosition =
					(_this.animationPosition - 1 + _this.mapFrames.length) %
					_this.mapFrames.length;
				break;
			}
		}
		const newLayer = _this.mapFrames[_this.animationPosition];
		changeImages(newLayer, nowLayer);
	}

	function changeImages(newLayer, nowLayer) {
		_this.displayRadarTime(newLayer.time);
		_this.map.Renderer.setPaintProperty(
			`rainviewer_${nowLayer.path}`,
			"raster-opacity",
			0
		);
		_this.map.Renderer.setPaintProperty(
			`rainviewer_${newLayer.path}`,
			"raster-opacity",
			Number.parseFloat(_this.opacity)
		);
	}

	this.addConverageLayer = () => {
		_this.enableCoverage = !_this.enableCoverage;
		converageLayer();
	};

	this.rainNext = () => {
		changeLayer("next");
	};

	this.rainBack = () => {
		changeLayer("back");
	};

	this.rainNow = () => {
		changeLayer("now");
	};

	/**
	 * @todo Changes rain layer automation every 2s (default) / layers
	 * @param {number} speed Speed can set interval loop millisecond units
	 * @callback Boolean
	 */
	this.playAnimation = (speed) => {
		_this.isDisplay = true;
		if (speed) _this.animationSpeed = Number.parseInt(speed) || 1000;
		if (!_this.animation) {
			_this.animation = true;
			_this.animationInterval = setInterval(() => {
				_this.rainNext();
			}, _this.animationSpeed);
		} else {
			clearInterval(_this.animationInterval);
			_this.animation = false;
			_this.rainNow();
		}
		return _this.animation;
	};

	/**
	 *
	 * @param {number} Opacity Opacity radar map
	 */
	this.setOpacity = (opacity) => {
		_this.opacity = opacity;
		_this.map.Renderer.setPaintProperty(
			`rainviewer_${_this.mapFrames[_this.animationPosition].path}`,
			"raster-opacity",
			Number.parseFloat(opacity)
		);
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
	 * @param {string} locale Locale radar map
	 */
	this.setLocale = (locale) => {
		_this.locale = locale || "th-Th";
	};

	this.displayRadarTime = (time) => {
		if (_this.timeDisplay !== null) {
			const el = document.getElementById(_this.timeDisplay);
			if (el) {
				el.innerHTML = new Date(time * 1000).toLocaleDateString(_this.locale, {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "numeric",
					minute: "numeric",
				});
			}
		}
	};

	this.initialize();
}
