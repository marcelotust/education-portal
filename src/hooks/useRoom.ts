import { useContext } from 'react';

import type { RoomContextValue } from '@/types';
import { RoomContext } from './roomContext';

export const useRoom = (): RoomContextValue => {
  const context = useContext(RoomContext);
  if (context === null) {
    throw new Error('useRoom must be used inside a <RoomProvider>.');
  }
  return context;
};
