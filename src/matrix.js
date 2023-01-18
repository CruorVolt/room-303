/*
 * @author Anders Lundgren
 *
 * Inspired by Ryan Henszey's demo of canvas animation at http://timelessname.com/sandbox/matrix.html.
 */

import { v4 as uuid } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import { MessageSource } from './message_source';

import getRandomAdvice from './life_advice';
import DisplayMessage from './display_message';

const size = 13;
const alpha = 0.065;
const alphaLessColor = "#010101";

//How many messages may display at once as a multiple of the number of display rows
const maxMessageDensity = 1.5;

//How many new messages may begin displaying in a single tic as a multiple of the number of display rows
const maxNewMessagePercentagePerTic = 0.01;

//How many trailing "fade-out" characters to display before clearing the message
const cleanupLagNumberOfChars = 50;

//How many messages to store in the buffer queue
const maxMessageBuffer = 1000;

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

            window.removeEventListener('resize', resize);
            window.addEventListener('resize', resize);

            let message = getRandomAdvice();

            let context = canvas.current.getContext("2d");
            context.fillStyle = "#010101";
            context.fillRect(0, 0, canvas.current.width, canvas.current.height);

            dialIndex.current = 0;
            paintInterval.current && clearInterval(paintInterval.current);
            paintInterval.current = setInterval( () => {dial(message);} , 100);

            return () => { 
                window.removeEventListener('resize', resize);
                clearInterval(paintInterval.current);
            };

            }, 500)

    }

    const dial = (message) => {
        let init_message = message.split("");
        let index = dialIndex.current;
        if (canvas.current) {
            if (index < init_message.length) {
                let context = canvas.current.getContext("2d");
                context.fillStyle = getGreen(); 
                context.font = (size+5) + "px matrix";
                context.fillText(init_message[index], (canvas.current.width / 2) - (init_message.length / 2 * size) + (index * size), canvas.current.height / 3); 
                dialIndex.current += 1;
            }

            if ((index >= init_message.length) && (messageQueue.current.length >= minimumDisplayMessages)) {
                paintInterval.current && clearInterval(paintInterval.current);
                paintInterval.current = setInterval(stream, 75);
            }
        }
    }

    const paintNextCharacter = (displayMessage, context) => {
        let cleanupCoordinate = (displayMessage.getIdx()-cleanupLagNumberOfChars)*size;
        if (vertical) {
            context.fillStyle = alphaLessColor; //black
            context.fillRect(displayMessage.row*size - size + 1, cleanupCoordinate, size, size);
            context.fillStyle = getGreen(); //green
            context.fillText(displayMessage.current(), displayMessage.row*size, (displayMessage.getIdx() * size) + size); //Rewrite previous char in green
            context.fillStyle = "#FFF"; //white
            context.fillText(displayMessage.next(), displayMessage.row*size, (displayMessage.getIdx() * size) + size); //Write newest char illuminated
        } else {
            context.fillStyle = alphaLessColor; //black
            context.fillRect(cleanupCoordinate, displayMessage.row*size - size + 1, size, size);
            context.fillStyle = getGreen(); //green
            context.fillText(displayMessage.current(), (displayMessage.getIdx())*size, displayMessage.row*size); //Rewrite previous char in green
            context.fillStyle = "#FFF"; //white
            context.fillText(displayMessage.next(), displayMessage.getIdx()*size, displayMessage.row*size); //Write newest char illuminated
        }
        return cleanupCoordinate;
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

            let messageText = messageQueue.current.shift();
            if (messageText) {
                let messageKey = uuid();
                let displayMessage = new DisplayMessage(messageText, rowIdx, messageKey);
                availableNewDisplayRows.current.delete(rowIdx);
                currentDisplayMessages.current.set(messageKey, displayMessage);
            }
            i++;
        }

        for (let [key,message] of currentDisplayMessages.current) {

            if (message.getIdx() === Math.floor(maxIdx * messageMinFollowDistance)) {
                availableNewDisplayRows.current.add(message.row);
            }

            let trailingCoord = paintNextCharacter(message, context);
            let maxCoord = vertical ? canvas.current.clientHeight : canvas.current.clientWidth;

            if (trailingCoord > maxCoord) {
                currentDisplayMessages.current.delete(key);
            }
            
        };

    };

    //Determine the screen dimensions on mouunt
    useEffect(resize, []);

    //Manage data source
    useEffect(() => {

        const handleMessage = (message) => {
            if (messageQueue.current.length >= maxMessageBuffer) {
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

    return <canvas id='displayCanvas'/>;
}

export default Matrix