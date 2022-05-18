import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server } from 'colyseus';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { GameRoom } from './game-room';

const app = express();
app.use(cors());
app.use('/monitor', monitor());

const server = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
});
gameServer.define('game', GameRoom);

const port = 3333;

gameServer.listen(port).then(() => {
  console.log(`Listening at port ${port}!`);
});
