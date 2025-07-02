const {
  CONFIG,
  Utils,
  Ship,
  Board,
  Player,
  CPUPlayer,
  Display,
  SeaBattleGame
} = require('./seabattle');

// Mock readline for testing
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

describe('CONFIG', () => {
  test('should have correct game configuration values', () => {
    expect(CONFIG.BOARD_SIZE).toBe(10);
    expect(CONFIG.NUM_SHIPS).toBe(3);
    expect(CONFIG.SHIP_LENGTH).toBe(3);
    expect(CONFIG.SYMBOLS.WATER).toBe('~');
    expect(CONFIG.SYMBOLS.SHIP).toBe('S');
    expect(CONFIG.SYMBOLS.HIT).toBe('X');
    expect(CONFIG.SYMBOLS.MISS).toBe('O');
  });
});

describe('Utils', () => {
  describe('getRandomInt', () => {
    test('should return integer within range', () => {
      const result = Utils.getRandomInt(0, 5);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(5);
    });

    test('should handle single value range', () => {
      const result = Utils.getRandomInt(5, 6);
      expect(result).toBe(5);
    });
  });

  describe('isValidCoordinate', () => {
    test('should return true for valid coordinates', () => {
      expect(Utils.isValidCoordinate(0, 0)).toBe(true);
      expect(Utils.isValidCoordinate(5, 5)).toBe(true);
      expect(Utils.isValidCoordinate(9, 9)).toBe(true);
    });

    test('should return false for invalid coordinates', () => {
      expect(Utils.isValidCoordinate(-1, 5)).toBe(false);
      expect(Utils.isValidCoordinate(5, -1)).toBe(false);
      expect(Utils.isValidCoordinate(10, 5)).toBe(false);
      expect(Utils.isValidCoordinate(5, 10)).toBe(false);
    });
  });

  describe('parseCoordinate', () => {
    test('should parse valid coordinate strings', () => {
      const result = Utils.parseCoordinate('34');
      expect(result).toEqual({ row: 3, col: 4, isValid: true });
    });

    test('should handle invalid inputs', () => {
      expect(Utils.parseCoordinate('')).toBeNull();
      expect(Utils.parseCoordinate('1')).toBeNull();
      expect(Utils.parseCoordinate('123')).toBeNull();
      expect(Utils.parseCoordinate(null)).toBeNull();
    });

    test('should validate coordinate bounds', () => {
      const validResult = Utils.parseCoordinate('99');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = Utils.parseCoordinate('aa');
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('coordinateToString', () => {
    test('should convert coordinates to string format', () => {
      expect(Utils.coordinateToString(3, 4)).toBe('34');
      expect(Utils.coordinateToString(0, 0)).toBe('00');
      expect(Utils.coordinateToString(9, 9)).toBe('99');
    });
  });

  describe('getAdjacentCoordinates', () => {
    test('should return adjacent coordinates for middle positions', () => {
      const adjacent = Utils.getAdjacentCoordinates(5, 5);
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ row: 4, col: 5 });
      expect(adjacent).toContainEqual({ row: 6, col: 5 });
      expect(adjacent).toContainEqual({ row: 5, col: 4 });
      expect(adjacent).toContainEqual({ row: 5, col: 6 });
    });

    test('should filter out invalid coordinates for edge positions', () => {
      const adjacentCorner = Utils.getAdjacentCoordinates(0, 0);
      expect(adjacentCorner).toHaveLength(2);
      expect(adjacentCorner).toContainEqual({ row: 1, col: 0 });
      expect(adjacentCorner).toContainEqual({ row: 0, col: 1 });
    });

    test('should handle edge cases', () => {
      const adjacentEdge = Utils.getAdjacentCoordinates(0, 5);
      expect(adjacentEdge).toHaveLength(3);
    });
  });
});

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship();
  });

  test('should initialize with empty locations and hits', () => {
    expect(ship.locations).toEqual([]);
    expect(ship.hits).toEqual([false, false, false]);
  });

  test('should add locations correctly', () => {
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    expect(ship.locations).toEqual(['12', '13']);
  });

  test('should detect hits correctly', () => {
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    
    expect(ship.hit('12')).toBe(true);
    expect(ship.hit('99')).toBe(false);
  });

  test('should track hit locations', () => {
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    ship.addLocation(1, 4);
    
    ship.hit('12');
    expect(ship.isHit('12')).toBe(true);
    expect(ship.isHit('13')).toBe(false);
  });

  test('should detect when ship is sunk', () => {
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    ship.addLocation(1, 4);
    
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('12');
    ship.hit('13');
    expect(ship.isSunk()).toBe(false);
    
    ship.hit('14');
    expect(ship.isSunk()).toBe(true);
  });

  test('should check if ship has specific location', () => {
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    
    expect(ship.hasLocation('12')).toBe(true);
    expect(ship.hasLocation('13')).toBe(true);
    expect(ship.hasLocation('14')).toBe(false);
  });
});

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  test('should initialize with water symbols', () => {
    expect(board.getCell(0, 0)).toBe('~');
    expect(board.getCell(5, 5)).toBe('~');
    expect(board.getCell(9, 9)).toBe('~');
  });

  test('should create random ships without collision', () => {
    const ship1 = board.createRandomShip();
    const ship2 = board.createRandomShip();
    
    expect(ship1.locations).toHaveLength(3);
    expect(ship2.locations).toHaveLength(3);
    
    // Check no location overlap
    const allLocations = [...ship1.locations, ...ship2.locations];
    const uniqueLocations = [...new Set(allLocations)];
    expect(allLocations).toHaveLength(uniqueLocations.length);
  });

  test('should place ships on board when visible', () => {
    const ship = new Ship();
    ship.addLocation(1, 1);
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    
    board.placeShip(ship, true);
    
    expect(board.getCell(1, 1)).toBe('S');
    expect(board.getCell(1, 2)).toBe('S');
    expect(board.getCell(1, 3)).toBe('S');
  });

  test('should not show ships on board when not visible', () => {
    const ship = new Ship();
    ship.addLocation(1, 1);
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    
    board.placeShip(ship, false);
    
    expect(board.getCell(1, 1)).toBe('~');
    expect(board.getCell(1, 2)).toBe('~');
    expect(board.getCell(1, 3)).toBe('~');
  });

  test('should process attacks correctly', () => {
    const ship = new Ship();
    ship.addLocation(1, 1);
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    board.placeShip(ship);
    
    // Test hit
    const hitResult = board.processAttack('11');
    expect(hitResult.isHit).toBe(true);
    expect(hitResult.isSunk).toBe(false);
    expect(board.getCell(1, 1)).toBe('X');
    
    // Test miss
    const missResult = board.processAttack('99');
    expect(missResult.isHit).toBe(false);
    expect(missResult.isSunk).toBe(false);
    expect(board.getCell(9, 9)).toBe('O');
  });

  test('should detect when ship is sunk', () => {
    const ship = new Ship();
    ship.addLocation(1, 1);
    ship.addLocation(1, 2);
    ship.addLocation(1, 3);
    board.placeShip(ship);
    
    board.processAttack('11');
    board.processAttack('12');
    const sunkResult = board.processAttack('13');
    
    expect(sunkResult.isHit).toBe(true);
    expect(sunkResult.isSunk).toBe(true);
  });

  test('should count remaining ships correctly', () => {
    const ship1 = new Ship();
    ship1.addLocation(1, 1);
    ship1.addLocation(1, 2);
    ship1.addLocation(1, 3);
    board.placeShip(ship1);
    
    const ship2 = new Ship();
    ship2.addLocation(3, 1);
    ship2.addLocation(3, 2);
    ship2.addLocation(3, 3);
    board.placeShip(ship2);
    
    expect(board.getRemainingShips()).toBe(2);
    
    // Sink first ship
    board.processAttack('11');
    board.processAttack('12');
    board.processAttack('13');
    
    expect(board.getRemainingShips()).toBe(1);
  });
});

