import { ArraySchema, Schema, type } from '@colyseus/schema';

type PlayerOptions = {
  id: number;
  name: string;
};

export class Player extends Schema {
  @type('number')
  readonly id: number;

  @type('string')
  readonly name: string;

  constructor(options: PlayerOptions) {
    super();
    (this.id = options.id), (this.name = options.name);
  }
}

export enum TakenBy {
  NONE = -1,
}

export class Field extends Schema {
  @type('number')
  takenBy = TakenBy.NONE;
}

type BoardOptions = {
  width: number;
};

export class Board extends Schema {
  @type([Field])
  fields: ArraySchema<Field>;

  constructor(options: BoardOptions) {
    super();
    const initialFields = Array.from(
      { length: Math.pow(options.width, 2) },
      () => new Field()
    );
    this.fields = new ArraySchema(...initialFields);
  }
}

export enum Winner {
  NONE = -1,
  DRAW = -2,
}

type GameStateOptions = {
  board: BoardOptions;
};

export class GameState extends Schema {
  @type(Board)
  board: Board;

  @type([Player])
  players: ArraySchema<Player> = new ArraySchema();

  @type('number')
  currentPlayerTurn = -1;

  @type('number')
  winner: number = Winner.NONE;

  @type(['number'])
  wonFields: ArraySchema<number> = new ArraySchema();

  @type('boolean')
  started = false;

  constructor(options: GameStateOptions) {
    super();
    this.board = new Board(options.board);
  }
}
