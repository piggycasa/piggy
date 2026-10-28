# PIGGY — Konterball reuse record

PIGGY adapts existing interface styles, controls and screen transitions from **Konterball**, WILD's Google WebVR experiment. The floating piggy bank and derived pig logo carry the PIGGY brand. Its **Feed Piggy** action, 1× / 5× / 10× feed sizes, **Your cut** reward-pool percentage, jackpot, claims, $PIGGY-holder rewards and round rules remain the local game's own implementation, based on the historical Fomo3D mechanics reference. The underlying units retain the original technical term `keys`; the interface does not introduce a new participation-unit brand.

The adopted pricing arithmetic follows the integer curve in [Solana Fomo3D `src/math/curve.rs`](https://github.com/ilmoi/solana_fomo3d/blob/a29cfe35049fe8f209421267983add1c28ec3237/src/math/curve.rs), independently implemented in JavaScript for this browser model. It uses opening rollover plus gross contributions and minimum-lamport quotes for selected whole-key counts. This maths attribution is separate from Konterball's MIT interface licence: no clear reuse licence was found for the Solana source, and no Rust program is deployed. See [ECONOMICS.md](ECONOMICS.md) for precision, rounding examples and the corrected reward bookkeeping.

## Pinned source and licence

- Project: <https://konterball.com/>
- Repository: <https://github.com/madebywild/konterball>
- Source revision: [`1b1a54aec27f36c4337f4206eb35938f530e847a`](https://github.com/madebywild/konterball/tree/1b1a54aec27f36c4337f4206eb35938f530e847a).
- The upstream MIT licence is copied byte for byte to [`public/licenses/konterball-MIT.txt`](public/licenses/konterball-MIT.txt), including its original copyright notice.
- The corresponding source checkout is retained in `../research/konterball-upstream/` for reference. Its old scripts are not required to build this frontend.

## CSS and interface adaptation

The ported rules are recorded in [`src/konterball-ui.css`](src/konterball-ui.css). They are adapted to the PIGGY controls and responsive layout rather than copied as a complete, unchanged Konterball application.

| Upstream source path | Reused treatment |
| --- | --- |
| `src/stylesheets/base/_vars.scss` | Purple `#2f2475`, pink `#ffa3b0`, green `#47b18b`, yellow `#f9fc56`, inactive purple `#4a3eb9`, and white foregrounds. |
| `src/stylesheets/base/_layout.scss` | Fixed full-screen fields, uppercase outlined buttons, two-pixel white borders, `0.08em` letter spacing, corner controls and flat-colour transition layers. |
| `src/stylesheets/screens/_choose-mode-screen.scss` | A centred game field and primary actions anchored below the object. |
| `src/stylesheets/screens/_multiplayer-screen.scss` | Large, unboxed white numeric treatment, adapted to jackpot and timer values. |
| `src/stylesheets/screens/_about-screen.scss` | Flat full-colour information screens and outlined actions. |

The white numerical treatment in upstream `src/javascripts/hud/score-display.js` and `src/javascripts/hud/countdown.js` is mapped to the local DOM score and timer with normal-weight Jost. Those legacy 3D HUD classes themselves are not imported or presented as ported modules.

The original back arrow, `src/images/icon-arrow.svg`, is copied unchanged to [`public/konterball/back-arrow.svg`](public/konterball/back-arrow.svg). Its licence is covered by the upstream repository's MIT notice. No Google, WILD or Konterball logo is needed for the local game branding.

## Screen transitions

Upstream [`src/javascripts/app.js`](https://github.com/madebywild/konterball/blob/1b1a54aec27f36c4337f4206eb35938f530e847a/src/javascripts/app.js) defines `screenTransitionDuration = 1` second, `screenTransitionInterval = 0.1` second, and GSAP `Power4.easeInOut`. Its About transition moves green, blue, pink and the destination screen in staggered layers. [`src/vendor/konterball/screen-transition.js`](src/vendor/konterball/screen-transition.js) ports that layered sequence to Web Animations, using a cubic-bezier approximation of the original easing. A complete entry-and-exit wipe takes two seconds plus the stagger. The local CSS retains `.kb-wipe` and `.transition-color-screen`; native dialog focus handling and reduced-motion support replace the legacy GSAP/Zepto screen controller.

The original WebVR controls, networking, analytics and rotate-phone gate are not required for the adapted interface. The primary game view uses the available viewport in portrait as well as landscape, with no page scrolling. Long information overlays may scroll internally. Reduced-motion handling remains part of the local interface.

## Free font replacements

The upstream README requires separate licences for Antique Olive and Futura. Those font files are not copied.

- **Jost** replaces the Futura-style controls, italic supporting text and large numerals. The installed `@fontsource/jost` package is version `5.3.0`. Its complete SIL Open Font License 1.1 notice is copied unchanged to [`public/licenses/jost-OFL.txt`](public/licenses/jost-OFL.txt).
- **Archivo Black** replaces the heavy Antique Olive-style headings. The installed `@fontsource/archivo-black` package is version `5.3.0`. Its complete SIL Open Font License 1.1 notice is copied unchanged to [`public/licenses/archivo-black-OFL.txt`](public/licenses/archivo-black-OFL.txt).

These are visual substitutions, not the original proprietary typefaces. Fonts are bundled locally.

## Other assets and verification status

Konterball's commissioned Fifth Music soundtrack and sound files are not copied. Optional game sounds remain the local interface's synthesized audio. The piggy-bank model, Poimandres rendering code and Rapier physics retain their separate attributions in [`public/asset-credits.html`](public/asset-credits.html) and [`public/asset-credits.txt`](public/asset-credits.txt).

The settlement-only pig burst is local PIGGY code in `src/piggy-burst.js`, using fragments of the separately attributed pig mesh and snapshots of its coins. It runs for up to 3.6 seconds, with a static reduced-motion alternative; it is not part of the Konterball port and does not affect accounting.

This document records source provenance and adaptations. It does not assert rendered visual QA, mobile browser verification or deployment of this revision.
