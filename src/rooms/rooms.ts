import { IUser } from "src/users/users.js";

export interface IRoom{
    roomId:string,
    players:number,
    roomUsers:Omit<IUser, 'wins'>[]
}

const rooms:IRoom[] = [];

export async function addRoom(index:string, user:Omit<IUser, 'wins'>) {
    rooms.push({roomId:index, players:1, roomUsers:[{name:user.name, index:user.index}]})
}

export async function joinRoom(roomId:string,  user:Omit<IUser, 'wins'>):Promise<Omit<IUser, 'wins'>> {
    const index = rooms.findIndex((el)=> el.roomId == roomId);
    if(rooms[index].roomUsers[0] != user){
        const findUser = rooms[index].roomUsers[0];
        rooms.splice(index, 1);
        return findUser;
    }
    return user;

}

export async function deleteRoomByUserId(userId:string) {
    const index = rooms.findIndex((el)=> el.roomUsers[0].index == userId);
    rooms.splice(index, 1);
}

export async function isUserInRoom(userId:string):Promise<boolean> {
    const index = rooms.findIndex((el)=> el.roomUsers[0].index == userId);
    if(index == -1){
        return false
    } else {
        return true;
    }
}

export async function getRooms():Promise<IRoom[]> {
    return rooms;
}

