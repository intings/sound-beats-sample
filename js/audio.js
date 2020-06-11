var context;
var buffers = [];
var recorderNode;
var prevBuffers = [null, null, null, null, null, null, null, null, null, null, null, null];
function PlaySound(i){
	var currentTime = context.currentTime;
	var prevBufferSource = prevBuffers[i];
	if (prevBufferSource){
		prevBufferSource.stop(currentTime);
		prevBuffers[i] = null;
	}
	var buff = buffers[i];
	var contextBufferSource = context.createBufferSource();
	contextBufferSource.buffer = buff;					

	contextBufferSource.start(currentTime);
	contextBufferSource.connect(recorderNode);
	recorderNode.connect(context.destination);
	prevBuffers[i] = contextBufferSource;
}

(function () {
	var drumSounds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
	var audioLocation = "..\\sound-beats-sample\\AudioFiles\\";
	var fileExtension = ".mp3";
	var sources = [];

	var recorder;	

	drumSounds.forEach(function (fileName) {
		sources.push(audioLocation + fileName + fileExtension);
	});

	function DelayPromise(delay) {
		return function (data) {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					resolve();
				}, delay);
			});
		}
	}


	function get(src) {
		return fetch(src)
			.then(function (response) {
				return response.arrayBuffer()
			})
	}

	function loadAllbuffers() {
		Promise.all(sources.map(get))
			.then(function (data) {
				var len = Math.max.apply(Math, data.map(function (buffer) {
					return buffer.byteLength
				}));
				return Promise.all(data.map(function (buffer) {
						return context.decodeAudioData(buffer, function (bufferSource) {
							
							buffers.push(bufferSource);
							if (buffers.length == 12) {
								console.log("done loading buffers");
								recorderNode = context.createGain();
								recorder = new Recorder(recorderNode);
								console.log("recorder initialized");
								InitVisualiser();
							}
							return;
						}, function (e) {
							console.log(e)
						});
					}))
					.then(function () {
						console.log("Done promise all");
					});
			})
			.catch(function (e) {
				console.log(e)
			});
	}

	function startRecording(button) {
		button = button.target;
		recorder && recorder.record();
		button.disabled = true;
		button.nextElementSibling.disabled = false;
		document.documentElement.focus();
	}

	function stopRecording(button) {
		button = button.target;
		recorder && recorder.stop();
		button.disabled = true;
		button.previousElementSibling.disabled = false;

		// create WAV download link using audio data blob
		createDownloadLink();

		recorder.clear();
		document.documentElement.focus();
	}

	function createDownloadLink() {
		recorder && recorder.exportWAV(function (blob) {
			var url = URL.createObjectURL(blob);
			var li = document.createElement('li');
			var au = document.createElement('audio');
			var hf = document.createElement('a');

			au.controls = true;
			au.src = url;
			au.style.width = window.innerWidth * 0.8 + 'px'
			hf.href = url;
			hf.download = new Date().toISOString() + '.wav';
			hf.innerHTML = hf.download;
			li.appendChild(au);
			li.appendChild(hf);
			document.getElementById("recordingslist").appendChild(li);
			VisualizeRecorderdAudio(au);
		});
	}

	function firstTouch() {
		console.log("touched");
		window.removeEventListener('touchstart', firstTouch, false);
		init();
	}
	
	function init(){
		if (typeof AudioContext !== "undefined")
			context = new AudioContext();
		else
			context = new webkitAudioContext();
		document.getElementById("recordBtn").onclick = startRecording;
		document.getElementById("stopBtn").onclick = stopRecording;
		try{
			loadAllbuffers();
		}catch(e){
			console.log(e);
		}
	}
	
	function log(s){
		document.getElementsByTagName('output')[0].innerHTML += "<br>" + s;
	}	
	
	if (navigator.userAgent.match(/(iPhone|iPad)/i)) {
		console.log = log;
		window.addEventListener('touchstart', firstTouch, false);
	}
	else {
		init();
	}
})();
