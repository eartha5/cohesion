var Cohesion = (function () {
	
	var animationStartTimer;

	function setupCanvas() {
		var animationCanvas = document.getElementById('backgroundAnimation');
		var $animationCanvas = $(animationCanvas);
		var context = animationCanvas.getContext('2d');

		var canvasWidth = $animationCanvas.width();
		var canvasHeight = $animationCanvas.height();

		console.log("canvas dimensions = "+canvasWidth+"x"+canvasHeight);

	}

	function runAnimation() {
		// build in a 100ms delay so animation is only restarted once user has stopped resizing the window

		// clean out old timer before creating a new one-- is this really necessary?
		if (animationStartTimer)
			clearTimeout(animationStartTimer);
		animationStartTimer = setTimeout(function() {
			setupCanvas();
		}, 100);

		console.log("animation started");
	}

	return {

		init: function() {
			runAnimation();
			window.addEventListener('resize', function() {
				runAnimation();
			});
		}

	}


})();


$(function() {  
    Cohesion.init();
});