(function(){
	var woord = document.getElementById("woord");
	var letters = document.getElementById("letters");
	var getLetters = function(){
		return (letters.value || "").match(/[a-zA-Z]/g) || [];
	};
	var getWoord = function(){
		return woord.value.toLowerCase();
	};
	var galgje = document.getElementById("galgje");

	trackState.config({
		cookieKey:"galgje",
		serialize:function(){
			var result = getWoord();
			if(!result){return "";}
			var letterString = getLetters().join("");
			return result + (letterString?"_"+letterString:"");
		},
		deserialize:function(s){
			if(!s){return;}
			var match = s.match(/^([a-zA-Z]+)(?:_([a-zA-Z]+))?$/);
			if(!match){return;}
			woord.value = match[1];
			letters.value = match[2];
		}
	});
	
	
	galgje.addEventListener("click",function(){
		galgje.select();
	})
	
	var spaces = function(n){return Array.apply(null, new Array(n)).map(function(){return " ";}).join("");};
	var stringSum = function(a, b, x){
		if(!b){return a;}
		if(!a){return (x > 0 ? spaces(x) : "") + b;}
		if(a.length < x){
			a = a + spaces(x - a.length);
		}
		if(x < 0){
			return b.substr(x) + a.substr(b.length + x);
		}else{
			return a.substr(0,x) + b + a.substr(x + b.length);
		}
	};
	var stringImage = function(lines){
		lines = lines || [""];

		return {
			toString:function(){
				return lines.join("\r\n");
			},
			plus:function(other, x, y){
				var newLines = [];
				var otherLines = other.getLines();
				var newHeight = Math.max(lines.length, y + otherLines.length);
				for(var i=0;i<newHeight;i++){
					var thisLine = i < lines.length ? lines[i] : null;
					var otherLine = i >=y && i < y + otherLines.length ? otherLines[i - y] : null;
					newLines.push(stringSum(thisLine, otherLine, x));
				}
				return stringImage(newLines);
			},
			getLines:function(){
				return lines;
			},
			transpose:function(){
				var numberOfLines = Math.max.apply(null, lines.map(function(l){return l.length;}));
				var newLines = Array.apply(null, new Array(numberOfLines)).map(function(){return "";});
				lines.map(function(l){
					for(var i=0;i<numberOfLines;i++){
						newLines[i] += l[i] || " ";
					}
				});
				return stringImage(newLines);
			}
		};
	};
	
	var galgjeParts = [
		{
			im: stringImage(["||||||||"]).transpose(),
			x:0,
			y:1
		},{
			im: stringImage(["_______"]),
			x:0,
			y:0
		},{
			im: stringImage(["-------"]),
			x:0,
			y:9
		},
		{
			im: stringImage([
			"  /",
			" /",
			"/"
			]),
			x:1,
			y: 1
		}
	];

	var makeGalgje = function(n){
		var image = stringImage();
		for(var i=0;i<n && i<galgjeParts.length;i++){
			image = image.plus(galgjeParts[i].im, galgjeParts[i].x, galgjeParts[i].y);
		}
		return image;
	};

	var getHiddenWord = function(woord, letters){
		var hiddenWord = "";
		for(var i=0;i<woord.length;i++){
			if(letters.indexOf(woord[i]) == -1){
				hiddenWord += "_ ";
			}else{
				hiddenWord += woord[i] + " ";
			}
		}
		return stringImage([hiddenWord]);
	};

	var getWrongLetters = function(woord, letters){
		var wrongLetters = "";
		for(var i=0;i<letters.length;i++){
			if(woord.indexOf(letters[i]) == -1){
				wrongLetters += letters[i];
			}
		}
		return {
			image:stringImage([wrongLetters]).transpose(),
			length:wrongLetters.length
		};
	};

	var draw = function(){
		var lettersArray = getLetters();
		var woordValue = getWoord();

		var wrongLetters = getWrongLetters(woordValue, lettersArray);
		var image = makeGalgje(wrongLetters.length);
		galgje.value = image
			.plus(getHiddenWord(woordValue, lettersArray), 0, 11)
			.plus(wrongLetters.image, 12, 2)
			.toString();
		trackState.write();
	};

	woord.addEventListener('keyup', function(){
		draw();
	});

	letters.addEventListener('keyup', function(){
		draw();
	});

	trackState.read();
	draw();
})()