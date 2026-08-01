# Release checklist — 0.5.0-rc1

## Pre-release

- [ ] All 13 RC hardening items are complete (see RELEASE_HARDENING.md).
- [ ] HUD is simpler — removed 5 Bat elements, 2 Snake elements.
- [ ] Audio events are distinct — all 15 events produce distinguishable sounds.
- [ ] Difficulty profiles feel meaningfully different — Field / Night / Flight Line.
- [ ] Snake strike timing is learnable — coil compression, S-curve, head glow.
- [ ] Pause/focus/restart behavior is safe — no accidental release, no timer leak.
- [ ] Repeated sessions do not leak resources — 50 restarts, 25 switches clean.
- [ ] Chrome, Edge, Firefox, Safari documented in BROWSER_MATRIX.md.
- [ ] Medium performance is release-ready — 60 FPS sustained at 1920×1080 on Apple M2.
- [ ] Public README is understandable immediately.
- [ ] Release metadata exists.
- [ ] Version is tagged internally as `0.5.0-rc1`.
- [ ] No npm or build step has been introduced.
- [ ] Offline runtime remains intact.
- [ ] Vendor verification still passes.

## Browser validation

- [ ] Chrome (latest desktop)
- [ ] Edge (latest desktop)
- [ ] Firefox (latest desktop)
- [ ] Safari (latest desktop)

See `docs/BROWSER_MATRIX.md` for per-browser details.

## Release steps

1. Update version string in `src/ui/SettingsMenu.js` if not already set.
2. Run vendor verification: `python3 tools/verify-vendor.py`.
3. Check console is clean: open DevTools, play both modes, verify no errors.
4. Confirm no remote requests: open Network tab, filter for non-local URLs.
5. Commit all changes.
6. Tag the release: `git tag -a v0.5.0-rc1 -m "Release Candidate 1"`.
7. Push: `git push && git push --tags`.
8. If deploying to GitHub Pages, confirm Pages build succeeds.

## Post-release

- [ ] Confirm GitHub Pages renders correctly.
- [ ] Test direct `file://` shows the fatal-error interceptor.
- [ ] Verify pointer-lock, fullscreen, and audio prompt work on first visit.
- [ ] Check localStorage persistence across page reloads.
