import { IUser } from "src/users/users.js";

export interface IRoom{
    index:string,
    players:number,
    roomUsers:Omit<IUser, 'wins'>[]
}

const rooms:IRoom[] = [];

const availableRooms:IRoom[] = [];

export async function addRoom(index:string, user:Omit<IUser, 'wins'>) {
    rooms.push({index:index, players:1, roomUsers:[{name:user.name, index:user.index}]})
    availableRooms.push({index:index, players:1, roomUsers:[{name:user.name, index:user.index}]});
}

export async function joinRoom(roomId:string) {
    const aIndex = availableRooms.findIndex((el)=> el.index == roomId);
    const index = rooms.findIndex((el)=> el.index == roomId);
    availableRooms.splice(aIndex, 1);
    rooms[index].players = 2;
}

export async function getAvailableRooms():Promise<IRoom[]> {
    return availableRooms;
}

export async function getRooms():Promise<IRoom[]> {
    return rooms;
}

export async function endGame(room:IRoom):Promise<void>{
    const index = rooms.findIndex((el)=> el.index == room.index);
    rooms.splice(index, 1);
}