# ProductModal Mobile Zoom - TODO

- [ ] Add refs and state for touch zoom (`longPressTimerRef`, `touchStartRef`, `touchZoomActive`)
- [ ] Add touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`, `onTouchCancel`)
- [ ] Guard mouse event handlers so they don't fire on touch devices (prevent simple tap from hiding modal-right)
- [ ] Add mobile zoom overlay inside the image container (renders over the image itself on touch)
- [ ] Update zoom hint text: "Mantén presionado para hacer zoom" on touch / "Pasa el cursor para hacer zoom" on desktop
- [ ] Remove `@media (hover: none)` CSS rule that hides zoom elements; use conditional rendering instead
- [ ] Ensure modal-right and close button only hide during actual zoom (desktop hover OR mobile long-press)
