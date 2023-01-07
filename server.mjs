
import Snoowrap from 'snoowrap';
import SnooStorm from 'snoostorm';
import got from 'got';
import express from 'express';
import path from 'path';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

var app = null;
var server = null;
var socket = null;

function startServer(clientId, clientSecret) {

  try {

    app = express();
    server = createServer(app);
    socket = new Server(server);

    server.listen(8080, () => { })

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
    
    let timer = null;

    socket.on("connection", ws => {

        console.log("Client connect");

        ws.on("disconnect", () => {
            console.log("Client disconnect");
            clearInterval(timer);
        });

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
            ws.emit('message', message);
          });

        }, (err) => {
            console.error(err);
        })

    });

    console.log("socket.io initialized");

  } catch (err) {
    console.error(err);
    console.warn("Server error, restarting...")

    server && server.close();
    socket && socket.close();

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