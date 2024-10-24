
import { config } from 'dotenv';
config();
import { httpServer } from './http_server/index.js';
import WebSocket, { WebSocketServer } from 'ws';
import { parseRegBody } from './middleware/handleRegBody.js';
import { addUser, getUserById, IUser } from './users/users.js';
import { createUpdateResponse } from './middleware/createUpdateResponse.js';
import { handleCreateRoom, handleUpdateRooms } from './middleware/parseRooms.js';


const HTTP_PORT: string = process.env.HTTP_PORT || '8181';
const WSPORT: string = process.env.PORT || '3000';

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({ port: parseInt(WSPORT) });
const clients = new Map<string, WebSocket>();

wsServer.on('connection', (ws) => {
    const clientId = Date.now().toString();
    clients.set(clientId, ws);
  ws.on('message',async (message) => {
    console.log(`Received message: ${JSON.parse(message.toString())}`);
    const type = JSON.parse(message.toString()).type;
    switch(type){
        case "reg":{
            const body = JSON.parse(JSON.parse(message.toString()).data);
            const parsedBody = await parseRegBody(body, clientId);
            const response = {
                type:parsedBody.type,
                data:JSON.stringify(parsedBody.data),
                id:parsedBody.id,
            }
            await addUser({name:parsedBody.data.name, index:parsedBody.data.index as string, wins:0});
            ws.send(JSON.stringify(response));
            const updateRes = await createUpdateResponse();
            broadcast(updateRes);
            //ws.send(JSON.stringify(updateRes));
            const updateRoomRes = await handleUpdateRooms();
            broadcast(updateRoomRes);
            //ws.send(JSON.stringify(updateRoomRes));
            break;
        }
        case "create_room":{
            const roomIndex = Date.now().toString();
            const user = await getUserById(clientId);
            await handleCreateRoom(roomIndex, user as Omit<IUser, 'wins'>);
            const updateRoomRes = await handleUpdateRooms();
            broadcast(updateRoomRes);
            //ws.send(JSON.stringify(updateRoomRes));
            break;
        }
        case "add_user_to_room":{
            const body = JSON.parse(message.toString());
            console.log(body);
            break;
        }
        case "add_ships":{
            break;
        }
        case "attack":{
            break;
        }
        case "randomAttack":{
            break;
        }
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(clientId);
  });
});


function broadcast(message:unknown){
    clients.forEach((el) => {
        el.send(JSON.stringify(message));
    })
}