import { addRoom, getRooms, IRoom, joinRoom } from "../rooms/rooms.js"
import { IUser } from "../users/users.js"

interface IUpdateRoomRes{
    type:string,
    data:string,
    id:number,
}


export const handleUpdateRooms = async ():Promise<IUpdateRoomRes> => {
    const avRooms = await getRooms();
    const result:IUpdateRoomRes = {
        type:"update_room",
        data:JSON.stringify(avRooms as Omit<IRoom, 'players'>[]),
        id:0
    }
    return result;
}

export const handleCreateRoom = async (index:string, user:Omit<IUser, 'wins'>) => {
    await addRoom(index, user);
}

export const handleJoinRoom = async(index:string,user:Omit<IUser, 'wins'>):Promise<Omit<IUser, 'wins'>> => {
    const savedUser = await joinRoom(index, user);
    return savedUser;
}

export const handleCreateGame = async(idGame:string,idPlayer:string) => {
    const result:IUpdateRoomRes = {
        type:"create_game",
        data:JSON.stringify({idGame:idGame, idPlayer:idPlayer}),
        id:0,
    }
    return result;
}