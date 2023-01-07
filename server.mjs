
import Snoowrap from 'snoowrap';
import SnooStorm from 'snoostorm';
import got from 'got';
import express from 'express';
import path from 'path';

import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

var app = null;
var server = null;
var wss = null;

function startServer(clientId, clientSecret) {

  try {

    app = express();
    server = app.listen(8080);
    wss = new WebSocketServer({ server : server });
    app.use(express.static(path.dirname(fileURLToPath(import.meta.url)) + '/build'));

    const authHeader = "Basic " + btoa(clientId + ":" + clientSecret);

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

        ws.onerror = function (err) {
            console.warn(err);
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

  } catch (err) {
    console.error(err);
    console.warn("Server error, restarting...")

    server && server.close();
    wss && wss.close();

    setTimeout(() => { startServer(cliendId, clientSecret); }, 2000);
  }

}

const client = new SecretManagerServiceClient();

async function waitForSecret() {
  const [clientId] = await client.accessSecretVersion({name: 'projects/730860186624/secrets/reddit-client-id/versions/latest'});
  const [clientSecret] = await client.accessSecretVersion({name: 'projects/730860186624/secrets/reddit-client-secret/versions/latest'})

  startServer(clientId.payload.data, clientSecret.payload.data);
}

waitForSecret();