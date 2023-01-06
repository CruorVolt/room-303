
import { WebSocketServer } from 'ws';
import Snoowrap from 'snoowrap';
import SnooStorm from 'snoostorm';
import got from 'got';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/reddit_secret.mjs';

var app = express();
var server = app.listen(8080);
var wss = new WebSocketServer({ server : server });
app.use(express.static(path.dirname(fileURLToPath(import.meta.url)) + '/build'));

const authHeader = "Basic " + btoa(config.clientId + ":" + config.clientSecret);

let url_params = [
  'grant_type=client_credentials',
  'response_type=code',
  'state=' + String(Math.random()).slice(2),
  'redirect_uri=https%3A%2F%2Fanderslundgren.dev%2F',
  'duration=permanent',
  'scope=read'
];
 
// Creating a new websocket server
//const wss = new WebSocketServer({ port: 8080 })

let timer = null;

// Creating connection using websocket
wss.on("connection", ws => {

    console.log("Client connect");

    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    });

    ws.on("close", () => {
        console.log("Client disconnect");
        clearInterval(timer);
    });

    ws.onerror = function () {
        console.log("Some Error occurred")
    }

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
      console.log("Token recieved: " + resp.body);

      const client = new Snoowrap({
        userAgent: "ROOM-303",
        accessToken: JSON.parse(resp.body).access_token
      });
      
      const submissions = new SnooStorm.SubmissionStream(client, {
        subreddit: "Popular",
        limit: 50,
        pollTime: 2000,
      });

      submissions.on("item", (item) => {
        let message = item.subreddit.display_name + ": " + item.title;
        ws.send(message);
      });

    }, (err) => {
        console.error(err);
    })

});

console.log("The WebSocket server is running on port 8080");