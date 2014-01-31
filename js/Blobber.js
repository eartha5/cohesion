/**
 * 
 * This experiment is based off an idea introduced here:
 * http://www.somethinghitme.com/2012/06/06/2d-metaballs-with-canvas/ 
 * where overlapping gradients are used to mimic metaballs in motion
 * 
 * Here we take gradients and mimic molecule attraction between blobs 
 * entering into promiximity of one another
 *
 * Constructor parameters:
 * 
 * options:
 * 			width: 				width for canvas to be built, and it's container
 * 			height: 			height for canvas to be built, and it's container
 * 			containerId: 		id of container to create Blobber canvas within
 * 		[ Optionals  	
 * 			lightRgb: 			array of 8-bit channel values 0-255 [255,255,255] default
 * 			darkRgb: 			array of 8-bit channel values 0-255 [0,0,50] default
 * 			blobCount: 			20 default
 * 			frameRate: 			60fps default
 * 		]
 *
 * Public methods:
 *
 * resize(width, height);
 *
 * 
 *
 */

var FilterJobTracker = function( count ) {

	var currentCount = 0;

	this.trackFilterFinished = function() {
		if (currentCount == count - 1) {
			currentCount = 0;
			return true;
		}
		currentCount++;
		return false;
	};

};


var Blobber = function( options ) {

	// localize the options parameters, set defaults
	var w = options.width,
		h = options.height,
		containerId = options.containerId,
		blobCount = options.blobCount || 20,
		lightDisplayRgb = options.lightRgb || [ 255, 255, 255 ],
		darkDisplayRgb = options.darkRgb || [ 0, 0, 50 ],
		frameRate = options.frameRate || 60;

	// vars affecting shape and size of blobs/interaction--these are not display colors
    var overlapThreshold = 120,
    	backgroundColor = 'rgb(0,0,0)',
    	lightColorStop = 'rgba(255,0,0,1)',
    	darkColorStop = 'rgba(100,0,0,0)',
    	sizeBaseFactor = 0.05,
    	sizeMultiplierFactor = 0.14,
    	sizeBase,
    	sizeMultiplier,
    	sideMarginPercent = 15,
    	maxPixelsPerSecond = 30;

    // non-behavioral
	var animationId,
		animationTimeStamp = Date.now(),
		predrawCanvas,
		predrawContext,
		animationCanvas,
		animationContext,
		drawingCanvas,
		drawingContext,
		points = [];

	// web workers
	var evenNumberOfFilterWorkers = 8;
	var filterWorkers = [];
	var filterJobTracker;

	// canvas image data composite
	var imageCompositeData;
	var imageCompositeDivisionSize;


    this.resize = function(newW, newH) {
    	w = newW;
    	h = newH;
    	init();
    };


    var init = function() {

    	setSizeVars();

		createCanvases();
		preDrawPersistentPixels();

		createPoints();

		startAnimation();

		console.log("w: "+w+", h: "+h);

    };

    var setSizeVars = function() {
    	sizeBase = sizeBaseFactor * w,
    	sizeMultiplier = sizeMultiplierFactor * w;
    };

    var createPoints = function() {
    	points = [];
		for(var i = 0; i < blobCount; i++){
		    var x = (animationCanvas.width * sideMarginPercent / 100 ) + 
		    			(animationCanvas.width * ( ( 100 - sideMarginPercent * 2 ) / 100 ) ) * Math.random(),
		        y = Math.random() * animationCanvas.height,
		        vx = 0,
		        vy = ( ( Math.random() * maxPixelsPerSecond ) - (0.5 * maxPixelsPerSecond) + 5 ), 
		        size = Math.floor( Math.random() * sizeMultiplier ) + sizeBase;
		    
		    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
		                       
		}
    };

    var createCanvases = function() {

	    // destroy old canvas if it's there
	    var staleCanvas = document.getElementById('backgroundAnimation');
	    if (staleCanvas) {
		    staleCanvas.parentNode.removeChild(staleCanvas);
		}

		// for rendering pixels
		animationCanvas = document.createElement('canvas');
		animationCanvas.id = "backgroundAnimation";
	    animationCanvas.width = w;
	    animationCanvas.height = h;
		animationContext = animationCanvas.getContext('2d');
		document.getElementById(containerId).appendChild(animationCanvas);


		// for drawing to pixel data un-rendered
	    drawingCanvas = document.createElement("canvas");
	    drawingCanvas.width = w;
	    drawingCanvas.height = h;
	    drawingContext = drawingCanvas.getContext("2d");

		// for pre-drawing, one time, persistent art to be copied into drawingCanvas on each update
	    preDrawCanvas = document.createElement("canvas");
	    preDrawCanvas.width = w;
	    preDrawCanvas.height = h;
	    preDrawContext = preDrawCanvas.getContext("2d");

    };

    var preDrawPersistentPixels = function() {

	    // predraw the background
	    preDrawContext.beginPath();
	    preDrawContext.fillStyle = backgroundColor;
	    preDrawContext.rect( 0, 0, animationCanvas.width, animationCanvas.height );
	    preDrawContext.fill();
	    
	    //predraw the top and bottom gradients
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

    };

    var startAnimation = function() {

    	// set up the filterWorkers
    	for (var i=0; i < evenNumberOfFilterWorkers; i++) {
	    	filterWorkers.push( new Worker("js/workers/filterWorker.js") );
	    	filterWorkers[i].addEventListener('message', filterReturnHandler);
		   	filterWorkers[i].postMessage(
	    		{
					cmd : "init",
					id: i,
					overlapThreshold: overlapThreshold,
					lightDisplayRgb: lightDisplayRgb,
					darkDisplayRgb: darkDisplayRgb
				}
	    	);
		}

    	window.cancelAnimationFrame(animationId);
    	runOneFrame();
    };

    var runOneFrame = function() {

		// check time passed since last frame
		var animationTimeNow = Date.now();
		var dTime = animationTimeNow - animationTimeStamp;

		// this conditional limits resource consumption by limiting rendering to only those frames
		// that need draw in order to achieve our target frameRate  (those frames that happen just over the frameRate threshold)
		if (dTime > 1000 / frameRate) {
			animationTimeStamp = animationTimeNow;
			update(dTime);
		}
		else {
			animationId = window.requestAnimationFrame(runOneFrame);
		}

	};



	var update = function(dTime){

	    var len = points.length;
	    drawingContext.putImageData(preDrawContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height ), 0, 0);


	    while( len-- ){
	        var point = points[ len ];
	        point.y += point.vy * dTime / 1000;
	        
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
	};

	var renderFiltered = function(){

	    // start FilterJobTracker
	    filterJobTracker = new FilterJobTracker(evenNumberOfFilterWorkers);

		for (var i=0; i < evenNumberOfFilterWorkers; i++) {

			var imageData;
			switch (i) {
				case 0:
					imageData = drawingContext.getImageData( 0, 0, animationCanvas.width / 4, animationCanvas.height / 2);
					break;
				case 1:
					imageData = drawingContext.getImageData( animationCanvas.width / 4, 0, animationCanvas.width / 2, animationCanvas.height / 2);
					break;
				case 2:
					imageData = drawingContext.getImageData( animationCanvas.width / 2, 0, animationCanvas.width * .75, animationCanvas.height / 2);
					break;
				case 3:
					imageData = drawingContext.getImageData( animationCanvas.width * .75, 0, animationCanvas.width, animationCanvas.height / 2);
					break;										
				case 4:
					imageData = drawingContext.getImageData( 0, animationCanvas.height / 2, animationCanvas.width / 4, animationCanvas.height);
					break;
				case 5:
					imageData = drawingContext.getImageData( animationCanvas.width / 4, animationCanvas.height / 2, animationCanvas.width / 2, animationCanvas.height);
					break;
				case 6:
					imageData = drawingContext.getImageData( animationCanvas.width / 2, animationCanvas.height / 2, animationCanvas.width * .75, animationCanvas.height);
					break;
				case 7:
					imageData = drawingContext.getImageData( animationCanvas.width * .75, animationCanvas.height / 2, animationCanvas.width, animationCanvas.height);
					break;										
			}

	    	filterWorkers[i].postMessage(
	    		{
					cmd : "runFilter",
					id : i,
					imageData: imageData
				}
	    	);
	    }

	};

	var reconstructCompositeImage = function(e) {
		// write the quadrant back to image
		switch (e.data.id) {
			case 0:
				drawingContext.putImageData( e.data.imageData, 0, 0);
				break;
			case 1:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width / 4, 0);
				break;
			case 2:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width / 2, 0);
				break;
			case 3:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width * .75, 0);
				break;										
			case 4:
				drawingContext.putImageData( e.data.imageData, 0, animationCanvas.height / 2);
				break;
			case 5:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width / 4, animationCanvas.height / 2);
				break;
			case 6:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width / 2, animationCanvas.height / 2);
				break;
			case 7:
				drawingContext.putImageData( e.data.imageData, animationCanvas.width * .75, animationCanvas.height / 2);
				break;										
		}

		if ( filterJobTracker.trackFilterFinished() ) {
			renderCompositeImage();
		}
	};

	var renderCompositeImage = function() {
		animationId = window.requestAnimationFrame(runOneFrame);
		var imageData = drawingContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height );
		animationContext.putImageData(imageData, 0, 0);
	};

	var filterReturnHandler = function(e) {
		if (e.data.status == 'filtered') {
			reconstructCompositeImage(e);
		}
	};


	init();

};