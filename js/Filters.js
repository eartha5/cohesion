var Filters = (function() {

	return {

		filterImage : function(filter, imageData, var_args) {
		  var args = [imageData];
		  for (var i=2; i<arguments.length; i++) {
		    args.push(arguments[i]);
		  }
		  return filter.apply(null, args);
		},

		singleChannelThreshold: function(imageData, threshold) {
		    var pixelVal;
		    for ( var i = 0, n = imageData.data.length; i < n; i += 4 ) {
		    	pixelVal = imageData.data[i];
		    	pixelVal = pixelVal < threshold ? 0 : 255;
		        // if( pixelVal < threshold ) {
		        //     pixelVal = 0;
		        // }
		        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = pixelVal;
		    }
		    return imageData;
	    
		}

	};

})();