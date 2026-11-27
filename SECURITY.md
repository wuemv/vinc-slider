# Security policy

## Reporting a vulnerability

Please report it privately through GitHub: [report a vulnerability](https://github.com/wuemv/vinc-slider/security/advisories/new) (the repository's Security tab, then "Report a vulnerability"). Don't open a public issue or pull request for it.

Say what an attacker can do, and how: the slider's props or content involved, the versions of this package, Vue and the browser, and the steps or a proof of concept. You'll get a reply within a week. Once a fix is released, the advisory is published with credit to you, unless you'd rather not be named.

## What counts

The slider renders what the app passes it: slide text as text, never as HTML, and image and link URLs as given. An app that passes untrusted URLs should check them itself, as with any `<a href>`. A way to run script or inject markup through the slider's props would count.

## Supported versions

Fixes go into the latest release of `@wuemv/slider`. `vinc-slider` 0.0.1, for Vue 2, gets no fixes.
