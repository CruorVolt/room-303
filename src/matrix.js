/*
 * @author Anders Lundgren
 *
 * Inspired by Ryan Henszey's demo of canvas animation at http://timelessname.com/sandbox/matrix.html.
 */

import { useEffect } from 'react';
import { MessageSource } from './message_source';

function Matrix() {

    useEffect(() => {
        var messageEvents = [];
        var stream;
        if (!document.getElementById("displayCanvas")) {
            return; //No need for streaming on this page
        }

        var vertical = false;  //Whether to scroll vertically or horizontally
        var painting = false; //Whether painting has begun
        var dialInterval;     //The setInterval for controlling dialing animation
        var dialIndex = 0;    //The current character displayed by dialing animation
        var received = 0;     //How many messages we've seen

        //Controls the message density.
        var restartThreshhold = 0.97; 

        var init_message = "#DIALING.....".split("");

        const handleMessage = (message) => {
            if (messageEvents.length >= 200) { //Store the last 200 messages
                messageEvents.shift()
            }
            messageEvents.push(message);
            received += 1;
        }
        const source = new MessageSource();
        source.addListener(handleMessage);

        var canvas = document.getElementById("displayCanvas");
        var context = canvas.getContext("2d");

        //if (direction === "vertical") {
            vertical = true;
        //}

        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        var size = 13;
        var alpha = size / 200
        var rows = canvas.height / size;
        var cols = canvas.width / size;

        var messages = []; //2D collection of string messages
        var lines = [];

        //Write the loading ticker
        function dial() {
            let index = dialIndex % init_message.length;
            context.fillStyle = "rgba(0, 0, 0, 0.3)"; //Background color and fadeout speed
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = getGreen(); 
            context.font = (size+5) + "px matrix";
            context.fillText(init_message[index], (canvas.width / 2) - (init_message.length / 2 * size) + (index * size), canvas.height / 3); 
            dialIndex += 1;
            
            //Start displaying messages once there are enough to fill the screen
            if ( (received >= rows) && !painting) {

                for(var x = 0; x < canvasSize(true); x++) {
                    lines[x] = Math.floor(Math.random() * canvasSize(false)); 
                    messages[x] = messageEvents[Math.floor(Math.random() * messageEvents.length)];
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
            context.font = size + "px matrix";

            for(var i = 0; i < lines.length; i++) {
                var message = messages[i]
                var currentChar = message[lines[i] % message.length];
                var previousChar = message[(lines[i]-1) % message.length];

                if (vertical) {
                    context.fillStyle = "#FFF"; //white
                    context.fillText(currentChar, i*size, (lines[i]*size)+size); //Write newest char illuminated
                    context.fillStyle = getGreen(); //green
                    context.fillText(previousChar, i*size, ((lines[i]-1)*size)+size); //Rewrite previous char in green

                    //Randomly stagger resetting the line
                    if(lines[i]*size > canvas.height && Math.random() > restartThreshhold) {
                        lines[i] = 0;
                        messages[i] = messageEvents[Math.floor(Math.random() * messageEvents.length)];
                    }
                } else {
                    context.fillStyle = "#FFF"; //white
                    context.fillText(currentChar, lines[i]*size, i*size); //Write newest char illuminated
                    context.fillStyle = getGreen(); //green
                    context.fillText(previousChar, (lines[i]-1)*size, i*size); //Rewrite previous char in green

                    //Randomly stagger resetting the line
                    if(lines[i]*size > canvas.width && Math.random() > restartThreshhold) {
                        lines[i] = 0;
                        messages[i] = messageEvents[Math.floor(Math.random() * messageEvents.length)];
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

        dialInterval = setInterval(dial, 150);


    }, [])

    return <canvas id='displayCanvas'/>;
}

export default Matrix