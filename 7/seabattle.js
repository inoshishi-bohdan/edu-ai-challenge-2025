const readline = require('readline');

// Game Configuration
const CONFIG = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3,
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  }
};

// Utility Functions
const Utils = {
  getRandomInt: (min, max) => Math.floor(Math.random() * (max - min)) + min,
  
  isValidCoordinate: (row, col) => {
    return row >= 0 && row < CONFIG.BOARD_SIZE && col >= 0 && col < CONFIG.BOARD_SIZE;
  },
  
  parseCoordinate: (input) => {
    if (!input || input.length !== 2) return null;
    const row = parseInt(input[0]);
    const col = parseInt(input[1]);
    return { row, col, isValid: !isNaN(row) && !isNaN(col) && Utils.isValidCoordinate(row, col) };
  },
  
  coordinateToString: (row, col) => `${row}${col}`,
  
  getAdjacentCoordinates: (row, col) => [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ].filter(coord => Utils.isValidCoordinate(coord.row, coord.col))
};

// Ship Class
class Ship {
  constructor() {
    this.locations = [];
    this.hits = new Array(CONFIG.SHIP_LENGTH).fill(false);
  }
  
  addLocation(row, col) {
    this.locations.push(Utils.coordinateToString(row, col));
  }
  
  isHit(coordinate) {
    const index = this.locations.indexOf(coordinate);
    return index !== -1 && this.hits[index];
  }
  
  hit(coordinate) {
    const index = this.locations.indexOf(coordinate);
    if (index !== -1) {
      this.hits[index] = true;
      return true;
    }
    return false;
  }
  
  isSunk() {
    return this.hits.every(hit => hit);
  }
  
  hasLocation(coordinate) {
    return this.locations.includes(coordinate);
  }
}

// Board Class
class Board {
  constructor() {
    this.grid = Array(CONFIG.BOARD_SIZE).fill(null)
      .map(() => Array(CONFIG.BOARD_SIZE).fill(CONFIG.SYMBOLS.WATER));
    this.ships = [];
  }
  
  placeShip(ship, showOnBoard = false) {
    this.ships.push(ship);
    if (showOnBoard) {
      ship.locations.forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        this.grid[row][col] = CONFIG.SYMBOLS.SHIP;
      });
    }
  }
  
  createRandomShip() {
    const ship = new Ship();
    let placed = false;
    
    while (!placed) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const startRow = orientation === 'horizontal' 
        ? Utils.getRandomInt(0, CONFIG.BOARD_SIZE)
        : Utils.getRandomInt(0, CONFIG.BOARD_SIZE - CONFIG.SHIP_LENGTH + 1);
      const startCol = orientation === 'horizontal'
        ? Utils.getRandomInt(0, CONFIG.BOARD_SIZE - CONFIG.SHIP_LENGTH + 1)
        : Utils.getRandomInt(0, CONFIG.BOARD_SIZE);
      
      // Check if placement is valid
      let canPlace = true;
      const tempLocations = [];
      
      for (let i = 0; i < CONFIG.SHIP_LENGTH; i++) {
        const row = orientation === 'horizontal' ? startRow : startRow + i;
        const col = orientation === 'horizontal' ? startCol + i : startCol;
        const coordinate = Utils.coordinateToString(row, col);
        
        if (this.grid[row][col] !== CONFIG.SYMBOLS.WATER) {
          canPlace = false;
          break;
        }
        tempLocations.push({ row, col });
      }
      
      if (canPlace) {
        tempLocations.forEach(({ row, col }) => ship.addLocation(row, col));
        placed = true;
      }
    }
    
    return ship;
  }
  
  processAttack(coordinate) {
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);
    
    for (const ship of this.ships) {
      if (ship.hasLocation(coordinate)) {
        ship.hit(coordinate);
        this.grid[row][col] = CONFIG.SYMBOLS.HIT;
        return {
          isHit: true,
          isSunk: ship.isSunk(),
          wasAlreadyHit: ship.isHit(coordinate) // This won't work as intended, but maintaining original logic
        };
      }
    }
    
    this.grid[row][col] = CONFIG.SYMBOLS.MISS;
    return { isHit: false, isSunk: false, wasAlreadyHit: false };
  }
  
  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }
  
  getCell(row, col) {
    return this.grid[row][col];
  }
}

// Display Class
class Display {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  
  showBoards(playerBoard, opponentBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    let header = '  ';
    for (let h = 0; h < CONFIG.BOARD_SIZE; h++) header += `${h} `;
    console.log(`${header}     ${header}`);

    for (let i = 0; i < CONFIG.BOARD_SIZE; i++) {
      let rowStr = `${i} `;

      for (let j = 0; j < CONFIG.BOARD_SIZE; j++) {
        rowStr += `${opponentBoard.getCell(i, j)} `;
      }
      rowStr += `    ${i} `;

      for (let j = 0; j < CONFIG.BOARD_SIZE; j++) {
        rowStr += `${playerBoard.getCell(i, j)} `;
      }
      console.log(rowStr);
    }
    console.log('\n');
  }
  
  showMessage(message) {
    console.log(message);
  }
  
  promptForGuess(callback) {
    this.rl.question('Enter your guess (e.g., 00): ', callback);
  }
  
  close() {
    this.rl.close();
  }
}

// Player Classes
class Player {
  constructor(name, board, isVisible = false) {
    this.name = name;
    this.board = board;
    this.guesses = [];
    this.isVisible = isVisible;
    this.setupShips();
  }
  
  setupShips() {
    for (let i = 0; i < CONFIG.NUM_SHIPS; i++) {
      const ship = this.board.createRandomShip();
      this.board.placeShip(ship, this.isVisible);
    }
  }
  
