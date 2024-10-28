export interface IUser {
  name: string;
  index: string;
  wins: number;
}

interface IUserData extends IUser {
  password: string;
}

const users: IUserData[] = [];

export const getUsers = async (): Promise<IUser[]> => {
  return users;
};

export const getUserById = async (index: string): Promise<IUser> => {
  const userIndex = users.findIndex((el) => el.index == index);
  return users[userIndex];
};

export const updateWins = async (index:string):Promise<void> => {
  const userIndex = users.findIndex((el) => el.index == index);
  users[userIndex].wins++;
}

export const addUser = async (user: IUserData): Promise<boolean> => {
  const index = users.findIndex((el) => el.name == user.name);
  if (index == -1) {
    users.push(user);
    return true;
  } else {
    if (users[index].password == user.password) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export const deleteUser = async (index:string): Promise<void> => {
  const fIndex = users.findIndex((el) => el.index == index);
  users.splice(fIndex, 1);
};
