# 🃏 PokéTrumps

A professional, responsive digital card game inspired by the classic Brazilian **Super Trunfo (Grow)** + Pokémon. Built with high-fidelity visuals using Glassmorphism, CSS animations, and real-time data from the PokéAPI.

LIVE DEMO: https://felipewkx.github.io/poke-trunfo/

## 🚀 Features

- **Dynamic Data:** Fetches stats, types, and high-resolution artworks directly from [PokéAPI](https://pokeapi.co/).
- **Glassmorphism UI:** Modern interface with blur effects, neon borders, and professional shadows.
- **Retro Mechanics:**
    - **Custom Stats:** Attributes calculated via logic (Average Attack/Defense).
    - **Rare Card Logic:** Mew and Mewtwo act as "Super Trumps", winning automatically against common cards.
    - **Holographic Effects:** CSS-animated "Shiny" effect for Rare cards.
- **Responsive Design:** - 🖥️ **Desktop:** Side-by-side horizontal battle arena.
    - 📱 **Mobile:** Stacked vertical layout optimized for touch.
- **VS Computer Mode:** Play 10 rounds against an automated AI.

## 🛠️ Technologies

- **HTML5:** Semantic structure.
- **CSS3:** Advanced animations, Flexbox/Grid, and Glassmorphism.
- **JavaScript (ES6+):** - Asynchronous programming (`fetch`, `Promise.all`) for fast deck loading.
    - DOM Manipulation and game state logic.

## 🎮 How to Play

1. **Start:** Click the "Start Game" button to fetch two random 10-card decks.
2. **Choose:** On your turn, analyze your Pokémon and click on the stat you think is the strongest (**HP, Attack, Defense, or Agi**).
3. **Compare:** The CPU card will reveal itself. The higher number wins the round.
4. **Super Trunfo:** If you have **Mew** or **Mewtwo**, you win the round automatically unless the opponent also has a Rare card.
5. **Next:** Check the battle log and click "Next Round".
6. **Victory:** After 10 rounds, the player with the most points is crowned the Pokémon Master!


Technical Highlights
-------

Performance: Used Promise.all to fetch 20 Pokémon cards simultaneously, reducing load time from 10s to <2s.

Game Logic: Implemented a "Lock" system to prevent multiple clicks during animations, ensuring UI stability.

Responsive UI: Used Media Queries to transform the experience from horizontal (PC) to vertical (Mobile) seamlessly.

Developed by Felipe Walker
----
