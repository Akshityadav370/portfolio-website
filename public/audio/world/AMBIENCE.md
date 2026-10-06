# Exploration ambience

The exploration soundtrack is an original 16-second synthesized pad-and-bell
composition generated locally with Web Audio in `src/lib/world/audio.ts`.
No recorded music, sample packs, external services, or third-party melodies
are used. There is no additional audio download.

Sound is opt-in. The loop follows the sound volume control and stops when
menus open, the tab is hidden, a game begins, sound is disabled, or the world
is disposed. Existing owner-provided game tracks take precedence during games;
ambience stays silent during red-light and Mingle reaction windows.
