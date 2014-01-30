// point position calculation

// once started, runs continuously every 5ms, and is polled to read points array

/*
	Input:
	e.data = {
		cmd: ['start' || 'poll' || 'stop'] [,
		points: [
			{
				x: [int],
				y: [int],
				vx: [int],
				vy: [int],
				size: [int]
			}, ...
		], 
		canvasDims: {
			width: [int],
			height: [int]
		} ]
	}
*/

var animationTimeStamp = Date.now();
var points;
var canvasDims;

var cycle = function() {
	// check time passed since last frame
	var animationTimeNow = Date.now();
	var dTime = animationTimeNow - animationTimeStamp;

	animationTimeStamp = animationTimeNow;
	update(dTime);

	setTimeout(cycle, 10);
};

var update = function(dTime) {
	var len = points.length;
    while( len-- ){
        var point = points[ len ];
        point.y += point.vy * dTime / 1000;
        
        if(point.y > canvasDims.height + point.size){
            point.y = 0 - point.size;
        }
        if(point.y < 0 - point.size){
            point.y = canvasDims.height + point.size;
       }
	}
};

self.addEventListener('message', function(e) {
	if (e.data.points) {
		points = e.data.points;
	}
	switch (e.data.cmd) {
	    case 'start':
	        self.postMessage(
	        	{
	        		status: 'started'
	        	}
	        );
	        canvasDims = e.data.canvasDims;
	        cycle();
	        break;
	    case 'poll':
	        self.postMessage(
		        {	
		        	status: 'polled',
		        	points: points
		        }
	        );
	        break;
	    case 'stop':
		    self.postMessage(
	        	{
	        		status: 'stopped'
	        	}
	        );
	    	self.close(); // Terminates the worker.
	    default:
		    self.postMessage(
	        	{
	        		status: 'ERROR',
	        		message: 'Unknown command sent to pointPositionWorker'
	        	}
	        );
	}
}, false);