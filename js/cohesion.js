var Cohesion = (function () {

	var animationStartTimer,
		blobber;

	var createBlobber = function() {

		var options = {
			width: 				window.innerWidth,
			height: 			window.innerHeight,
			containerId: 		'cohesion',
			lightRgb: 			[255,255,255],
			darkRgb: 			[0,0,50],
			blobCount: 			20,
			frameRate: 			60
		}

		blobber = new Blobber( options );

	};

	var resizeBlobber = function(w,h) {
		blobber.resize(w,h);
	};


	return {

		init: function() {
			createBlobber();
			window.addEventListener( 'resize', function() {
				// build in a 100ms delay so animation is only restarted once user has stopped resizing the window

				// clean out old timer before creating a new one
				clearTimeout( animationStartTimer );
				animationStartTimer = setTimeout( function() {
					resizeBlobber( window.innerWidth, window.innerHeight );
				}, 100 );

			});
		}

	}


})();

Cohesion.init();