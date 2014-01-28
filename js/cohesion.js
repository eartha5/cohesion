var Cohesion = (function () {

	var animationStartTimer,
		blobber;

	var createBlobber = function() {

		var options = {
			width: 				window.innerWidth,
			height: 			window.innerHeight,
			containerId: 		'cohesion',
			speedMultiplier: 	.2,
			lightRgb: 			[255,255,255],
			darkRgb: 			[0,0,50],
			blobCount: 			20,
			frameRate: 			30
		}

		blobber = new Blobber( options );

	};

	var resizeBlobber = function(w,h) {
		blobber.resize(w,h);
	};

	var Blobber = function( options ) {

		// visual params and motion properties
		var w = options.width,
			h = options.height,
			containerId = options.containerId,
			blobCount = options.blobCount, //20
			lightDisplayRgb = options.lightRgb,// [ 255, 255, 255 ],
			darkDisplayRgb = options.darkRgb, //[ 0, 0, 50 ];
	    	speedMultiplier = options.speedMultiplier, //.2;
			frameRate = options.frameRate;  //100;

		// vars affecting shape and size of blobs/interaction--not display color
	    var overlapThreshold = 120,
	    	backgroundColor = 'rgb(0,0,0)',
	    	lightColorStop = 'rgba(255,0,0,1)',
	    	darkColorStop = 'rgba(100,0,0,0)',
	    	sizeBase = 40,
	    	sizeMultiplier = 120;

	    // non-behavioral
		var animationTimeout,
			animationInterval,
			predrawCanvas,
			predrawContext,
			animationCanvas,
			animationContext,
			drawingCanvas,
			drawingContext,
			points = [];


	    this.init = function() {

			createCanvases();
			preDrawPersistentPixels();

			createPoints();

			startAnimation();

	    };

	    this.resize = function(newW, newH) {
	    	w = newW;
	    	h = newH;
	    	this.init();
	    };

	    var createPoints = function() {
	    	points = [];
			for(var i = 0; i < blobCount; i++){
			    var x = animationCanvas.width / blobCount * i,
			        y = Math.random() * animationCanvas.height,
			        vx = 0,
			        vy = speedMultiplier * ( ( Math.random() * 10 ) - 2 ) ,
			        size = Math.floor( Math.random() * sizeMultiplier ) + sizeBase;
			    
			    points.push({ x:x, y:y, vx:vx, vy:vy, size:size });
			                       
			};
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
	    	//clearTimeout(animationTimeout);
			//update(); 
			clearInterval(animationInterval);
			animationInterval = setInterval(update, ( 1000 / frameRate ));
		};


		var update = function(){
		    var len = points.length;
		    //drawingContext.clearRect( 0, 0, animationCanvas.width, animationCanvas.height );
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
		    //animationTimeout = setTimeout( update, ( 1000 / frameRate ) );
		};

		var renderFiltered = function(){
		    var imageData = drawingContext.getImageData( 0, 0, animationCanvas.width, animationCanvas.height );

			var filteredData = Filters.filterImage(Filters.twoColorThreshold, imageData, overlapThreshold, lightDisplayRgb, darkDisplayRgb);

		    animationContext.putImageData(filteredData, 0, 0);

		};

		this.init();

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