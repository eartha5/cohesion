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