describe('Player', () => {
  let player;
  let mockBoard;

  beforeEach(() => {
    mockBoard = new Board();
    // Mock the createRandomShip method to avoid randomness in tests
    jest.spyOn(mockBoard, 'createRandomShip').mockImplementation(() => {
      const ship = new Ship();
      ship.addLocation(0, 0);
      ship.addLocation(0, 1);
      ship.addLocation(0, 2);
      return ship;
    });
    
    player = new Player('Test Player', mockBoard, true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should initialize with correct properties', () => {
    expect(player.name).toBe('Test Player');
    expect(player.board).toBe(mockBoard);
    expect(player.guesses).toEqual([]);
    expect(player.isVisible).toBe(true);
  });

  test('should setup ships during initialization', () => {
    expect(mockBoard.createRandomShip).toHaveBeenCalledTimes(3);
  });

  test('should track guesses correctly', () => {
    expect(player.hasGuessed('12')).toBe(false);
    
    player.addGuess('12');
    expect(player.hasGuessed('12')).toBe(true);
    expect(player.guesses).toContain('12');
  });

  test('should get remaining ships from board', () => {
    const remainingShips = player.getRemainingShips();
    expect(remainingShips).toBe(mockBoard.getRemainingShips());
  });
});

describe('CPUPlayer', () => {
  let cpuPlayer;
  let mockBoard;

  beforeEach(() => {
    mockBoard = new Board();
    jest.spyOn(mockBoard, 'createRandomShip').mockImplementation(() => {
      const ship = new Ship();
      ship.addLocation(0, 0);
      ship.addLocation(0, 1);
      ship.addLocation(0, 2);
      return ship;
    });
    
    cpuPlayer = new CPUPlayer('CPU', mockBoard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should initialize in hunt mode', () => {
    expect(cpuPlayer.mode).toBe('hunt');
    expect(cpuPlayer.targetQueue).toEqual([]);
  });

  test('should make valid guesses', () => {
    const guess = cpuPlayer.makeGuess();
    expect(guess).toMatch(/^\d\d$/);
    expect(cpuPlayer.hasGuessed(guess)).toBe(true);
  });

  test('should not make duplicate guesses', () => {
    const firstGuess = cpuPlayer.makeGuess();
    
    // Mock Math.random to ensure same coordinates would be generated
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.1); // This should generate same coordinates
    
    // Force it to try the same guess
    const secondGuess = cpuPlayer.makeGuess();
    
    expect(firstGuess).not.toBe(secondGuess);
    
    Math.random = originalRandom;
  });

  test('should switch to target mode after hit', () => {
    const coordinate = '55';
    const hitResult = { isHit: true, isSunk: false };
    
    cpuPlayer.processAttackResult(coordinate, hitResult);
    
    expect(cpuPlayer.mode).toBe('target');
    expect(cpuPlayer.targetQueue.length).toBeGreaterThan(0);
  });

  test('should switch back to hunt mode after sinking ship', () => {
    const coordinate = '55';
    const sunkResult = { isHit: true, isSunk: true };
    
    cpuPlayer.mode = 'target';
    cpuPlayer.targetQueue = ['54', '56'];
    
    cpuPlayer.processAttackResult(coordinate, sunkResult);
    
    expect(cpuPlayer.mode).toBe('hunt');
    expect(cpuPlayer.targetQueue).toEqual([]);
  });

  test('should add adjacent coordinates to target queue', () => {
    const coordinate = '55';
    const hitResult = { isHit: true, isSunk: false };
    
    cpuPlayer.processAttackResult(coordinate, hitResult);
    
    expect(cpuPlayer.targetQueue).toContain('45');
    expect(cpuPlayer.targetQueue).toContain('65');
    expect(cpuPlayer.targetQueue).toContain('54');
    expect(cpuPlayer.targetQueue).toContain('56');
  });

  test('should handle miss in target mode', () => {
    cpuPlayer.mode = 'target';
    cpuPlayer.targetQueue = [];
    
    const missResult = { isHit: false, isSunk: false };
    cpuPlayer.processAttackResult('55', missResult);
    
    expect(cpuPlayer.mode).toBe('hunt');
  });
});

describe('Display', () => {
  let display;
  let consoleSpy;

  beforeEach(() => {
    display = new Display();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should show messages', () => {
    display.showMessage('Test message');
    expect(consoleSpy).toHaveBeenCalledWith('Test message');
  });

  test('should display boards correctly', () => {
    const playerBoard = new Board();
    const opponentBoard = new Board();
    
    display.showBoards(playerBoard, opponentBoard);
    
    expect(consoleSpy).toHaveBeenCalledWith('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
  });

  test('should have readline interface', () => {
    expect(display.rl).toBeDefined();
    expect(display.rl.question).toBeDefined();
    expect(display.rl.close).toBeDefined();
  });
});

describe('SeaBattleGame', () => {
  let game;
  let consoleSpy;

  beforeEach(() => {
    game = new SeaBattleGame();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should initialize with all required components', () => {
    expect(game.display).toBeInstanceOf(Display);
    expect(game.playerBoard).toBeInstanceOf(Board);
    expect(game.cpuBoard).toBeInstanceOf(Board);
    expect(game.player).toBeInstanceOf(Player);
    expect(game.cpu).toBeInstanceOf(CPUPlayer);
    expect(game.gameOver).toBe(false);
  });

  test('should check game over conditions', () => {
    // Mock no remaining ships for CPU
    jest.spyOn(game.cpu, 'getRemainingShips').mockReturnValue(0);
    jest.spyOn(game.display, 'close').mockImplementation();
    
    const result = game.checkGameOver();
    
    expect(result).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
  });

  test('should handle player turn with invalid input', () => {
    const gameLoopSpy = jest.spyOn(game, 'gameLoop').mockImplementation();
    
    game.handlePlayerTurn('invalid');
    
    expect(consoleSpy).toHaveBeenCalledWith('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
    expect(gameLoopSpy).toHaveBeenCalled();
    
    gameLoopSpy.mockRestore();
  });

  test('should handle player turn with valid input', () => {
    const gameLoopSpy = jest.spyOn(game, 'gameLoop').mockImplementation();
    const checkGameOverSpy = jest.spyOn(game, 'checkGameOver').mockReturnValue(false);
    const handleCPUTurnSpy = jest.spyOn(game, 'handleCPUTurn').mockImplementation();
    
    game.handlePlayerTurn('55');
    
    expect(checkGameOverSpy).toHaveBeenCalled();
    expect(handleCPUTurnSpy).toHaveBeenCalled();
    
    gameLoopSpy.mockRestore();
    checkGameOverSpy.mockRestore();
    handleCPUTurnSpy.mockRestore();
  });

  test('should handle CPU turn', () => {
    const makeGuessSpy = jest.spyOn(game.cpu, 'makeGuess').mockReturnValue('55');
    const processAttackSpy = jest.spyOn(game.playerBoard, 'processAttack')
      .mockReturnValue({ isHit: false, isSunk: false });
    const processAttackResultSpy = jest.spyOn(game.cpu, 'processAttackResult')
      .mockImplementation();
    
    game.handleCPUTurn();
    
    expect(makeGuessSpy).toHaveBeenCalled();
    expect(processAttackSpy).toHaveBeenCalledWith('55');
    expect(processAttackResultSpy).toHaveBeenCalled();
    
    makeGuessSpy.mockRestore();
    processAttackSpy.mockRestore();
    processAttackResultSpy.mockRestore();
  });
}); 