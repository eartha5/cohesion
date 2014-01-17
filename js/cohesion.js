var Cohesion = (function () {
	
	var animationStartTimer;

	function setupCanvas() {

		// color/size behavior properties
	    var overlapThreshold = 245;
	    var lightColorStop = 'rgba(255,255,255,1)';
	    var darkColorStop = 'rgba(240,240,240,0)';
	    var backgroundColor = 'rgb(0,0,0)';
	    var sizeBase = 200;
	    var sizeMultiplier = 50;

	    // motion behavior properties
	    var timeOut = 10;

		var animationCanvas = document.getElementById('backgroundAnimation');
		var animationContext = animationCanvas.getContext('2d');

		console.log("canvas dimensions = "+animationCanvas.width+"x"+animationCanvas.height);

	    var tempAnimCanvas = document.createElement("canvas");
	    var tempAnimContext = tempAnimCanvas.getContext("2d");
	    tempAnimCanvas.width = animationCanvas.width = 2400;
	    tempAnimCanvas.height = animationCanvas.height = 1200;

	    // initialize points array
	    points = [];

		for(var i = 0; i < 50; i++){
		    var x = Math.random() * animationCanvas.width,
		        y = Math.random() * animationCanvas.height,
		        vx = ( Math.random() * 4 ) - 2,
		        vy = ( Math.random() * 4 ) - 2 ,
		        size = Math.floor( Math.random() * sizeMultiplier ) + sizeBase;
		    
		    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
		                       
		};

		function update(){
		    var len = points.length;
		    tempAnimContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    // draw a background first
		    tempAnimContext.beginPath();
		    tempAnimContext.fillStyle = backgroundColor;
		    tempAnimContext.rect( 0, 0, animationCanvas.width, animationCanvas.height );
		    tempAnimContext.fill();

		    while( len-- ){
		        var point = points[ len ];
		        point.x += point.vx;
		        point.y += point.vy;
		        
		        if(point.x > animationCanvas.width + point.size){
		            point.x = 0 - point.size;
		        }
		        if(point.x < 0 - point.size){
		            point.x = animationCanvas.width + point.size;
		        }
		        if(point.y > animationCanvas.height + point.size){
		            point.y = 0 - point.size;
		        }
		        if(point.y < 0 - point.size){
		            point.y = animationCanvas.height + point.size;
		       }
		        
		        tempAnimContext.beginPath();
		        var pointGradient = tempAnimContext.createRadialGradient( point.x, point.y, 1, point.x, point.y, point.size );
		        pointGradient.addColorStop( 0, lightColorStop );
		        pointGradient.addColorStop( 1, darkColorStop );
		        tempAnimContext.fillStyle = pointGradient;
		        tempAnimContext.arc( point.x, point.y, point.size, 0, Math.PI*2 );
		        tempAnimContext.fill();
		    }
		    renderAgainstThreshold();
		    setTimeout( update, timeOut );
		}

		function renderAgainstThreshold(){
		    var imageData = tempAnimContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height ),
		        pixels = imageData.data;
		    
		    var pixelVal;
		    for ( var i = 0, n = pixels.length; i < n; i += 4 ) {
		    	pixelVal = pixels[i];
		        if( pixelVal < overlapThreshold ) {
		            pixelVal = 0;
		            if( pixelVal >= overlapThreshold ) {
		                pixelVal = 0;
		            }
		        }
		        pixels[i] = pixelVal;
		        pixels[i+1] = pixelVal;
		        pixels[i+2] = pixelVal;

		    }
		    animationContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    animationContext.putImageData(imageData, 0, 0);    
		}

		update(); 

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