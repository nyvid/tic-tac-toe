import { Client, Delayed, Room } from 'colyseus';
import {
  BOARD_SIZE,
  Field,
  GameState,
  MOVE_TIMEOUT_SECONDS,
  Player,
  TakenBy,
  Winner,
} from 'shared';
import { randomValueFromArray } from './math';

export class GameRoom extends Room<GameState> {
  maxClients = 2;

  idCounter = 0;
  idLookup: Map<string, number> = new Map();

  moveTimeout!: Delayed;

  onCreate() {
    this.setState(new GameState({ board: { width: BOARD_SIZE } }));
    this.onMessage('move', (client, message) => {
      this.handlePlayerMove(client, message);
    });
  }

  onJoin(client: Client) {
    const id = this.idCounter++;
    this.idLookup.set(client.sessionId, id);
    this.state.players.push(new Player({ id, name: 'Player' }));
    client.send('id', { id });

    if (this.state.players.length === 2) {
      this.lock();
      this.startGame();
    }
  }

  startGame() {
    this.state.started = true;
    const randomPlayer = randomValueFromArray(this.state.players);
    this.state.currentPlayerTurn = randomPlayer.id;
    this.setMoveTimeout();
  }

  setMoveTimeout() {
    if (this.moveTimeout) {
      this.moveTimeout.clear();
    }

    this.moveTimeout = this.clock.setTimeout(() => {
      this.randomMove();
    }, MOVE_TIMEOUT_SECONDS * 1000);
  }

  handlePlayerMove(client: Client, data: { index?: number }) {
    if (this.state.players.length < 2) {
      return;
    }

    if (this.idLookup.get(client.sessionId) !== this.state.currentPlayerTurn) {
      return;
    }

    if (typeof data.index !== 'number') {
      return;
    }

    if (this.state.winner !== Winner.NONE) {
      return;
    }

    if (this.state.board.fields[data.index].takenBy === TakenBy.NONE) {
      this.takeMove(data.index);
    }
  }

  takeMove(index: number) {
    const playerId = this.state.currentPlayerTurn;
    this.state.board.fields[index].takenBy = playerId;

    const nextPlayerIndex = this.state.players[0].id === playerId ? 1 : 0;
    this.state.currentPlayerTurn = this.state.players[nextPlayerIndex].id;

    if (this.checkGameEnd(index, playerId)) {
      this.moveTimeout.clear();
      this.clock.setTimeout(() => {
        this.clients.forEach((c) => c.leave());
        this.disconnect();
      }, 5000);
    } else {
      this.setMoveTimeout();
    }
  }

  randomMove() {
    for (let i = 0; i < this.state.board.fields.length; i++) {
      if (this.state.board.fields[i].takenBy === TakenBy.NONE) {
        this.takeMove(i);
        return;
      }
    }
  }

  checkAndHandleWin(indexes: number[], checkForId: number): boolean {
    const fields: Field[] = indexes.map((i) => this.state.board.fields[i]);
    if (
      checkForId === fields[0].takenBy &&
      fields.every((entry) => entry.takenBy === checkForId)
    ) {
      this.state.winner = checkForId;
      this.state.wonFields.push(...indexes);
      return true;
    }
    return false;
  }

  // how to use 1D arrays as multi-dimensional: https://softwareengineering.stackexchange.com/questions/212808/treating-a-1d-data-structure-as-2d-grid/212813#212813
  checkGameEnd(pickedIndex: number, checkForId: number): boolean {
    const horizontalFields: number[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const x = pickedIndex % BOARD_SIZE;
      const i = x + BOARD_SIZE * y;
      horizontalFields.push(i);
    }
    if (this.checkAndHandleWin(horizontalFields, checkForId)) return true;

    const verticalFields: number[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const y = Math.floor(pickedIndex / BOARD_SIZE);
      const i = x + BOARD_SIZE * y;
      verticalFields.push(i);
    }
    if (this.checkAndHandleWin(verticalFields, checkForId)) return true;

    const forwardFields: number[] = [];
    for (let xy = 0; xy < BOARD_SIZE; xy++) {
      const i = xy + BOARD_SIZE * xy;
      forwardFields.push(i);
    }
    if (this.checkAndHandleWin(forwardFields, checkForId)) return true;

    const backwardFields: number[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const y = BOARD_SIZE - 1 - x;
      const i = x + BOARD_SIZE * y;
      backwardFields.push(i);
    }
    if (this.checkAndHandleWin(backwardFields, checkForId)) return true;

    // check draw
    const notTakenFields = this.state.board.fields.filter(
      (field) => field.takenBy === TakenBy.NONE
    ) as Field[];
    if (notTakenFields.length <= 0) {
      this.state.winner = Winner.DRAW;
      return true;
    }

    return false;
  }
}
