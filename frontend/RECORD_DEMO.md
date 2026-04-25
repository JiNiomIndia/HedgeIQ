# Recording a Real AI-Narrated Demo Video

The current landing uses a browser-TTS-narrated explainer (`ExplainerVideo.tsx`).
To upgrade to a real avatar video — drop in a polished MP4 and replace the
component output.

## Option 1 — Synthesia (avatar narration)

1. Go to [synthesia.io](https://www.synthesia.io) and create an avatar.
2. Use the verbatim narration in `frontend/scripts/explainer-video-script.txt`.
3. Render at 1280x720, MP4, H.264.
4. Drop the file at `frontend/public/landing/demo.mp4`.
5. Update `frontend/src/components/landing/ExplainerVideo.tsx`:
   - Replace the `<div style={{ position: 'absolute', inset: 0, padding: 24 }}>`
     visual block with `<video src="/landing/demo.mp4" controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />`.
   - Remove the `speechSynthesis` block and the `playScene` callback.
   - Remove the per-scene SVG visuals (`SceneOne` ... `SceneFive`) — keep
     the surrounding play overlay / captions / controls only if useful.

## Option 2 — HeyGen / D-ID

Same workflow as Synthesia — different provider. Both accept the same script
and produce the same 1280x720 MP4 deliverable.

## Option 3 — Loom screen + webcam

1. Open [loom.com](https://www.loom.com) and record screen + webcam walking
   through the live demo on production.
2. Export MP4.
3. Drop and update the component as in Option 1.

## Notes

- Keep the file under 25 MB if possible — it ships with the static bundle.
- Add a `poster` attribute (a 1280x720 PNG screenshot) for fast first paint.
- Verify the captions track (`<track kind="captions">`) is added if shipping
  to a public audience without TTS fallback.
