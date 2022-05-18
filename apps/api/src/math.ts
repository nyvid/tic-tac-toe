import { ArraySchema } from '@colyseus/schema';

export const randomValueFromArray = <T>(array: ArraySchema<T> | Array<T>) => {
  return array[Math.floor(Math.random() * array.length)];
};
