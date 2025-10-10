
# Ryder Cup (Demo)
This is a demo Next.js + TailwindCSS site for a small "Ryder Cup" tournament.

## Quick Start
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Admin Page Features
- Add, edit, and delete players from the database using the admin dashboard at `/admin`.
- Assign team, handedness, handicap (supports decimals), and player photo.
- Select a photo from the dropdown (photos in `public/photos`) or upload a new image (filename will be used).
- Handicap input does not show arrow keys and accepts decimal numbers.
- If no photo is selected, a default is used: `us1.jpg` for Team USA, `eu1.jpg` for Team Europe.

## Database
- Player data is stored in `data/players.db` (SQLite).
- Table schema:
	```sql
	CREATE TABLE players (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		slug TEXT NOT NULL,
		photo TEXT,
		handicap INTEGER,
		handedness TEXT,
		team TEXT CHECK(team IN ('USA','Europe'))
	);
	```
- You can inspect or edit the database using the included `sqlite3.exe`:
	```sh
	./sqlite3.exe data/players.db
	.schema players
	SELECT * FROM players;
	```

## Photos
- Place player photos in `public/photos/`.
- Filenames should match those used in the admin form dropdown or upload.

## Requirements
- Node.js (v18+ recommended)
- SQLite3 (binary included)

## Troubleshooting
- If you get a 500 error when adding a player, make sure all required fields are present and the database schema matches the code.
- Uploaded photos are not moved automatically; you must manually place them in `public/photos/` for them to be selectable.

## Development
- TailwindCSS is used for styling.
- Next.js app directory structure.

