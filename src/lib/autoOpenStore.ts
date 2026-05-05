// Simple module-level flag for auto-opening the drink picker
// when navigating from Dashboard to Wellbeing page
let _pendingAutoOpen = false;

export const setPendingAutoOpen = (value: boolean) => {
  _pendingAutoOpen = value;
};

export const consumePendingAutoOpen = (): boolean => {
  if (_pendingAutoOpen) {
    _pendingAutoOpen = false;
    return true;
  }
  return false;
};