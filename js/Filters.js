var Filters = (function() {

	return {

		// some of this modified from HTML5rocks:
		// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

		filterImage : function(filter, imageData, var_args) {
		  var args = [imageData];
		  for (var i=2; i<arguments.length; i++) {
		    args.push(arguments[i]);
		  }
		  return filter.apply(null, args);
		},


		// filters

		rgbThreshold : function(imageData, threshold) {
		  var d = imageData.data;
		  for (var i=0; i<d.length; i+=4) {
		    var r = d[i];
		    var g = d[i+1];
		    var b = d[i+2];
		    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
		    d[i] = d[i+1] = d[i+2] = v
		  }
		  return imageData;
		},		

		singleChannelThreshold: function(imageData, threshold) {
		    var pixelVal;
		    for ( var i = 0, n = imageData.data.length; i < n; i += 4 ) {
		    	pixelVal = imageData.data[i];
		        if( pixelVal < threshold ) {
		            pixelVal = 0;
		        }
		        imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = pixelVal;
		    }
		    return imageData;
		  //   var pixelVal;
		  //   for ( var i = 0, n = imageData.data.length; i < n; i += 4 ) {
		  //   	pixelVal = imageData.data[i];
		  //   	var meetsThresholdRange = false;
		  //   	for (k = i - 10; k < i + 10; k++) {
			 //        if( imageData.data[k] < threshold ) {
			 //            pixelVal = 0;
			 //        }
				// }
		  //       imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = pixelVal;
		  //   }
		  //   return imageData;		    
		},

		// modified from html5rocks article above
		convolute : function(imageData, weights, opaque) {

			var tmpCanvas = document.createElement('canvas');
			var tmpCtx = tmpCanvas.getContext('2d');

			var side = Math.round(Math.sqrt(weights.length));
			var halfSide = Math.floor(side/2);
			var src = imageData.data;
			var sw = imageData.width;
			var sh = imageData.height;
			// pad output by the convolution matrix
			var w = sw;
			var h = sh;
			var output = tmpCtx.createImageData(w,h);
			var dst = output.data;
			// go through the destination image pixels
			var alphaFac = opaque ? 1 : 0;
			for (var y=0; y<h; y++) {
				for (var x=0; x<w; x++) {
					var sy = y;
					var sx = x;
					var dstOff = (y*w+x)*4;
					// calculate the weighed sum of the source image pixels that
					// fall under the convolution matrix
					var r=0, g=0, b=0, a=0;
					for (var cy=0; cy<side; cy++) {
						for (var cx=0; cx<side; cx++) {
						  	var scy = sy + cy - halfSide;
						  	var scx = sx + cx - halfSide;
							if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
								var srcOff = (scy*sw+scx)*4;
								var wt = weights[cy*side+cx];
								r += src[srcOff] * wt;
								g += src[srcOff+1] * wt;
								b += src[srcOff+2] * wt;
								a += src[srcOff+3] * wt;
							}
						}
					}
					dst[dstOff] = r;
					dst[dstOff+1] = g;
					dst[dstOff+2] = b;
					dst[dstOff+3] = a + alphaFac*(255-a);
				}
			}
			return output;
		}		

	};

})();