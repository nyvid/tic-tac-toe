import { FC } from 'react';
import { Winner } from 'shared';

type WinnerModalProps = {
  playerId?: number;
  winner: number;
  playAgain: () => void;
};

export const WinnerModal: FC<WinnerModalProps> = ({
  playerId,
  winner,
  playAgain,
}) => {
  return (
    <>
      <div className="bg-black w-full h-full fixed left-0 bg-opacity-60" />
      <div className="bg-indigo-500 text-white space-y-5 p-5 rounded-lg fixed z-10 top-72 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <p>
          {winner === Winner.DRAW ? (
            <p>DRAW</p>
          ) : winner >= 0 && winner === playerId ? (
            'You won'
          ) : (
            'Opponent won'
          )}
        </p>
        <button onClick={playAgain}>Play again</button>
      </div>
    </>
  );
};