  hasGuessed(coordinate) {
    return this.guesses.includes(coordinate);
  }
  
  addGuess(coordinate) {
    this.guesses.push(coordinate);
  }
  
  getRemainingShips() {
    return this.board.getRemainingShips();
  }
}

class CPUPlayer extends Player {
  constructor(name, board) {
    super(name, board, false);
    this.mode = 'hunt';
    this.targetQueue = [];
  }
  
  makeGuess() {
    let coordinate;
    
    if (this.mode === 'target' && this.targetQueue.length > 0) {
      coordinate = this.targetQueue.shift();
      if (this.hasGuessed(coordinate)) {
        if (this.targetQueue.length === 0) this.mode = 'hunt';
        return this.makeGuess();
      }
    } else {
      this.mode = 'hunt';
      do {
        const row = Utils.getRandomInt(0, CONFIG.BOARD_SIZE);
        const col = Utils.getRandomInt(0, CONFIG.BOARD_SIZE);
        coordinate = Utils.coordinateToString(row, col);
      } while (this.hasGuessed(coordinate));
    }
    
    this.addGuess(coordinate);
    return coordinate;
  }
  
  processAttackResult(coordinate, result) {
    const row = parseInt(coordinate[0]);
    const col = parseInt(coordinate[1]);
    
    if (result.isHit) {
      if (result.isSunk) {
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        this.mode = 'target';
        const adjacentCoords = Utils.getAdjacentCoordinates(row, col);
        
        adjacentCoords.forEach(({ row: adjRow, col: adjCol }) => {
          const adjCoordinate = Utils.coordinateToString(adjRow, adjCol);
          if (!this.hasGuessed(adjCoordinate) && !this.targetQueue.includes(adjCoordinate)) {
            this.targetQueue.push(adjCoordinate);
          }
        });
      }
    } else {
      if (this.mode === 'target' && this.targetQueue.length === 0) {
        this.mode = 'hunt';
      }
    }
  }
}

// Main Game Class
class SeaBattleGame {
  constructor() {
    this.display = new Display();
    this.playerBoard = new Board();
    this.cpuBoard = new Board();
    this.player = new Player('Player', this.playerBoard, true);
    this.cpu = new CPUPlayer('CPU', this.cpuBoard);
    this.gameOver = false;
  }
  
  start() {
    this.display.showMessage('Boards created.');
    this.display.showMessage(`${CONFIG.NUM_SHIPS} ships placed randomly for Player.`);
    this.display.showMessage(`${CONFIG.NUM_SHIPS} ships placed randomly for CPU.`);
    this.display.showMessage("\nLet's play Sea Battle!");
    this.display.showMessage(`Try to sink the ${CONFIG.NUM_SHIPS} enemy ships.`);
    this.gameLoop();
  }
  
  gameLoop() {
    if (this.checkGameOver()) return;
    
    this.display.showBoards(this.playerBoard, this.cpuBoard);
    this.display.promptForGuess((answer) => this.handlePlayerTurn(answer));
  }
  
  handlePlayerTurn(input) {
    const coordinate = Utils.parseCoordinate(input);
    
    if (!coordinate) {
      this.display.showMessage('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
      this.gameLoop();
      return;
    }
    
    if (!coordinate.isValid) {
      this.display.showMessage(`Oops, please enter valid row and column numbers between 0 and ${CONFIG.BOARD_SIZE - 1}.`);
      this.gameLoop();
      return;
    }
    
    const coordinateStr = Utils.coordinateToString(coordinate.row, coordinate.col);
    
    if (this.player.hasGuessed(coordinateStr)) {
      this.display.showMessage('You already guessed that location!');
      this.gameLoop();
      return;
    }
    
    this.player.addGuess(coordinateStr);
    const result = this.cpuBoard.processAttack(coordinateStr);
    
    if (result.isHit) {
      this.display.showMessage('PLAYER HIT!');
      if (result.isSunk) {
        this.display.showMessage('You sunk an enemy battleship!');
      }
    } else {
      this.display.showMessage('PLAYER MISS.');
    }
    
    if (this.checkGameOver()) return;
    
    this.handleCPUTurn();
    this.gameLoop();
  }
  
  handleCPUTurn() {
    this.display.showMessage("\n--- CPU's Turn ---");
    const coordinate = this.cpu.makeGuess();
    
    if (this.cpu.mode === 'target') {
      this.display.showMessage(`CPU targets: ${coordinate}`);
    }
    
    const result = this.playerBoard.processAttack(coordinate);
    this.cpu.processAttackResult(coordinate, result);
    
    if (result.isHit) {
      this.display.showMessage(`CPU HIT at ${coordinate}!`);
      if (result.isSunk) {
        this.display.showMessage('CPU sunk your battleship!');
      }
    } else {
      this.display.showMessage(`CPU MISS at ${coordinate}.`);
    }
  }
  
  checkGameOver() {
    if (this.cpu.getRemainingShips() === 0) {
      this.display.showMessage('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
      this.display.showBoards(this.playerBoard, this.cpuBoard);
      this.display.close();
      return true;
    }
    
    if (this.player.getRemainingShips() === 0) {
      this.display.showMessage('\n*** GAME OVER! The CPU sunk all your battleships! ***');
      this.display.showBoards(this.playerBoard, this.cpuBoard);
      this.display.close();
      return true;
    }
    
    return false;
  }
}

// Start the game (only if running directly, not when testing)
if (require.main === module) {
  const game = new SeaBattleGame();
  game.start();
}

// Export classes and utilities for testing
module.exports = {
  CONFIG,
  Utils,
  Ship,
  Board,
  Player,
  CPUPlayer,
  Display,
  SeaBattleGame
};
