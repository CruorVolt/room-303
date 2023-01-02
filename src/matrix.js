/*
 * @author Anders Lundgren
 *
 * Inspired by Ryan Henszey's demo of canvas animation at http://timelessname.com/sandbox/matrix.html.
 */

import { v4 as uuid } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import { MessageSource } from './message_source';
import DisplayMessage from './display_message';

const size = 13;
const alpha = size / 200

//How many messages may display at once as a multiple of the number of display rows
const maxMessageDensity = 1.5;

//How many new messages may begin displaying in a single tic as a multiple of the number of display rows
const maxNewMessagePercentagePerTic = 0.01;

//How many trailing "fade-out" characters to display before clearing the message
const cleanupLagNumberOfChars = 50;

//How many messages to store in the buffer queue as a multiple of the total possible displayed messages
const messageBufferPercentage = 2.0;

//How far across the pane a message must reach before its line is available for a new message as a multiple of the pane size
const messageMinFollowDistance = 0.5;

//Display streaming after receiving this many messages
const minimumDisplayMessages = 10;

function Matrix() {

    var vertical = false;  //Whether to scroll vertically or horizontally

    //Messages buffered from the server
    const messageQueue = useRef([]);

    //Messages currently displaying
    const currentDisplayMessages = useRef(new Map());

    //Locations that new messages may start painting
    const availableNewDisplayRows = useRef(new Set());

    const canvas = useRef(null);
    const dialIndex = useRef(0);    //The current character displayed by dialing animation

    const paintInterval = useRef(null);
    const resizeTimer = useRef(null);

    const [numberOfDisplayRows, setNumberOfDisplayRows] = useState(100);
    const [maxIdx, setMaxIdx] = useState(100);

    //get the hex string for a random shade of light green
    const getGreen = () => {
        var hex = "ABCDEF".split("");
        return "#5" + hex[Math.floor(Math.random() * hex.length)]+"5";
    }

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
            currentDisplayMessages.current = new Map();

            setNumberOfDisplayRows(canvasSize);
            setMaxIdx(maxIdx);

            for (let i = 0; i < canvasSize; i++) {
                availableNewDisplayRows.current.add(i); //All rows start available
            }

        }, 500)

    }

    const dial = () => {
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

            if (messageQueue.current.length >= minimumDisplayMessages) {
                paintInterval.current && clearInterval(paintInterval.current);
                paintInterval.current = setInterval(stream, 75);
            }
        }
    }

    const paintNextCharacter = (displayMessage, context) => {
        if (vertical) {
            context.fillStyle = "#000"; //black
            context.fillRect(displayMessage.row*size - size + 1, (displayMessage.getIdx()-cleanupLagNumberOfChars)*size,size, size);
            context.fillStyle = getGreen(); //green
            context.fillText(displayMessage.current(), displayMessage.row*size, (displayMessage.getIdx() * size) + size); //Rewrite previous char in green
            context.fillStyle = "#FFF"; //white
            context.fillText(displayMessage.next(), displayMessage.row*size, (displayMessage.getIdx() * size) + size); //Write newest char illuminated
        } else {
            context.fillStyle = "#000"; //black
            context.fillRect((displayMessage.getIdx()-cleanupLagNumberOfChars)*size, displayMessage.row*size - size + 1, size, size);
            context.fillStyle = getGreen(); //green
            context.fillText(displayMessage.current(), (displayMessage.getIdx())*size, displayMessage.row*size); //Rewrite previous char in green
            context.fillStyle = "#FFF"; //white
            context.fillText(displayMessage.next(), displayMessage.getIdx()*size, displayMessage.row*size); //Write newest char illuminated
        }
    }

    const stream = () => {
        let context = canvas.current.getContext("2d");

        //Background is colored and translucent
        context.fillStyle = "rgba(0, 0, 0, " + alpha + ")"; //Background color and fadeout speed
        context.fillRect(0, 0, canvas.current.width, canvas.current.height);
        
        context.fillStyle = "#0F0"; //green
        context.font = size + "px matrix";

        //Check available lines and add new messages
        let i = 0;
        let availableRows = ((availableNewDisplayRows.current.size > 0) && (currentDisplayMessages.current.size < Math.floor(numberOfDisplayRows * maxMessageDensity)));
        let percentageFull = currentDisplayMessages.current.size / Math.floor(numberOfDisplayRows * maxMessageDensity);

        //availableRows = availableRows && Math.random() > (-Math.pow( percentageFull - 1, 2 ) + 1);
        availableRows = availableRows && Math.random() > percentageFull;

        while ((availableRows) && (i < Math.ceil(numberOfDisplayRows * maxNewMessagePercentagePerTic))) {
            let rowIdx = Array.from(availableNewDisplayRows.current)[
                Math.floor(Math.random() * availableNewDisplayRows.current.size) 
            ];
            availableNewDisplayRows.current.delete(rowIdx);

            let messageText = messageQueue.current.shift();
            if (messageText) {
                let messageKey = uuid();
                let displayMessage = new DisplayMessage(messageText, rowIdx, messageKey);
                currentDisplayMessages.current.set(messageKey, displayMessage);
            }
            i++;
        }

        for (let [key,message] of currentDisplayMessages.current) {

            paintNextCharacter(message, context);

            if (message.getIdx() === Math.floor(maxIdx * messageMinFollowDistance)) {
                availableNewDisplayRows.current.add(message.row);
            }

            if (message.getIdx() >= (maxIdx + cleanupLagNumberOfChars)) {
                currentDisplayMessages.current.delete(key);
            }
            
        };

    };

    //Determine the screen dimensions on mouunt
    useEffect(resize, [vertical]);

    //Manage data source
    useEffect(() => {

        const handleMessage = (message) => {
            let maxMessages = Math.floor(numberOfDisplayRows * maxMessageDensity * messageBufferPercentage);
            if (messageQueue.current.length >= maxMessages) {
                messageQueue.current.shift()
            }
            messageQueue.current.push(message);
        }
        const source = new MessageSource();
        source.addListener(handleMessage);

        return () => {
            source.close(); 
        };

    }, [numberOfDisplayRows])

    useEffect(() => {

        window.addEventListener('resize', resize);

        paintInterval.current && clearInterval(paintInterval.current);
        paintInterval.current = setInterval(dial, 100);

        return () => { 
            window.removeEventListener('resize', resize);
            clearInterval(paintInterval.current);
        };

    }, [numberOfDisplayRows]);


    return <canvas id='displayCanvas'/>;
}

export default Matrix