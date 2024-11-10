import { ActiveGame } from "src/games/games.js";
import { IShips } from "src/middleware/startGame.js";

interface IGameMatrixes{
    gameId:string,
    firstPlayerMatrix:number[][],
    secondPlayerMatrix:number[][],
    firstPlayerId:string,
    secondPlayerId:string,
}

const allMatrixes:IGameMatrixes[] = [];

export async function getAllMatrixes() {
    return allMatrixes
}

export async function getMatrixById(gameId:string) {
    const index = allMatrixes.findIndex(el => el.gameId == gameId)
    return allMatrixes[index];
}

export async function isMatrixExist(gameId:string) {
    const index = allMatrixes.findIndex(el => el.gameId == gameId)
    if(index != -1){
        return true;
    } else {
        return false;
    }
}

export async function addMatrix(game:ActiveGame) {
    const result:IGameMatrixes = {
        gameId:game.idGame,
        firstPlayerMatrix: await createMatrix(game,game.firstPlayerId),
        secondPlayerMatrix:await createMatrix(game,game.secondPlayerId),
        firstPlayerId: game.firstPlayerId,
        secondPlayerId:game.secondPlayerId,
    }
    allMatrixes.push(result);
    return result;
}

export async function handleAttack(x: number, y: number, gameId: string, playerId: string) {
    const matrix = await getMatrixById(gameId);
    let result: string;
    const playerMatrix = playerId === matrix.firstPlayerId ? matrix.secondPlayerMatrix : matrix.firstPlayerMatrix;

    const cellValue = playerMatrix[y][x];

    if (cellValue === 0) {
        playerMatrix[y][x] = -1; 
        result = "miss"; 
    } else if (cellValue === 1) {
        playerMatrix[y][x] = -1; 

        const isKill = checkIfShipSunk(playerMatrix, x, y);
        result = isKill ? "killed" : "shot"; 
    } else {
        result = "already shot"; 
    }   

    return result;
}

function checkIfShipSunk(playerMatrix: number[][], x: number, y: number): boolean {
    if (playerMatrix[y][x] !== -1) {
        return false; 
    }
    const directions = [
        { dx: 1, dy: 0 },  
        { dx: -1, dy: 0 }, 
        { dx: 0, dy: 1 },  
        { dx: 0, dy: -1 }  
    ];
    const isShipSunk = (x: number, y: number): boolean => {
        for (const direction of directions) {
            let checkX = x + direction.dx;
            let checkY = y + direction.dy;

            while (checkX >= 0 && checkX < playerMatrix[0].length && checkY >= 0 && checkY < playerMatrix.length) {
                if (playerMatrix[checkY][checkX] === 1) {
                    return false; 
                }
                if (playerMatrix[checkY][checkX] === 0 || playerMatrix[checkY][checkX] === -1) {
                    break; 
                }
                checkX += direction.dx;
                checkY += direction.dy;
            }
        }
        return true; 
    };

    return isShipSunk(x, y);
}


async function createMatrix(game:ActiveGame, userId:string): Promise<number[][]> {
    const rows: number= 10
    const cols:number = 10;
    const matrix: number[][] = [];
    let ships:IShips[] | undefined;
    if(userId == game.firstPlayerId){
        ships = game.shipsFirst;
    } else {
        ships = game.shipsSecond
    } 
    for (let i = 0; i < rows; i++) {
        const row: number[] = Array(cols).fill(0); 
        matrix.push(row);
    }
    if(ships)
    for(const ship of ships){
        if(ship.direction){
            // vertical dir
            for(let i = ship.position.y; i<ship.position.y + ship.length; i++){
                matrix[i][ship.position.x] = 1;
            }
        } else {
            // horizontal dir
            for(let i = ship.position.x; i<ship.position.x + ship.length; i++){
                matrix[ship.position.y][i] = 1;
            }
        }
    }
    return matrix;
}


export async function checkWinner(gameId:string) {
    const game = await getMatrixById(gameId);
    if(await areAllShipsSunk(game.firstPlayerMatrix)){
        return game.secondPlayerId;
    }
    if(await areAllShipsSunk(game.secondPlayerMatrix)){
        return game.firstPlayerId;
    }
    return undefined
}

async function areAllShipsSunk(playerMatrix: number[][]): Promise<boolean> {
    for (const row of playerMatrix) {
        for (const cell of row) {
            if (cell === 1) {
                return false; 
            }
        }
    }
    return true; 
}


export async function handleRandomAttack(currentPlayer:string, game:ActiveGame):Promise<[number | undefined,number | undefined]> {
    let x, y;
    const matrix = await getMatrixById(game.idGame);
    const playerMatrix = currentPlayer === game.firstPlayerId ? matrix.secondPlayerMatrix : matrix.firstPlayerMatrix;
    
    let validAttack = false;
    while (!validAttack) {
        x = Math.floor(Math.random() * playerMatrix[0].length);
        y = Math.floor(Math.random() * playerMatrix.length);
        if (playerMatrix[y][x] === 0 || playerMatrix[y][x] === 1) {
            validAttack = true; 
        }
    }
    return [x,y];
}