A SOLUTION — ALAMEEN DIGITAL HUMAN

This patch adds a full-screen digital-human experience inspired by the supplied
reference screenshots.

Upload these files to the repository while keeping the folders:

- alameen-assistant-core.js
- alameen-welcome.css
- alameen-welcome.js
- alameen-taj-alsir-transparent.png
- Welcome/index.html
- ar/Welcome/index.html
- DigitalHumans/index.html
- ar/DigitalHumans/index.html

After GitHub Pages publishes the commit, open:

- Arabic: https://alameensolution.site/ar/DigitalHumans/
- Arabic welcome alias: https://alameensolution.site/ar/Welcome/
- English: https://alameensolution.site/DigitalHumans/

Behavior included:

- dark navy full-screen layout with green, blue and purple chevrons
- Alameen Taj Alsir transparent portrait centered on the page
- Arabic/English language switch
- welcome notices and green Start Speaking button
- microphone permission request through the browser
- speech synthesis with Arabic and English voices when the browser supports it
- microphone speech recognition when the browser supports it
- animated idle, listening and speaking states
- text input fallback when voice recognition is unavailable
- captions, speaker replay and return-to-website controls

The movement is implemented in the browser with CSS animation and browser
speech APIs. A true filmed/3D lip-synced digital human would additionally
require a video/avatar service or a dedicated pre-recorded animation asset.
