import { addRoom, getAvailableRooms, IRoom } from "../rooms/rooms.js"
import { IUser } from "../users/users.js"

interface IUpdateRoomRes{
    type:string,
    data:string,
    id:number,
}

export const handleUpdateRooms = async ():Promise<IUpdateRoomRes> => {
    const avRooms = await getAvailableRooms();
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