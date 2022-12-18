/*
 * @author Anders Lundgren
 *
 * Inspired by Ryan Henszey's demo of canvas animation at http://timelessname.com/sandbox/matrix.html.
 */

import { useEffect, useRef, useState } from 'react';
import { MessageSource } from './message_source';
import DisplayMessage from './display_message';

function Matrix() {

    var stream;
    var dial;
    var vertical = true;  //Whether to scroll vertically or horizontally

    //Messages buffered from the server
    const messageQueue = useRef([]);

    //Messages currently displaying
    const currentDisplayMessages = useRef([]);

    const canvas = useRef(null);
    const dialIndex = useRef(0);    //The current character displayed by dialing animation

    const paintInterval = useRef(null);
    const resizeTimer = useRef(null);

    const [maxMessages, setMaxMessages] = useState(100);
    const [maxIdx, setMaxIdx] = useState(100);

    const size = 13;
    const alpha = size / 200


    //get the hex string for a random shade of light green
    const getGreen = () => {
        var hex = "ABCDEF".split("");
        return "#5" + hex[Math.floor(Math.random() * hex.length)]+"5";
    }

    useEffect(() => {

        window.addEventListener('resize', resize);
        resize();

        const handleMessage = (message) => {
            if (messageQueue.current.length >= maxMessages) { //Store the last 200 messages
                messageQueue.current.shift()
            }
            messageQueue.current.push(message);
        }
        const source = new MessageSource();
        source.addListener(handleMessage);

        return () => { 
            source.close(); 
            //window.removeEventListener('resize');
            clearInterval(paintInterval.current);
        };

    }, [])

    useEffect(() => {

        paintInterval.current && clearInterval(paintInterval.current);
        paintInterval.current = setInterval(dial, 100);

    }, [maxMessages]);

    const resize = () => {

        resizeTimer.current && clearTimeout(resizeTimer.current);

        resizeTimer.current = setTimeout(() => {
            canvas.current = document.getElementById("displayCanvas");

            canvas.current.height = window.innerHeight;
            canvas.current.width = window.innerWidth;

            let rows = canvas.current.width / size;
            let cols = canvas.current.height / size;
            let canvasSize = Math.floor(vertical ? rows : cols);
            let maxIdx = Math.floor(vertical ? cols : rows);

            messageQueue.current = [];
            currentDisplayMessages.current = [];

            setMaxMessages(canvasSize);
            setMaxIdx(maxIdx);

        }, 500)

    }

    dial = () => {
        let init_message = "#DIALING.....".split("");
        let index = dialIndex.current % init_message.length;
        let context = canvas.current.getContext("2d");
        context.fillStyle = "rgba(0, 0, 0, 0.3)"; //Background color and fadeout speed
        context.fillRect(0, 0, canvas.current.width, canvas.current.height);
        context.fillStyle = getGreen(); 
        context.font = (size+5) + "px matrix";
        context.fillText(init_message[index], (canvas.current.width / 2) - (init_message.length / 2 * size) + (index * size), canvas.current.height / 3); 
        dialIndex.current += 1;

        console.log(messageQueue.current.length + ":" + maxMessages);
        if (messageQueue.current.length >= maxMessages) { //Show dialing message
            paintInterval.current && clearInterval(paintInterval.current);
            paintInterval.current = setInterval(stream, 100);
        }
    }

    stream = () => {
        let context = canvas.current.getContext("2d");

        //Controls the message density.
        //var restartThreshhold = 0.97; 

        //Background is colored and translucent
        context.fillStyle = "rgba(0, 0, 0, " + alpha + ")"; //Background color and fadeout speed
        context.fillRect(0, 0, canvas.current.width, canvas.current.height);
        
        context.fillStyle = "#0F0"; //green
        context.font = size + "px matrix";

        for(let i = 0; i < maxMessages; i++) {

            if (!currentDisplayMessages.current[i]) {
                currentDisplayMessages.current[i] = new DisplayMessage(messageQueue.current.shift())
            }

            var message = currentDisplayMessages.current[i];

            if (vertical) {
                context.fillStyle = getGreen(); //green
                context.fillText(message.current(), i*size, (message.getIdx() * size) + size); //Rewrite previous char in green
                context.fillStyle = "#FFF"; //white
                context.fillText(message.next(), i*size, (message.getIdx() * size) + size); //Write newest char illuminated

                //Randomly stagger resetting the line
                /*
                if(lines[i]*size > canvas.current.height && Math.random() > restartThreshhold) {
                    lines[i] = 0;
                    messages[i] = messageEvents[Math.floor(Math.random() * messageEvents.length)];
                }
                */
            } else {
                context.fillStyle = getGreen(); //green
                context.fillText(message.current(), (message.getIdx())*size, i*size); //Rewrite previous char in green
                context.fillStyle = "#FFF"; //white
                context.fillText(message.next(), message.getIdx()*size, i*size); //Write newest char illuminated

                //Randomly stagger resetting the line
                /*
                if(lines[i]*size > canvas.current.width && Math.random() > restartThreshhold) {
                    lines[i] = 0;
                    messages[i] = messageEvents[Math.floor(Math.random() * messageEvents.length)];
                }
                */
            }

            if (message.getIdx() >= maxIdx) {
                currentDisplayMessages.current[i] = null;
            }
            
        }

    };

    return <canvas id='displayCanvas'/>;
}

export default Matrix