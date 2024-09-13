"use client"
import { useContext } from 'react';

import { GlobalStateContext } from '@/app/_providers/GlobalStateProvider';

function useGlobal() {
  return useContext(GlobalStateContext);
}

export default useGlobal;
