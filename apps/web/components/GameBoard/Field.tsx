import clsx from 'clsx';
import { FC } from 'react';
import { TakenBy } from 'shared';

type FieldProps = {
  takenBy: number;
  playerId?: number;
  isWonField: boolean;
  onClick: () => void;
};

export const Field: FC<FieldProps> = ({
  takenBy,
  playerId,
  isWonField,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        'w-full h-full aspect-square flex justify-center items-center cursor-pointer font-bold',
        isWonField ? 'bg-blue-400' : 'bg-white hover:bg-blue-200'
      )}
      onClick={onClick}
    >
      {takenBy === TakenBy.NONE ? '' : takenBy === playerId ? 'X' : 'O'}
    </div>
  );
};
