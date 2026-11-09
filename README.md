# Xianfei Wang — Interactive Resume

An English academic resume with a light blue and white palette, fine typography, and three original interactive Three.js miniatures.

## Preview

No build, package installation, API key, or CDN is required. Serve the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open [the local preview](http://127.0.0.1:4173/). Use an HTTP server for the 3D scenes: browsers restrict ES module imports when opening an HTML file directly. The resume text and native disclosures remain usable without WebGL or JavaScript.

The existing `CNAME` is retained for GitHub Pages. The repository root can be served directly as a static site. Local changes do not update the published site until committed and pushed through the normal deployment flow.

## Interactive studies

- **Campus:** a white architectural maquette with blue glazing, a courtyard, skybridge, planting, and a sundial. Select a building or its button to change the route.
- **Research workspace:** a miniature desk with a monitor, laptop, keyboard, assistant, and report folio. Select Evidence or Agents to change the monitor interface.
- **Digital human:** a volumetric articulated mannequin and motion-capture camera. Choose Idle, Wave, or Walk.

Drag to orbit. Once a canvas has focus, use the wheel or pinch to zoom. Keyboard controls: left/right arrows rotate, plus/minus zoom, and R resets the view. Each scene also has a Reset view button. Touch handling allows vertical page scrolling; horizontal drags orbit the scene.

All geometry and interface textures are generated locally. These are illustrative studies, not actual campus survey data, system screenshots, clinical examples, or evidence of evaluation results. The academic claims remain in the resume text. No user or patient data is used in the miniatures.

The scenes initialize near the viewport and stop drawing when outside the observer region or when the browser tab is hidden. Static scenes redraw only when something changes; the avatar animates while visible. Pixel ratio is capped. Automatic avatar movement respects the browser's reduced-motion setting. The original resume content, project filters, keyboard-accessible disclosures, mobile navigation, reading progress, and email copy are independent of WebGL.

## Files

- `index.html` — semantic English resume and scene containers
- `styles.css` — responsive blue and white layout and print styles
- `script.js` — resume navigation, project filters, email copy, and print handling
- `scenes.js` — original Three.js scenes, actions, picking, orbit controls, and rendering lifecycle
- `assets/vendor/` — Three.js 0.187.0 and OrbitControls, self-hosted with the MIT license; OrbitControls uses a local module import
- `assets/fonts/` — self-hosted Manrope and IBM Plex Mono subsets with their SIL Open Font Licenses
- `assets/Xianfei_Wang_CV.pdf` — unchanged copy of the user-provided English academic CV

## Content provenance

Prepared on 3 November 2026 using the 2027 PhD application workspace:

- Content: `output/docx/Xianfei_Wang_Academic_CV_EN_Classic.docx`, cross-checked against the user-provided general CV and application background.
- Download: `materials/user_provided/Xianfei_Wang_Academic_CV_English_HKUST.pdf`, the latest user-provided general PDF. It is an existing CV, not a web-page export.
- PhD timing: the recorded Fall 2027 application objective.

The two submitted manuscripts remain **under review**. ISMAR-Adjunct 2022 and IEEE VRW 2023 are **poster papers**. BUPT is listed as undergraduate coursework in a joint program, with the BEng awarded by BISTU. The MPhil is at HKUST's Hong Kong campus, with expected graduation in June 2027. Review manuscript status when updating; do not promote it automatically.

No analytics, tracking, visitor-data collection, or live GitHub statistics are used. The old `wxf.jpg` is retained but is not referenced by the page.
