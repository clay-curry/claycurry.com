"use client"

import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import Toast from '@/app/_lib/components/Toast';

import useFocusMode from '@/app/_lib/hooks/useFocusMode';
import useGlobal from '@/app/_lib/hooks/useGlobal';
import useShortcut from '@/app/_lib/hooks/useShortcut';
import useTheme from '@/app/_lib/hooks/useTheme';

const focusToast = {
  title: 'Focus Turned {STATUS}',
  message:
    'Focus helps reduce distractions by hiding floating components, like navigation and reactions.',
};

function Shortcuts() {
  const toastRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { isQuickAccessOpen, setQuickAccessOpen } = useGlobal();
  const { focusMode, setFocusMode } = useFocusMode();

  useShortcut('KeyD', () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  });

  useShortcut('KeyQ', () => {
    setQuickAccessOpen(!isQuickAccessOpen);
  });

  useShortcut('KeyF', () => {
    setFocusMode(!focusMode);
  });

  useEffect(() => {
    if (toastRef.current) {
      toast.remove(toastRef.current.id);
    }
    if (focusMode) {
      toastRef.current = toast.custom((t) => (
        <Toast
          title={focusToast.title.replace('{STATUS}', 'On')}
          message={focusToast.message}
          t={t}
        />
      ));
    } else {
      toastRef.current = toast.custom((t) => (
        <Toast
          title={focusToast.title.replace('{STATUS}', 'Off')}
          message={focusToast.message}
          t={t}
        />
      ));
    }
  }, [focusMode]);

  return null;
}

export default Shortcuts;
