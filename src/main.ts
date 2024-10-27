import { config } from 'dotenv';
config();
import { httpServer } from './http_server/index.js';
import WebSocket, { WebSocketServer } from 'ws';
import { parseRegBody } from './middleware/handleRegBody.js';
import { addUser, deleteUser, getUserById, IUser } from './users/users.js';
import { createUpdateResponse } from './middleware/createUpdateResponse.js';
import {
  handleJoinRoom,
  handleCreateRoom,
  handleUpdateRooms,
  handleCreateGame,
} from './middleware/parseRooms.js';
import { handleFirstTurn, handleStartGame } from './middleware/startGame.js';
import { addGame, getUserTurn } from './games/games.js';

const HTTP_PORT: string = process.env.HTTP_PORT || '8181';
const WSPORT: string = process.env.PORT || '3000';

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({ port: parseInt(WSPORT) });
const clients = new Map<string, WebSocket>();

wsServer.on('connection', (ws) => {
  const clientId = crypto.randomUUID();
  clients.set(clientId, ws);
  ws.on('message', async (message) => {
    console.log(`Received message: ${message.toString()}`);
    const type = JSON.parse(message.toString()).type;
    switch (type) {
      case 'reg': {
        const body = JSON.parse(JSON.parse(message.toString()).data);
        const parsedBody = await parseRegBody(body, clientId);
        const response = {
          type: parsedBody.type,
          data: JSON.stringify(parsedBody.data),
          id: parsedBody.id,
        };
        const isReg = await addUser({
          name: parsedBody.data.name,
          index: parsedBody.data.index as string,
          password: body.password,
          wins: 0,
        });
        if (isReg) {
          ws.send(JSON.stringify(response));
          const updateRes = await createUpdateResponse();
          broadcast(updateRes);
          const updateRoomRes = await handleUpdateRooms();
          broadcast(updateRoomRes);
        }
        break;
      }
      case 'create_room': {
        const roomIndex = crypto.randomUUID();
        const user = await getUserById(clientId);
        await handleCreateRoom(roomIndex, user as Omit<IUser, 'wins'>);
        const updateRoomRes = await handleUpdateRooms();
        broadcast(updateRoomRes);
        break;
      }
      case 'add_user_to_room': {
        const body = JSON.parse(message.toString());
        const user = await getUserById(clientId);
        const payload = JSON.parse(body.data).indexRoom;
        const secondUser = await handleJoinRoom(payload, user);
        if (secondUser.index) {
          const updateRoomRes = await handleUpdateRooms();
          broadcast(updateRoomRes);
          const idGame = crypto.randomUUID();
          const firstPlayerId = crypto.randomUUID();
          const secondPlayerId = crypto.randomUUID();
          await addGame({idGame:idGame, firstPlayerId:firstPlayerId, secondPlayerId:secondPlayerId, isFirst:true});
          const firstRequest = await handleCreateGame(idGame, firstPlayerId);
          const secondRequest = await handleCreateGame(idGame, secondPlayerId);
          ws.send(JSON.stringify(firstRequest));
          const secondClient = clients.get(secondUser.index);
          if (secondClient) {
            secondClient.send(JSON.stringify(secondRequest));
          }
        }
        break;
      }
      case 'add_ships': {
        const body = JSON.parse(message.toString());
        const bodyData = JSON.parse(body.data);
        const turn = await getUserTurn(bodyData.gameId);
        const turnBody = await handleFirstTurn(turn);
        const resBody = await handleStartGame({gameId:bodyData.gameId, ships:bodyData.ships, indexPlayer:bodyData.indexPlayer});
        ws.send(JSON.stringify(resBody));
        ws.send(JSON.stringify(turnBody));
        
        break;
      }
      case 'attack': {
        const body = JSON.parse(message.toString());
        const bodyData = JSON.parse(body.data);
        const gameId = bodyData.gameId;
        const currentPlayer = body.indexPlayer;
        const turn = await getUserTurn(gameId);
        if(turn == currentPlayer){
            // handle attack
        }
        break;
      }
      case 'randomAttack': {
        break;
      }
    }
  });

  ws.on('close', async () => {
    // add handleDisconnection, close all rooms + update
    await deleteUser(clientId);
    console.log('Client disconnected');
    clients.delete(clientId);
  });
});

function broadcast(message: unknown) {
  clients.forEach((el) => {
    el.send(JSON.stringify(message));
  });
}
