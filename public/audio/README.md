# Music for Player 370

Music is intentionally not bundled yet. The experience currently has original synthesized interaction cues, enabled only after the visitor turns sound on.

To add owner-supplied tracks:

1. Place a quiet ambient loop and/or carousel loop here as MP3 or OGG files.
2. In `src/data/trials-audio.ts`, replace the corresponding `null` with:

   ```ts
   { src: "/audio/your-track.mp3", title: "Track title", credit: "Creator / required credit", licenseUrl: "https://source.example/license" }
   ```

3. Keep the source/license information with the files. Credits render automatically in the footer.

The ambience runs only after audio is enabled. The carousel track replaces it while Mingle is spinning and stops when the doors open. Music and cues are muted when the tab is hidden; the sound switch mutes both. A missing or blocked audio file must never stop gameplay.

Suggested assets to provide:

- **Ambience:** 30–60 second seamless instrumental loop, quiet and mysterious.
- **Carousel:** 15–30 second playful/carnival instrumental loop.

These are stylistic directions, not requests for the show's original recordings. Exact tracks can be decided after the first playable version is reviewed.
