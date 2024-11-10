import { getUsers } from "../users/users.js";
import { IUser } from "../users/users.js";

interface IUpdateResponse{
    type:string,
    data: string,
    id:number,
}

interface IUserWins{
    name:string,
    wins:number,
}

export async function createUpdateResponse():Promise<IUpdateResponse>{
    const users:IUser[] = await getUsers();
    const resArr:IUserWins[] = users as  IUserWins[];
    const updateResponse:IUpdateResponse = {
        type:"update_winners",
        data:JSON.stringify(resArr),
        id:0
    }
    return updateResponse;
}