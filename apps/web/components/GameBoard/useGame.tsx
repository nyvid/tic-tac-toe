import { Client, Room } from 'colyseus.js';
import { useEffect, useRef, useState } from 'react';
import { GameState, MOVE_TIMEOUT_SECONDS, Winner } from 'shared';

type ClientField = {
  takenBy: number;
};

type ClientBoard = {
  fields: ClientField[];
};

type ClientPlayer = {
  id: number;
  name: string;
};

type GameClientState = {
  board: ClientBoard;
  players: ClientPlayer[];
  currentPlayerTurn: number;
  winner: number;
  wonFields: number[];
  started: boolean;
};

export const useGame = () => {
  const clientRef = useRef(new Client('ws://localhost:3333'));
  const roomRef = useRef<Room<GameState>>();
  const intervalRef = useRef<NodeJS.Timer>();
  const currentPlayerTurnRef = useRef<number>();

  const [state, setState] = useState<GameClientState>();
  const [playerId, setPlayerId] = useState<number>();
  const [time, setTime] = useState(0);

  const join = async () => {
    if (roomRef.current) {
      roomRef.current?.leave();
    }
    roomRef.current = await clientRef.current.joinOrCreate<GameState>('game');
    roomRef.current.onMessage('id', ({ id }) => {
      setPlayerId(id);
    });
    roomRef.current.onStateChange((newState: GameState) => {
      if (currentPlayerTurnRef.current !== newState.currentPlayerTurn) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setTime(MOVE_TIMEOUT_SECONDS);
        intervalRef.current = setInterval(() => {
          setTime((old) => (old > 0 ? old - 1 : old));
        }, 1000);
      }
      currentPlayerTurnRef.current = newState.currentPlayerTurn;
      setState({
        board: {
          fields: [...newState.board.fields],
        },
        players: [...newState.players],
        currentPlayerTurn: newState.currentPlayerTurn,
        winner: newState.winner,
        wonFields: newState.wonFields,
        started: newState.started,
      });
    });
    roomRef.current.onLeave((code) => {
      roomRef.current = undefined;
    });
  };

  useEffect(() => {
    if (state?.winner !== Winner.NONE) {
      clearInterval(intervalRef.current);
    }
  }, [state?.winner]);

  const handleAction = (index: number) => {
    roomRef.current?.send('move', { index });
  };

  useEffect(() => {
    join();
    return () => {
      roomRef.current?.leave();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    state,
    playerId,
    time,
    join,
    handleAction,
  };
};
