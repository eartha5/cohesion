var Cohesion = (function () {
	
	var animationStartTimer;

	function setupCanvas() {

		// behavior properties
	    var overlapThreshold = 200;
	    var lightColorStop = 'rgba(255,100,0,1)';
	    var darkColorStop = 'rgba(255,100,0,0)';
	    var timeOut = 10;

		var animationCanvas = document.getElementById('backgroundAnimation');
		var animationContext = animationCanvas.getContext('2d');

		console.log("canvas dimensions = "+animationCanvas.width+"x"+animationCanvas.height);

	    var tempAnimCanvas = document.createElement("canvas");
	    var tempAnimContext = tempAnimCanvas.getContext("2d");
	    tempAnimCanvas.width = animationCanvas.width = 1200;
	    tempAnimCanvas.height = animationCanvas.height = 600;

	    // initialize points array
	    points = [];

		for(var i = 0; i < 50; i++){
		    var x = Math.random() * animationCanvas.width,
		        y = Math.random() * animationCanvas.height,
		        vx = ( Math.random() * 8 ) - 4,
		        vy = ( Math.random() * 8 ) -4 ,
		        size = Math.floor( Math.random() * 60 ) + 60;
		    
		    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
		                       
		};

		function update(){
		    var len = points.length;
		    tempAnimContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    // draw a background first
		    tempAnimContext.beginPath();
		    tempAnimContext.fillStyle = 'rgb(0,0,0)';
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
		        pix = imageData.data;
		    
		    for ( var i = 0, n = pix.length; i <n; i += 4 ) {
		        if( pix[ i + 20 ] < overlapThreshold ) {
		            pix[ i + 20 ] /= 40;
		            if( pix[ i + 20 ] > overlapThreshold / 27 ) {
		                pix[ i + 20 ] = 0;
		            }
		        }
		    }
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