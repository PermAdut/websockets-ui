import { config } from 'dotenv';
config();
import { httpServer } from './http_server/index.js';
import WebSocket, { WebSocketServer } from 'ws';
import { parseRegBody } from './middleware/handleRegBody.js';
import { addUser, deleteUser, getUserById, IUser, updateWins } from './users/users.js';
import { createUpdateResponse } from './middleware/createUpdateResponse.js';
import {
  handleJoinRoom,
  handleCreateRoom,
  handleUpdateRooms,
  handleCreateGame,
} from './middleware/parseRooms.js';
import { handleFirstTurn, handleStartGame } from './middleware/startGame.js';
import { ActiveGame, addGame, addShpis, deleteGame, getGameById, getGameWinner, getUserTurn, updateGameTurn } from './games/games.js';
import { addMatrix, checkWinner, handleAttack, handleRandomAttack, isMatrixExist } from './ships/shipsLogic.js';
import { handleAttackBody, IAttackBody } from './middleware/handleAttack.js';
import { deleteRoomByUserId, isUserInRoom } from './rooms/rooms.js';

const HTTP_PORT: string = process.env.HTTP_PORT || '8181';
const WSPORT: string = process.env.PORT || '3000';

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({ port: parseInt(WSPORT) });
const clients = new Map<string, WebSocket>();
const sessions = new Map<string, WebSocket>();

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
        const isInRoom = await isUserInRoom(user.index);
        if(!isInRoom){
            await handleCreateRoom(roomIndex, user as Omit<IUser, 'wins'>);
            const updateRoomRes = await handleUpdateRooms();
            broadcast(updateRoomRes);
        }
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
            sessions.set(firstPlayerId, ws);
            sessions.set(secondPlayerId, secondClient);
          }
        }
        break;
      }
      case 'add_ships': {
        const body = JSON.parse(message.toString());
        const bodyData = JSON.parse(body.data); 
        const ships = bodyData.ships;
        await addShpis(bodyData.indexPlayer, bodyData.gameId, ships);
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
        const game:ActiveGame = await getGameById(gameId);
        if(!await isMatrixExist(gameId)){

            await addMatrix(game);
        }
        const currentPlayer = bodyData.indexPlayer;
        const turn = await getUserTurn(gameId);
        const firstSocket = sessions.get(game.firstPlayerId);
        const secondSocket = sessions.get(game.secondPlayerId);
        if(turn == currentPlayer){
           const attack = await handleAttack(bodyData.x, bodyData.y, gameId,bodyData.indexPlayer);
           const aBody:IAttackBody = {
            position:{
                x:bodyData.x,
                y:bodyData.y,
            },
            currentPlayer:currentPlayer,
            status:attack,
           }
           const feedBackRes = await handleAttackBody(aBody);
           console.log(feedBackRes);
           ws.send(JSON.stringify(feedBackRes));
           if(attack == "miss"){
            await updateGameTurn(gameId);
           }
           const win = await checkWinner(gameId);
           if(win){
            await deleteGame(gameId);
              const finishRes = {
                type:"finish",
                data:JSON.stringify({
                    winPlayer:win
                }),
                id:0,
              }
              firstSocket?.send(JSON.stringify(finishRes));
              secondSocket?.send(JSON.stringify(finishRes));
              const winnerId = sessions.get(win);
              let playerId = ""
              for (const [key, val] of clients.entries()) {
                if (val == winnerId) {
                    playerId = key; 
                }
              }
              await updateWins(playerId);
              const updateRes = await createUpdateResponse();
              broadcast(updateRes);
              sessions.delete(playerId);
              sessions.delete(win);
           } else {
            const userTurnId = await getUserTurn(gameId);
            const turn = await handleFirstTurn(userTurnId);
            firstSocket?.send(JSON.stringify(turn));
            secondSocket?.send(JSON.stringify(turn));
           }
        }
        break;
      }
      case 'randomAttack': {
        const body = JSON.parse(message.toString());
        const bodyData = JSON.parse(body.data);
        const gameId = bodyData.gameId;
        const game: ActiveGame = await getGameById(gameId);
    
        if (!await isMatrixExist(gameId)) {
            await addMatrix(game);
        }
    
        const currentPlayer = bodyData.indexPlayer;
        const turn = await getUserTurn(gameId);
        const firstSocket = sessions.get(game.firstPlayerId);
        const secondSocket = sessions.get(game.secondPlayerId);
    
        if (turn == currentPlayer) {

            const [x,y] = await handleRandomAttack(currentPlayer, game);
            if(x && y){
                const attack = await handleAttack(x, y, gameId, currentPlayer);
                const aBody: IAttackBody = {
                    position: {
                        x: x,
                        y: y,
                    },
                    currentPlayer: currentPlayer,
                    status: attack,
                };
                const feedBackRes = await handleAttackBody(aBody);
            console.log(feedBackRes);
            ws.send(JSON.stringify(feedBackRes));
            
            if (attack == "miss") {
                await updateGameTurn(gameId);
            }
    
            const win = await checkWinner(gameId);
            if (win) {
                await deleteGame(gameId);
                const finishRes = {
                    type: "finish",
                    data: JSON.stringify({
                        winPlayer: win
                    }),
                    id: 0,
                };
                firstSocket?.send(JSON.stringify(finishRes));
                secondSocket?.send(JSON.stringify(finishRes));
                const winnerId = sessions.get(win);
                let playerId = "";
                for (const [key, val] of clients.entries()) {
                    if (val == winnerId) {
                        playerId = key;
                    }
                }
                await updateWins(playerId);
                const updateRes = await createUpdateResponse();
                broadcast(updateRes);
                sessions.delete(playerId);
                sessions.delete(win);
            } else {
                const userTurnId = await getUserTurn(gameId);
                const turn = await handleFirstTurn(userTurnId);
                firstSocket?.send(JSON.stringify(turn));
                secondSocket?.send(JSON.stringify(turn));
            }
            }
        }
        break;
    }
    }
  });

  ws.on('close', async () => {
    if(await isUserInRoom(clientId)){
        await deleteRoomByUserId(clientId);
    }
    let playerId = "";
    for (const [key, val] of clients.entries()) {
        if (val == ws) {
            playerId = key;
        }
    }
    if(playerId){
        const win = await getGameWinner(playerId);
        const secondSocket = sessions.get(win);
        secondSocket?.send(JSON.stringify({
            type:"finish",
            data:JSON.stringify({
                winPlayer:win
            }),
            id:0,
        }))
        ws.send(JSON.stringify({
            type:"finish",
            data:JSON.stringify({
                winPlayer:win
            }),
            id:0,
        }))
        sessions.delete(playerId);
        sessions.delete(win)
    }
    await deleteUser(clientId);
    clients.delete(clientId);
  });
});

function broadcast(message: unknown) {
  clients.forEach((el) => {
    el.send(JSON.stringify(message));
  });
}
