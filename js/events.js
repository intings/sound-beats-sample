(function() {
	// Log events flag
	var logEvents = false;
	// Touch Point cache
	var tpCache = new Array();
	var bPlayedByMouse = false;
	var isTouch = !(typeof ontouchcancel == 'undefined');
	function enableLog(ev) {
		logEvents = logEvents ? false : true;
	}

	function log(name, ev, printTargetIds) {
		var o = document.getElementsByTagName('output')[0];
		var s = name + ": touches = " + ev.touches.length +
			" ; targetTouches = " + ev.targetTouches.length +
			" ; changedTouches = " + ev.changedTouches.length;
		o.innerHTML += s + " <br>";
		if (printTargetIds) {
			s = "";
			for (var i = 0; i < ev.targetTouches.length; i++) {
				s += "... id = " + ev.targetTouches[i].identifier + " <br>";
			}
			o.innerHTML += s;
		}
	}

	function clearLog(event) {
		var o = document.getElementsByTagName('output')[0];
		o.innerHTML = "";
	}

	function start_handler(ev) {
		ev.preventDefault();
		// Cache the touch points for later processing of 2-touch pinch/zoom
		if (isTouch && ev.targetTouches.length == 2) {
			for (var i = 0; i < ev.targetTouches.length; i++) {
				tpCache.push(ev.targetTouches[i]);
			}
		}
		if (logEvents) log("touchStart", ev, true);
		target = ev.target;
		target.classList.add("hit");
		if (!isTouch) {
			target.classList.add("mouse");
			bPlayedByMouse = true;
		}
		PlaySound(target.getAttribute("data-order"));
	}

	function end_handler(ev) {
		ev.preventDefault();
		if (logEvents) log(ev.type, ev, false);
		if (!isTouch || (isTouch && ev.targetTouches.length == 0)) {
			ev.target.classList.remove("hit");
		}
	}
	
	function setTouchMouseHandlers(){
		var keys = document.getElementsByClassName("key");
		var len = keys.length;
		for (var i = 0; i < len; i++) { 
			var key = keys[i];
			if (isTouch) {
				key.ontouchstart = start_handler;
				key.ontouchcancel = end_handler;
				key.ontouchend = end_handler;
			} else {
				key.onmousedown = start_handler;
				key.onmouseup = end_handler;
			}
		}
	}
	
	function keyUp(ev){
		var target = document.getElementById(ev.code);
		if (target){
			target.classList.remove("hit");
			target.classList.remove("keyDown");
		}
	}
	
	function keyDown(ev){
		var target = document.getElementById(ev.code);
		if (target) {
			if(!(target.classList.contains("keyDown"))){
				target.classList.add("hit");
				target.classList.add("keyDown");
				PlaySound(target.getAttribute("data-order"));
			}
		}
	}

	function init() {
		setTouchMouseHandlers();
		if (isTouch) {
			document.getElementById("log").onclick = enableLog;
			document.getElementById("clearlog").onclick = clearLog;
		} else {
			document.onkeydown = keyDown;
			document.onkeyup = keyUp;
			document.onmouseup = function(ev) {
				ev.preventDefault();
				if (bPlayedByMouse) {
					var mouse = document.getElementsByClassName("mouse")[0];
					if (mouse) {
						mouse.classList.remove("hit");
						mouse.classList.remove("mouse");
					}
					bPlayedByMouse = false;
				}
			}
		}
	}
	init();
})();