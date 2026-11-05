# BP Log — family blood pressure diary

A very simple iPhone app for typing in the numbers from a blood pressure machine.
It is a web app you add to the iPhone home screen. You don't need the App Store or an account.

- **Users**: add each person (name, age, gender) from the main menu.
- **Log**: type SYS and DIA (pulse is optional). The date and time are added automatically.
- **Colors** (based on AHA categories):
  - 🔵 Low: SYS < 90 or DIA < 60
  - 🟢 Normal: below 120/80
  - 🟡 Elevated: SYS 120–129
  - 🟠 High: SYS 130–139 or DIA 80–89
  - 🔴 Very high: SYS ≥ 140 or DIA ≥ 90
- **Calendar**: shows how many readings each day has, colored by that day's highest reading. Tap a day to see its readings.
- **Database**: lists every reading, numbered Record 1…N from top to bottom, with a date filter. Tap a record to fix or delete it.
- **Chart**: SYS/DIA trend for the last 7 days, the last 30 days, or all readings.
- **EN / MN**: switches the app between English and Mongolian.
- **PDF export**: not built yet. The button is shown as "coming soon".

## Privacy

All data is stored **only on that phone** (browser storage). Nothing is sent anywhere.
Because of that:
- Install it from the home screen (see below). iOS keeps home-screen app data, but may clear data for websites opened only in Safari.
- If the phone is lost or reset, the readings are lost too.

## Put it on the iPhone

1. Host these files over HTTPS. The easiest option is GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
   GitHub Pages on a *private* repo needs a paid GitHub plan. You can also make this repo public (it contains no personal data) or use Netlify/Cloudflare Pages.
2. On the iPhone, open the Pages URL in **Safari**.
3. Tap **Share → Add to Home Screen**.
4. Open **BP Log** from the home screen. After the first open it also works offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `styles.css` | Layout and colors (matches the Figma design) |
| `app.js` | All screens, storage, translations |
| `sw.js` | Offline cache (bump `VERSION` after changing files) |
| `manifest.webmanifest`, `icons/` | Home-screen name and icon |

To try it on a computer, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
