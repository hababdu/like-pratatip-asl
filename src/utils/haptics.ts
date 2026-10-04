export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light') {
  try {
    const tg = typeof window !== 'undefined' ? (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: {
      impactOccurred: (style: string) => void;
      notificationOccurred: (type: string) => void;
      selectionChanged: () => void;
    } } } }).Telegram?.WebApp : null;

    if (tg?.HapticFeedback) {
      if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      } else if (type === 'success' || type === 'warning' || type === 'error') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'heavy') navigator.vibrate(60);
      else if (type === 'medium') navigator.vibrate(35);
      else if (type === 'light') navigator.vibrate(15);
      else if (type === 'error') navigator.vibrate([40, 60, 40]);
      else if (type === 'success') navigator.vibrate([20, 40, 20]);
    }
  } catch {
    // Ignore haptic errors in non-supporting contexts
  }
}
