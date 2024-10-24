export interface IUser {
  name: string;
  index: string;
  wins:number,
}

const users: IUser[] = [];

export const getUsers = async (): Promise<IUser[]> => {
  return users;
};

export const getUserById = async (index:string):Promise<IUser | null> => {
    const userIndex = users.findIndex((el) => el.index == index);
    if(userIndex != -1)
        return users[userIndex] 
    else    
        return null;
}

export const addUser = async (user: IUser): Promise<boolean> => {
  const index = users.findIndex((el) => el.index == user.index);
  if (index == -1) {
    users.push(user);
    return true;
  } else {
    return false;
  }
};

export const deleteUser = async (user:IUser): Promise<void> => {
    const index = users.findIndex((el) => el.index == user.index);
    users.splice(index, 1);
}
