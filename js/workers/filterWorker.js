// Filter worker


/*
	Input:

	e.data = {
		cmd: 'runFilter',
		id: int [,
		imageData: [rint,gint,bint,aint,...], 
		ovelapThreshold: int ,
		lightDisplayRgb: [rint,gint,bint],
		darkDisplayRgb: [rint,gint,bint],
		Filters: Filters object definition
	]}
*/




// };



// multi-worker compatability

var Filters = (function() {

	return {

		filterImage : function(filter, imageData, var_args) {
		  var args = [imageData];
		  for (var i=2; i<arguments.length; i++) {
		    args.push(arguments[i]);
		  }
		  return filter.apply(null, args);
		},

		twoColorThreshold: function(imageData, threshold, rgbLight, rgbDark) {
		    var pixelVal;
		    for ( var i = 0, n = imageData.data.length; i < n; i += 4 ) {
		    	pixelVal = imageData.data[i];
		    	displayRgbArray = pixelVal < threshold ? rgbDark : rgbLight;
		        imageData.data[i] = displayRgbArray[0];
		        imageData.data[i+1] = displayRgbArray[1];
		        imageData.data[i+2] = displayRgbArray[2];
		    }
		    return imageData;
		}

	};

})();


var id,
	imageDataIn,
	imageDataOut,
	overlapThreshold,
	lightDisplayRgb,
	darkDisplayRgb;

var returnFiltered = function() {
	
	// run filter calcs here
	var imageDataOut = Filters.filterImage(Filters.twoColorThreshold, imageDataIn, overlapThreshold, lightDisplayRgb, darkDisplayRgb);

    self.postMessage(
        {	
        	status: 'filtered',
        	id: id, 
        	imageData: imageDataOut
        }
    );
};

self.addEventListener('message', function(e) {
	switch (e.data.cmd) {
		case 'init':
			id = e.data.id;
	        overlapThreshold = e.data.overlapThreshold;
	        lightDisplayRgb = e.data.lightDisplayRgb;
	        darkDisplayRgb = e.data.darkDisplayRgb;
	        break;
	    case 'runFilter':
	        imageDataIn = e.data.imageData;
	        returnFiltered();
	        break;
	    default:
		    self.postMessage(
	        	{
	        		status: 'ERROR',
	        		message: 'Unknown command sent to filterWorker'
	        	}
	        );
	}
}, false);
