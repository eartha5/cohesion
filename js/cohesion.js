var Cohesion = (function () {
	
	var animationStartTimer;
	var animationCanvas;
	var animationContext;
	var preDrawCanvas;
	var preDrawContext;

	function setup() {

		var w = window.innerWidth;
		var h = window.innerHeight;

		// color/size behavior properties
		var blobCount = 20;
	    var overlapThreshold = 237;
	    var lightColorStop = 'rgba(255,255,255,1)';
	    var darkColorStop = 'rgba(220,220,220,0)';
	    var backgroundColor = 'rgb(0,0,0)';
	    var sizeBase = 100;
	    var sizeMultiplier = 200;

	    // motion behavior properties
	    var frameRate = 30;

	    // destroy old canvas if it's there
	    var staleCanvas = document.getElementById('backgroundAnimation');
	    if (staleCanvas) {
		    staleCanvas.parentNode.removeChild(staleCanvas);
		}

		animationCanvas = document.createElement('canvas');
		animationCanvas.id = "backgroundAnimation";
	    animationCanvas.width = w;
	    animationCanvas.height = h;
		animationContext = animationCanvas.getContext('2d');

		console.log("canvas dimensions = "+animationCanvas.width+"x"+animationCanvas.height);

	    preDrawCanvas = document.createElement("canvas");
	    preDrawCanvas.width = w;
	    preDrawCanvas.height = h;
	    preDrawContext = preDrawCanvas.getContext("2d");

	    // initialize points array
	    points = [];

		for(var i = 0; i < blobCount; i++){
		    var x = Math.random() * animationCanvas.width,
		        y = Math.random() * animationCanvas.height,
		        vx = ( Math.random() * 4 ) - 2,
		        vy = ( Math.random() * 4 ) - 2 ,
		        size = Math.floor( Math.random() * sizeMultiplier ) + sizeBase;
		    
		    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
		                       
		};

		function update(){
		    var len = points.length;
		    preDrawContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    // draw a background first
		    preDrawContext.beginPath();
		    preDrawContext.fillStyle = backgroundColor;
		    preDrawContext.rect( 0, 0, animationCanvas.width, animationCanvas.height );
		    preDrawContext.fill();

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
		        
		        preDrawContext.beginPath();
		        var pointGradient = preDrawContext.createRadialGradient( point.x, point.y, 1, point.x, point.y, point.size );
		        pointGradient.addColorStop( 0, lightColorStop );
		        pointGradient.addColorStop( 1, darkColorStop );
		        preDrawContext.fillStyle = pointGradient;
		        preDrawContext.arc( point.x, point.y, point.size, 0, Math.PI*2 );
		        preDrawContext.fill();
		    }
		    renderFiltered();
		    setTimeout( update, ( 1000 / frameRate ) );
		}

		function renderFiltered(){
		    var imageData = preDrawContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height );

		    // Filters.rgbThreshold accepts 'threshold' parameter  0-255
		    // filterImage(filter, image data[, filter params...])
//		    var filteredData = Filters.filterImage(Filters.rgbThreshold, imageData, overlapThreshold);


			var filteredData = Filters.filterImage(Filters.singleChannelThreshold, imageData, overlapThreshold);

		 // 	filteredData = Filters.filterImage(Filters.convolute, filteredData,
			//   [  0, -1,  0,
			//     -1,  5, -1,
			//      0, -1,  0 ]
			// );
		 	// filteredData = Filters.filterImage(Filters.convolute, filteredData,
			 //  [  1/36, 1/36, 1/36, 1/36, 1/36, 1/36,
			 //  	1/36, 1/36, 1/36, 1/36, 1/36, 1/36,
			 //  	1/36, 1/36, 1/36, 1/36, 1/36, 1/36,
			 //  	1/36, 1/36, 1/36, 1/36, 1/36, 1/36,
			 //  	1/36, 1/36, 1/36, 1/36, 1/36, 1/36,
			 //  	1/36, 1/36, 1/36, 1/36, 1/36, 1/36 ]	);
		    
//		    animationContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    animationContext.putImageData(filteredData, 0, 0);

		}

		document.getElementById('cohesion').appendChild(animationCanvas);
		update(); 

	}

	function runAnimation() {
		// build in a 100ms delay so animation is only restarted once user has stopped resizing the window

		// clean out old timer before creating a new one-- is this really necessary?
		if (animationStartTimer)
			clearTimeout(animationStartTimer);
		animationStartTimer = setTimeout(function() {
			setup();
		}, 100);
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