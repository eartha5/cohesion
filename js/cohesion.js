var Cohesion = (function () {
	
	var animationStartTimer;
	var animationTimeout;
	var predrawCanvas;
	var predrawContext;
	var animationCanvas;
	var animationContext;
	var drawingCanvas;
	var drawingContext;

	function setup() {

		var w = window.innerWidth;
		var h = window.innerHeight;

		// color/size behavior properties
		var blobCount = 20;
	    var overlapThreshold = 120;
	    var lightColorStop = 'rgba(255,0,0,1)';
	    var darkColorStop = 'rgba(100,100,100,0)';
	    var backgroundColor = 'rgb(0,0,0)';
	    var sizeBase = 40;
	    var sizeMultiplier = 120;
	    var speedMultiplier = .2;

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

	    drawingCanvas = document.createElement("canvas");
	    drawingCanvas.width = w;
	    drawingCanvas.height = h;
	    drawingContext = drawingCanvas.getContext("2d");

	    // initialize points array
	    points = [];

		for(var i = 0; i < blobCount; i++){
		    var x = animationCanvas.width / blobCount * i,
		        y = Math.random() * animationCanvas.height,
		        vx = 0,
		        vy = speedMultiplier * ( ( Math.random() * 10 ) - 2 ) ,
		        size = Math.floor( Math.random() * sizeMultiplier ) + sizeBase;
		    
		    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
		                       
		};

		// pre-draw persistent background and top and bottom gradients into a canvas
	    preDrawCanvas = document.createElement("canvas");
	    preDrawCanvas.width = w;
	    preDrawCanvas.height = h;
	    preDrawContext = preDrawCanvas.getContext("2d");
	    // predraw the background
	    preDrawContext.beginPath();
	    preDrawContext.fillStyle = backgroundColor;
	    preDrawContext.rect( 0, 0, animationCanvas.width, animationCanvas.height );
	    preDrawContext.fill();
	    // predraw the top and bottom gradients
	    var topGrad = preDrawContext.createLinearGradient(animationCanvas.width / 2, 
	    																0, 
	    																animationCanvas.width / 2, 
	    																animationCanvas.height / 10 );
	    topGrad.addColorStop(.3, lightColorStop);
	    topGrad.addColorStop(1, darkColorStop);
	    preDrawContext.fillStyle = topGrad;
	    preDrawContext.fillRect( 0, 0, animationCanvas.width, animationCanvas.height / 10 );

	    var bottomGrad = preDrawContext.createLinearGradient(animationCanvas.width / 2, 
	    																animationCanvas.height, 
	    																animationCanvas.width / 2, 
	    																animationCanvas.height - animationCanvas.height / 10 );
	    bottomGrad.addColorStop(.3, lightColorStop);
	    bottomGrad.addColorStop(1, darkColorStop);
	    preDrawContext.fillStyle = bottomGrad;
	    preDrawContext.fillRect( 0, animationCanvas.height - animationCanvas.height / 10, animationCanvas.width, animationCanvas.height );


		function update(){
		    var len = points.length;
		    drawingContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
		    // draw background and top and bottom edges first
		    drawingContext.putImageData(preDrawContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height ), 0, 0);

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
		        
		        drawingContext.beginPath();
		        var pointGradient = drawingContext.createRadialGradient( point.x, point.y, 1, point.x, point.y, point.size );
		        pointGradient.addColorStop( 0, lightColorStop );
		        pointGradient.addColorStop( 1, darkColorStop );
		        drawingContext.fillStyle = pointGradient;
		        drawingContext.arc( point.x, point.y, point.size, 0, Math.PI*2 );
		        drawingContext.fill();
		    }

		    renderFiltered();
		    animationTimeout = setTimeout( update, ( 1000 / frameRate ) );
		}

		function renderFiltered(){
		    var imageData = drawingContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height );

			var filteredData = Filters.filterImage(Filters.singleChannelThreshold, imageData, overlapThreshold);

		    animationContext.putImageData(filteredData, 0, 0);

		}

		document.getElementById('cohesion').appendChild(animationCanvas);
		clearTimeout(animationTimeout);
		update(); 

	}

	function runAnimation() {
		// build in a 100ms delay so animation is only restarted once user has stopped resizing the window

		// clean out old timer before creating a new one
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

Cohesion.init();