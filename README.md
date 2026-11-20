# Snake+ bookmarklet

Snake you can launch on top of any web page. 8 modes, including a 10-boss Boss Rush.
Works with keyboard (arrows / WASD) and touch (swipe).

## Install

There are two versions. Pick one:

| Version | Code to paste | Pros | Cons |
|---|---|---|---|
| **Short (recommended)** | contents of [`loader.txt`](loader.txt) (~200 characters) | Easy to copy on a phone/iPad; always gets the latest game | Needs internet; blocked on a few sites with strict security (e.g. github.com, google.com) |
| **Full** | contents of [`bookmarklet.txt`](bookmarklet.txt) (~35 KB) | Works offline and on almost every site | Long – hard to copy by hand on mobile |

Short code:

```
javascript:(function(){var%20s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/slapbattlesthebestfrfr/Snake-bookmarklet-ai@main/snake.min.js';s.onerror=function(){alert('Snake+%20could%20not%20download%20the%20game%20on%20this%20site.%20Try%20the%20full%20version.')};document.body.appendChild(s)})()
```

### iPad / iPhone (Safari)
1. Bookmark any page (Share button -> **Add Bookmark**), name it `Snake`, Save.
2. Open Bookmarks -> **Edit** -> tap the `Snake` bookmark.
3. Delete the address and paste the code (it must start with `javascript:`). Tap Done.
4. Go to a normal website (not the start page), open Bookmarks and tap `Snake`.

### Android (Chrome)
1. Bookmark any page (menu ⋮ -> star), then tap **Edit** in the popup.
2. Name it `snake`, replace the URL with the code, save.
3. **Important:** Chrome on Android does not run bookmarklets from the bookmarks list.
   Instead, go to a normal website, tap the address bar, type `snake`, and tap the
   bookmark suggestion (the one with the star icon).

### Desktop
Create a bookmark, paste the code as its URL, click it on any page.

## Check that bookmarklets work at all
Make a second bookmark with this as its URL and run it the same way:
```
javascript:alert('bookmarklets work')
```
If no popup appears, the browser isn't running bookmarklets (see below), and the game can't run either.

## Things that stop it from working
- The code must start with `javascript:` – some browsers delete that part when pasting
  into the **address bar**. Paste into the bookmark's URL field instead.
- Bookmarklets don't run on the browser's start page / new tab page, or on pages like
  `chrome://` – open a normal website first.
- If the short version does nothing on a site, try another site or use the full version.

## Controls
Arrows / WASD or swipe to steer • R restart • M menu • Space / P pause • N sound •
Esc or tap outside the game to close.

## Build
`npm install && npm run build` regenerates `bookmarklet.txt`, `snake.min.js`,
`loader.txt` and `index.html` from `src/snake.js`.
