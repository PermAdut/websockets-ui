// interface IAttack{
//     x:number,
//     y:number,
// }


// export async function handleAttack() {
    
// }


interface IFeedBackAttack{
    type:string,
    data:string,
    id:number,
}

export interface IAttackBody{
    position:{
        x:number,
        y:number,
    }
    currentPlayer:string,
    status:string
}


export async function handleAttackBody(body:IAttackBody):Promise<IFeedBackAttack> {
    const result = {
        type:"attack",
        data:JSON.stringify(body),
        id:0
    }
    return result;
}