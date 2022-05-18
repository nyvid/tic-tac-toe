import { FC } from 'react';

type GameStatsProps = {
  time: number;
  playerId?: number;
  playerIdTurn: number;
};

export const GameStats: FC<GameStatsProps> = ({
  time,
  playerId,
  playerIdTurn,
}) => {
  return (
    <div className="h-40">
      <p>{playerId === playerIdTurn ? 'Your turn' : "Opponent's turn"}</p>

      <p>
        <span className="text-indigo-600">You are:</span> X
      </p>
      <p>
        <span className="text-indigo-600">Time:</span> {time}
      </p>
    </div>
  );
};
