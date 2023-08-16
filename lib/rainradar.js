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
	this.apiData = [];
	this.isDisplay = true;
	this.timeDisplay = timeDisplay;
	this.animationSpeed = 1000;
	this.locale = locale;
	this.tileSize = tileSize;
	this.animation = false;
	this.radarColor = color;
	this.opacity = opacity;
	this.mapFrames = [];
	this.animationPosition = 12;

	this.initialize = () => {
		getWeatherMap();
	};

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
			addLayers();
		}
	}

	function addLayers() {
		_this.map.Event.bind("ready", () => {
			_this.map.Renderer.on("load", () => {
				_this.mapFrames.forEach((frame) => {
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
				});

				_this.map.Renderer.setPaintProperty(
					`rainviewer_${_this.mapFrames[_this.animationPosition].path}`,
					"raster-opacity",
					opacity
				);

				_this.displayRadarTime(_this.mapFrames[_this.animationPosition].time);
			});
		});
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
			_this.opacity
		);
	}

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
		if (!_this.isAnimation) {
			changeLayer('next');
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


	/**
	   *
	   * @param {number} Opacity Opacity radar map
	   */
	this.setOpacity = (opacity) => {
		_this.opacity = opacity;
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
		_this.locale = locale || 'th-Th';
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
