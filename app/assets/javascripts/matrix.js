/*
 * @author Anders Lundgren
 *
 * This script covers the canvas animations and tweet collection duties.
 * It was inspired by Ryan Henszey's demo of canvas animation at http://timelessname.com/sandbox/matrix.html.
 */


var stream;
var start;
var tweetEvents = [];

start = function() {
	if (!document.getElementById("displayCanvas")) {
		return; //No need for streaming on this page
	}

	var vertical = false;  //Whether to scroll vertically or horizontally
	var painting = false; //Whether tweet painting has begun
	var dialInterval;     //The setInterval for controlling dialing animation
	var dialIndex = 0;    //The current character displayed by dialing animation
	var received = 0;     //How many tweet events the EventListener has seen

	//Controls the message density.
	var restartThreshhold = 0.97; 

	var init_message = "#DIALING.....".split("");

	stream = new EventSource('/tweet');
	stream.addEventListener('tweet', function(e) {
		if (tweetEvents.length >= 200) { //Store the last 200 tweets
			tweetEvents.shift()
		}
		tweetEvents.push(e.data);
		received += 1;
    	});

	var canvas = document.getElementById("displayCanvas");
	var context = canvas.getContext("2d");

	var name = $("#displayCanvas").attr("name");
	if (name == "vertical") {
		vertical = true;
	}

	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;

	var size = 13;
	var alpha = size / 200
	var rows = canvas.height / size;
	var cols = canvas.width / size;

	var tweets = []; //2D collection of string messages
	var lines = [];

	//Write the loading ticker
	function dial() {
		index = dialIndex % init_message.length;
		context.fillStyle = "rgba(0, 0, 0, 0.3)"; //Background color and fadeout speed
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = getGreen(); 
		context.font = (size+5) + "px ocramedium";
		context.fillText(init_message[index], (canvas.width / 2) - (init_message.length / 2 * size) + (index * size), canvas.height / 3); 
		dialIndex += 1;
		
		//Start displaying tweets once there are enough to fill the screen
		if ( (received >= rows) && !painting) {

			for(var x = 0; x < canvasSize(true); x++) {
				lines[x] = Math.floor(Math.random() * canvasSize(false)); 
				tweets[x] = tweetEvents[Math.floor(Math.random() * tweetEvents.length)];
			}
			painting = true;
			setInterval(paint, 100);
			clearInterval(dialInterval);
			return
		}
	}

	//Write a line incrementally down the screen
	function paint()
	{
		//Background is colored and translucent
		context.fillStyle = "rgba(0, 0, 0, " + alpha + ")"; //Background color and fadeout speed
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.fillStyle = "#0F0"; //green
		context.font = size + "px ocramedium";

		for(var i = 0; i < lines.length; i++) {
			var tweet = tweets[i]
			var currentChar = tweet[lines[i] % tweet.length];
			var previousChar = tweet[(lines[i]-1) % tweet.length];

			if (vertical) {
				context.fillStyle = "#FFF"; //white
				context.fillText(currentChar, i*size, (lines[i]*size)+size); //Write newest char illuminated
				context.fillStyle = getGreen(); //green
				context.fillText(previousChar, i*size, ((lines[i]-1)*size)+size); //Rewrite previous char in green

				//Randomly stagger resetting the line
				if(lines[i]*size > canvas.height && Math.random() > restartThreshhold) {
					lines[i] = 0;
					tweets[i] = tweetEvents[Math.floor(Math.random() * tweetEvents.length)];
				}
			} else {
				context.fillStyle = "#FFF"; //white
				context.fillText(currentChar, lines[i]*size, i*size); //Write newest char illuminated
				context.fillStyle = getGreen(); //green
				context.fillText(previousChar, (lines[i]-1)*size, i*size); //Rewrite previous char in green

				//Randomly stagger resetting the line
				if(lines[i]*size > canvas.width && Math.random() > restartThreshhold) {
					lines[i] = 0;
					tweets[i] = tweetEvents[Math.floor(Math.random() * tweetEvents.length)];
				}
			}
			
			//incrementing scrolling coordinate
			lines[i]++;
		}
	}

	//get the hex string for a random shade of light green
	function getGreen() {
		var hex = "ABCDEF".split("");
		return "#5" + hex[Math.floor(Math.random() * hex.length)]+"5";
	}

	function canvasSize(scroll_dir) {
		if (vertical) {
			return (scroll_dir) ? cols : rows;
		} else {
			return (scroll_dir) ? rows : cols;
		}
	}

	$('#displayCanvas').click(function(){
		stream.close();
   		window.location.href='/about';
	});

	dialInterval = setInterval(dial, 150);

}

$(document).on('page:load', start); //Internal Link
$(document).ready(start); //Load from URL
