export interface ActiveGame{
    idGame:string,
    firstPlayerId:string,
    secondPlayerId:string,
    isFirst:boolean,
}

const games: ActiveGame[] = [];

export async function getGames() {
    return games;
}

export async function getGameById(gameId:string) {
    const index = games.findIndex(el => el.idGame == gameId);
    return games[index];
}

export async function addGame(game:ActiveGame) {
    games.push(game)
}

export async function deleteGame(gameId:string) {
    const index = games.findIndex(el => el.idGame == gameId)
    games.splice(index, 1);
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