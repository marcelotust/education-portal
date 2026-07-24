import { createContext } from 'react';

import type { RoomContextValue } from '@/types';

/** Kept apart from the provider component so fast refresh stays component-only. */
export const RoomContext = createContext<RoomContextValue | null>(null);
