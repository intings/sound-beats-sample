var InitVisualiser;
var VisualizeRecorderdAudio;
(function () {
	var analyser, canvas, ctx;
	var barWidth = 3;
	var lastCalledTime;
	var fps;
	var fpsHolder;
	InitVisualiser = init;
	function getFrameRate() {
		var now = performance.now();
		if (!lastCalledTime) {
			lastCalledTime = now;
			fps = 0;
			return fps;
		}
		delta = (now - lastCalledTime) / 1000;
		lastCalledTime = now;
		fps = 1 / delta;
		return fps;
	}
	
	function connectRecordedAudio(audio){
		var source = context.createMediaElementSource(audio);
		source.connect(analyser);
	}

	function init() {
		VisualizeRecorderdAudio = connectRecordedAudio;
		fpsHolder = document.getElementById("fps");
		canvas = document.createElement('canvas');
		canvas.width = window.innerWidth * 0.8;
		canvas.height = window.innerHeight / 3;
		document.body.appendChild(canvas);
		ctx = canvas.getContext('2d');

		setupWebAudio();
		draw();
	};
	
	function setupWebAudio() {
		analyser = context.createAnalyser();
		recorderNode.connect(analyser);
		analyser.connect(context.destination);
	}

	function draw() {
		requestAnimationFrame(draw);
		fpsHolder.innerHTML = getFrameRate();
		var freqByteData = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(freqByteData);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var bDrew = false, i = freqByteData.length; i > -1; i -= barWidth) {
			currFrequency = freqByteData[i];
			if (currFrequency > 0) bDrew = true;
			if (bDrew) {
				ctx.fillStyle = 'rgb(1,1,1)';
				//ctx.fillRect(i + 300, canvas.height - freqByteData[i] * 1.5, 10, canvas.height);
				ctx.strokeRect(i, (canvas.height - currFrequency) / 2, barWidth, currFrequency);
			}
		}
	}
})();