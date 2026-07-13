angular.module('croppaFilter', [])
	.filter('croppa', function() {
		return function(input, width, height, options) {
			// Defaults
			if (!input) return; // Don't allow empty strings
			if (!width) width = '_';
			else width = Math.round(width);
			if (!height) height = '_';
			else height = Math.round(height);
			
			// Produce the croppa syntax
			var suffix = '-'+width+'x'+height;
			
			// Add options.  If the key has no arguments (like resize), the key will be like [1]
			if (options && options instanceof Array) {
				var val, key;
				for (key in options) {
					val = options[key];
					
					// A simple string option
	        if (typeof val == 'string') suffix += '-'+val;
					
					// An object like {quadrant: 'T'} or {quadrant: ['T']}
					else if (typeof val === 'object') {
						for (key in val) {
							val = val[key];
							if (val instanceof Array) suffix += '-'+key+'('+val.join(',')+')';
							else suffix += '-'+key+'('+val+')';
							break; // Only one key-val pair is allowed
						}
					}
				}
			}
			
			// Break the path apart and put back together again
			return input.replace(/^(.+)(\.[a-z]+)$/i, "$1"+suffix+"$2");	
	  	};
	});