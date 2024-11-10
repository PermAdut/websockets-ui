import { IShips } from "src/middleware/startGame.js";

export interface ActiveGame{
    idGame:string,
    firstPlayerId:string,
    secondPlayerId:string,
    isFirst:boolean,
    shipsFirst?:IShips[],
    shipsSecond?:IShips[],
}

const games: ActiveGame[] = [];

export async function getGames() {
    return games;
}

export async function getGameById(gameId:string) {
    const index = games.findIndex(el => el.idGame == gameId);
    return games[index];
}

export async function getGameWinner(userId:string):Promise<string> {
    const index = games.findIndex(el => el.firstPlayerId == userId);
    if(index != -1){
        await deleteGame(games[index].idGame)
        return games[index].secondPlayerId;
    } 
    const sIndex = games.findIndex(el => el.secondPlayerId == userId);
    if(sIndex != -1){
        await deleteGame(games[sIndex].idGame)
        return games[index].firstPlayerId;
    }
    return '';
}

export async function addGame(game:ActiveGame) {
    games.push(game)
}

export async function addShpis(userId:string, gameId:string, ships:IShips[]) {
    const game = await getGameById(gameId);
    if(userId === game.firstPlayerId){
        game.shipsFirst = ships
    } else {
        game.shipsSecond = ships
    }
}

export async function deleteGame(gameId:string) {
    const index = games.findIndex(el => el.idGame == gameId)
    games.splice(index, 1);
}

export async function updateGameTurn(gameId:string) {
    const game = await getGameById(gameId);
    game.isFirst = !game.isFirst;
}

export async function getUserTurn(gameId:string) {
    const game = await getGameById(gameId);
    if(game.isFirst){
        return game.firstPlayerId;
    } else {
        return game.secondPlayerId;
    }
}

export async function changeTurn(gameId:string) {
    const game = await getGameById(gameId);
    game.isFirst = !game.isFirst
}


