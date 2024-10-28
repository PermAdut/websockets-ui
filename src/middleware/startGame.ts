interface IGame{
    ships:IShips[],
    currentPlayerIndex:string,
}

interface ReqBody{
    gameId:string,
    ships:IShips[],
    indexPlayer:string,
}

export interface IShips{
    position:{
        x:number,
        y:number
    },
    direction:boolean,
    length:number,
    type: string
}

interface ResBody{
    type:string,
    data:IGame
    id:number,
}

interface TurnResBody{
    type:string,
    data:string,
    id:number,
}

export async function handleStartGame(data:ReqBody):Promise<ResBody>{
    const result:ResBody = {
        type:"start_game",
        data:{
            ships:data.ships,
            currentPlayerIndex:data.indexPlayer,
        },
        id:0,
    }
    return result;
}

export async function handleFirstTurn(currentPlayer:string):Promise<TurnResBody> {
    const result:TurnResBody = {
        type:"turn",
        data:JSON.stringify({
            currentPlayer:currentPlayer
        }),
        id:0
    }
    return result;
}