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
	this.reloadTime = 60000; // 10 minute default time reload
	this.mapFrames = [];

	// Radar control
	this.nextTileShow = false
	this.rainTile = 0
	this.nextRainTile = 0
	this.pastRainTile = 0


	getWeatherMap();


	map.Event.bind("location", () => {
		showFrame();
	});
	map.Event.bind("zoom", () => {
		showFrame();
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
		if (!_this.apiData) throw new Error(`Can't get data`);
		if (_this.apiData.radar && _this.apiData.radar.past) {
			_this.mapFrames = _this.apiData.radar.past;
			if (_this.apiData.radar.nowcast) {
				_this.mapFrames = _this.mapFrames.concat(_this.apiData.radar.nowcast);
			}
			_this.rainTile = _this.mapFrames.length - 4;
			_this.nextRainTile = _this.rainTile + 1
			_this.pastRainTile = _this.rainTile - 1
			showFrame();
		}
	}

	function showFrame() {
		var frameNow = _this.mapFrames[_this.rainTile];
		var frameNext = _this.mapFrames[_this.nextRainTile] ? _this.mapFrames[_this.nextRainTile] : _this.mapFrames[0]
		var framePast = _this.mapFrames[_this.pastRainTile]
		addLayers(framePast, frameNow, frameNext)

	}

	function addLayers(past, now, next) {
		setTimeout(function () {
			const longdoMapTile = document.querySelectorAll('.ldmap_tile > .ldmap_tile')
			longdoMapTile.forEach((e) => {
				try {
					const originalTileUrl = e.querySelector('img:nth-child(1)').getAttribute('src')
					let params = new URLSearchParams(originalTileUrl);
					const x = params.get('x')
					const y = params.get('y')
					const z = params.get('zoom')

					const rainNow = document.createElement('img')
					const rainNext = document.createElement('img')
					if (e.querySelector('.rain_now') == null) {
						rainNow.className = "ldmap_tile_canvas ldmap_maparea rain_now";
						rainNext.className = "ldmap_tile_canvas ldmap_maparea rain_next";
						rainNow.style.opacity = 0.6
						rainNext.style.opacity = 0
						rainNow.src = `https://tilecache.rainviewer.com${now.path}/256/${z}/${x}/${y}/2/1_1.png`
						rainNext.src = `https://tilecache.rainviewer.com${next.path}/256/${z}/${x}/${y}/2/1_1.png`

						e.appendChild(rainNow)
						e.appendChild(rainNext)
					}
				} catch (error) {
					console.log(error)
					// Do someting
				}
			})

		}, 1000);
		_this.displayRadarTime(now.time)
	}
	function changeLayer() {

		var frameNow = _this.mapFrames[_this.rainTile];
		var frameNext = _this.mapFrames[_this.nextRainTile] ? _this.mapFrames[_this.nextRainTile] : _this.mapFrames[0]
		var framePast = _this.mapFrames[_this.pastRainTile] ? _this.mapFrames[_this.pastRainTile] : _this.mapFrames[_this.mapFrames.length - 1]

		const rain_now = document.getElementsByClassName('rain_now')
		const rain_next = document.getElementsByClassName('rain_next')

		for (let i = 0; i < rain_now.length; i++) {
			if (!_this.nextTileShow) {
				// Hide now
				rain_now[i].style.opacity = 0
				rain_next[i].style.opacity = 0.6
				const replaceUrl = rain_now[i].src.replace(framePast.path,frameNext.path);
				rain_now[i].src= replaceUrl
			} else {
				rain_now[i].style.opacity = 0.6
				rain_next[i].style.opacity = 0
				const replaceUrl = rain_next[i].src.replace(framePast.path,frameNext.path);
				rain_next[i].src= replaceUrl

			}
		}
			_this.nextTileShow = !_this.nextTileShow
			_this.displayRadarTime(frameNow.time)
		}
		this.next = () => {
			if (_this.rainTile == _this.mapFrames.length - 1) {
				_this.rainTile = 0
				_this.nextRainTile = _this.rainTile + 1
				_this.pastRainTile = _this.rainTile - 1
			} else {
				_this.rainTile = _this.rainTile + 1;
				_this.nextRainTile = _this.rainTile + 1
				_this.pastRainTile = _this.rainTile - 1
			}
			changeLayer();
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