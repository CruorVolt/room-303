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
    var vertical = false;  //Whether to scroll vertically or horizontally

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

    //Manage data source
    useEffect(() => {

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
        };

    }, [])

    useEffect(() => {

        window.addEventListener('resize', resize);

        paintInterval.current && clearInterval(paintInterval.current);
        paintInterval.current = setInterval(dial, 100);

        return () => { 
            window.removeEventListener('resize', resize);
            clearInterval(paintInterval.current);
        };

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

    useEffect(resize, []);

    dial = () => {
        let init_message = "#DIALING.....".split("");
        let index = dialIndex.current % init_message.length;
        if (canvas.current) {
            let context = canvas.current.getContext("2d");
            context.fillStyle = "rgba(0, 0, 0, 0.3)"; //Background color and fadeout speed
            context.fillRect(0, 0, canvas.current.width, canvas.current.height);
            context.fillStyle = getGreen(); 
            context.font = (size+5) + "px matrix";
            context.fillText(init_message[index], (canvas.current.width / 2) - (init_message.length / 2 * size) + (index * size), canvas.current.height / 3); 
            dialIndex.current += 1;

            if (messageQueue.current.length >= maxMessages) { //Show dialing message
                paintInterval.current && clearInterval(paintInterval.current);
                paintInterval.current = setInterval(stream, 75);
            }
        }
    }

    stream = () => {
        let cleanupLag = 50;
        let context = canvas.current.getContext("2d");

        //Background is colored and translucent
        context.fillStyle = "rgba(0, 0, 0, " + alpha + ")"; //Background color and fadeout speed
        context.fillRect(0, 0, canvas.current.width, canvas.current.height);
        
        context.fillStyle = "#0F0"; //green
        context.font = size + "px matrix";

        for(let i = 0; i < maxMessages; i++) {

            if (!currentDisplayMessages.current[i]) {
                let nextMessage = messageQueue.current.shift();
                if (nextMessage) {
                    currentDisplayMessages.current[i] = new DisplayMessage(nextMessage);
                } else {
                    continue;
                }
            }

            var message = currentDisplayMessages.current[i];

            if ((message.current() == 0) && (Math.random() < 0.5)) {
                continue;
            }


            if (vertical) {
                context.fillStyle = "#000"; //black
                context.fillRect(i*size - size + 1, (message.getIdx()-cleanupLag)*size,size, size);

                context.fillStyle = getGreen(); //green
                context.fillText(message.current(), i*size, (message.getIdx() * size) + size); //Rewrite previous char in green
                context.fillStyle = "#FFF"; //white
                context.fillText(message.next(), i*size, (message.getIdx() * size) + size); //Write newest char illuminated

            } else {
                context.fillStyle = "#000"; //black
                context.fillRect((message.getIdx()-cleanupLag)*size, i*size - size + 1, size, size);

                context.fillStyle = getGreen(); //green
                context.fillText(message.current(), (message.getIdx())*size, i*size); //Rewrite previous char in green
                context.fillStyle = "#FFF"; //white
                context.fillText(message.next(), message.getIdx()*size, i*size); //Write newest char illuminated


            }

            if (message.getIdx() >= (maxIdx + cleanupLag)) {
                currentDisplayMessages.current[i] = null;
            }
            
        }

    };

    return <canvas id='displayCanvas'/>;
}

export default Matrix