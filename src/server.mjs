
import {WebSocketServer} from 'ws';
import Snoowrap from 'snoowrap';
import SnooStorm from 'snoostorm';
import got from 'got';

import config from './../config/reddit_secret.mjs';

const authHeader = "Basic " + btoa(config.clientId + ":" + config.clientSecret);

let url_params = [
  'grant_type=client_credentials',
  'response_type=code',
  'state=' + String(Math.random()).slice(2),
  'redirect_uri=https%3A%2F%2Fanderslundgren.dev%2F',
  'duration=permanent',
  'scope=read'
];

let auth = got.post(
  "https://www.reddit.com/api/v1/access_token?" + url_params.join('&'),
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader
    },
    retry: {limit: 0}
  }
);

auth.then( (resp) => {
    console.log(resp.body);
    process.exit();
}, (err) => {
    console.error(err);
    process.exit();
})

//const client = new Snoowrap(credentials);

/*
const submissions = new SnooStorm.SubmissionStream(client, {
  subreddit: "AskReddit",
  limit: 10,
  pollTime: 2000,
});
submissions.on("item", () => {console.log("ITEM");});
*/
 
// Creating a new websocket server
const wss = new WebSocketServer({ port: 8080 })

let timer = null;
 
// Creating connection using websocket
wss.on("connection", ws => {

    console.log("new client connected");

    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    });

    ws.on("close", () => {
        console.log("the client has connected");
        clearInterval(timer);
    });

    ws.onerror = function () {
        console.log("Some Error occurred")
    }

    timer = setInterval( () => {
        let message = "";
        let length = Math.floor(Math.random() * 100);
        for (let i = 0; i <= length; i++ ) {
            let charCode = Math.floor(Math.random() * 25) + 65;
            message += String.fromCharCode(charCode);
        }
        ws.send(message);
    }, 100);

});

console.log("The WebSocket server is running on port 8080");