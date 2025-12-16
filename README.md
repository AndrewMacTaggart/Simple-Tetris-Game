# Tetris Game

A classic Tetris game built with vanilla JavaScript, CSS, and HTML. Play in your browser with smooth controls and clean design.

## Files
- `index.html` - Main HTML structure
- `styles.css` - Modern styling and responsive design
- `script.js` - Game logic and controls

## How to Play

**Option 1: Direct Open**
- Simply double-click `index.html` to open in your default browser

**Option 2: Live Server (Recommended)**
- Install the "Live Server" extension in Cursor/VS Code
- Right-click `index.html` → "Open with Live Server"
- Automatically reloads on file changes

**Option 3: HTTP Server**
- Use any local HTTP server (Node.js, PHP, etc.)
- Example with Node.js: `npx http-server`
- Then open the provided localhost URL in your browser

## Controls

- **← →** Arrow Keys: Move piece left/right
- **↓** Arrow Down: Soft drop (move piece down faster)
- **↑** Arrow Up or **Space**: Rotate piece
- **P**: Pause/Resume game

## Features

- Classic Tetris gameplay with all 7 tetromino pieces (I, O, T, S, Z, J, L)
- Piece rotation and movement
- Line clearing with score tracking
- Level progression (speed increases every 10 lines)
- Next piece preview
- Pause functionality
- Clean, modern UI design
- Fully responsive layout

## Game Mechanics

- **Score**: Increases based on lines cleared (100 × lines² × level)
- **Level**: Increases every 10 lines cleared
- **Speed**: Increases with each level (starts at 1000ms, decreases by 100ms per level)
- **Game Over**: Occurs when a piece cannot be placed at the top of the board
