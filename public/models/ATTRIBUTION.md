# Third-party scenery

Four unmodified GLB assets from **Kenney Nature Kit 2.1**, by Kenney:

- `nature/tree_oak.glb`
- `nature/tree_pineRoundA.glb`
- `nature/plant_bush.glb`
- `nature/rock_largeA.glb`

Source: https://kenney.nl/assets/nature-kit
Original download: https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip
License: Creative Commons Zero (CC0); included at `nature/LICENSE.txt`.
Retrieved October 4, 2026. Models are resized and placed at runtime.

The compound architecture, controllable tracksuit character, guards, doll, carousel, bridge, signs, and other geometry are authored in this repository. No external requests are needed at runtime.

## Polished scenery (active)

- `polished/boulder.glb`: **Boulder 01**, Poly Haven, CC0.
  Source: https://polyhaven.com/a/boulder_01
  License: https://polyhaven.com/license
  Downloaded 2026-10-06 through https://api.polyhaven.com/files/boulder_01.
  The 1K glTF, mesh buffer, diffuse, normal, and ARM textures are repackaged
  into one self-contained GLB. Geometry and source texture pixels are unchanged.
  Powered by Poly Haven. No external API is used by the deployed site.
- `polished/oak.glb`, `polished/pine.glb`, `polished/bush.glb`: original
  deterministic foliage authored for this project, with tapered branches,
  individual curved leaves and varied foliage materials. Rebuild with
  `node scripts/build-scenery.mjs`. These replace the active Kenney scenery;
  the original files remain available as a historical reference.

To also repackage the boulder, pass a directory containing the downloaded
`boulder.gltf` and its relative dependencies to the generator. Models load
asynchronously and share geometry/materials across instances.
