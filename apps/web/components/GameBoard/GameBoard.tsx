import { Winner } from 'shared';
import { Field } from './Field';
import { GameStats } from './GameStats';
import { LoadingComponent } from './LoadingComponent';
import { useGame } from './useGame';
import { WinnerModal } from './WinnerModal';

export const GameBoard = () => {
  const { state, playerId, time, handleAction, join } = useGame();

  return (
    <>
      {state?.started ? (
        <>
          {state.winner !== Winner.NONE && (
            <WinnerModal
              playerId={playerId}
              winner={state.winner}
              playAgain={join}
            />
          )}
          <GameStats
            time={time}
            playerId={playerId}
            playerIdTurn={state.currentPlayerTurn}
          />
          {state && (
            <div className="grid grid-cols-3 gap-4 bg-indigo-500">
              {state.board.fields.map((field, index) => (
                <Field
                  key={index}
                  playerId={playerId}
                  onClick={() => handleAction(index)}
                  takenBy={field.takenBy}
                  isWonField={state.wonFields.includes(index)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <LoadingComponent />
      )}
    </>
  );
};
