# Current PIGGY holding page

This directory contains the static pages and assets currently served on piggy.casa, including the game-launch countdown for 2 November 2026 at 21:30 Europe/London. Edit launch.json to change the schedule. The countdown reaches zero at the scheduled time. A separate server coordinator must validate the token, initialize the game and report healthy operators before the page switches to /play/. If checks are pending it stays on the landing page.

Run a static HTTP server here to preview. The production `/rpc` function is provided by the main application server code and Vercel project; secrets are environment-only and are not included. The gameplay frontend and operator sources are in `../reactor-ui`.
