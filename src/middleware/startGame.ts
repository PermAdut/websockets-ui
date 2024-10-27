interface IGame{
    ships:IShpis[],
    currentPlayerIndex:string,
}

interface ReqBody{
    gameId:string,
    ships:IShpis[],
    indexPlayer:string,
}

interface IShpis{
    position:{
        x:number,
        y:number
    },
    direction:boolean,
    length:number,
    type: shipType
}

enum shipType {
    small = "small",
    medium = "medium",
    large = "large",
    huge = "huge",
}

interface ResBody{
    type:string,
    data:IGame
    id:number,
}

interface TurnResBody{
    type:string,
    data:{
        currentPlayer:string,
    }
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
        data:{
            currentPlayer:currentPlayer
        },
        id:0
    }
    return result;
}