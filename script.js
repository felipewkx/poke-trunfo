// VARIÁVEIS NO TOPO
let playerDeck = [];
let cpuDeck = [];
let scores = { player: 0, cpu: 0 };
let currentRound = 0;
const TOTAL_ROUNDS = 10;
let selectedGen = { min: 1, max: 151 };

function resetGame() {
  playerDeck = [];
  cpuDeck = [];
  scores = { player: 0, cpu: 0 };
  currentRound = 0;
  document.getElementById("player-score").innerText = "0";
  document.getElementById("cpu-score").innerText = "0";
  document.getElementById("status-bubble").innerText = "READY?";
  document.getElementById("log-display").innerText = "";
  const explanation = document.getElementById("battle-explanation");
  explanation && explanation.remove();
  document.getElementById("start-btn").style.display = "block";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("menu-btn").style.display = "none";
  document.getElementById("player-card-slot").innerHTML = "";
  document.getElementById("cpu-card-slot").innerHTML = "";
  ((document.getElementById("player-card-slot").style.pointerEvents = "auto"),
    document.querySelectorAll(".swap-arrow").forEach((btn) => {
      btn.style.opacity = "0";
      btn.style.pointerEvents = "none";
    }));
}

function showMenu() {
  document.querySelector(".game-container").style.display = "none";
  document.getElementById("generation-selection").style.display = "flex";
}

async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  return {
    id: id,
    name: data.name.toUpperCase(),
    image: data.sprites.other["official-artwork"].front_default,
    type: data.types[0].type.name,
    isRare: [150, 151, 249, 250, 251, 384, 385, 386].includes(id),
    stats: {
      HP: data.stats[0].base_stat,
      ATTACK: data.stats[1].base_stat + data.stats[3].base_stat,
      DEFENSE: data.stats[2].base_stat + data.stats[4].base_stat,
      SPEED: data.stats[5].base_stat,
    },
  };
}

async function startGame() {
  scores = { player: 0, cpu: 0 };
  currentRound = 0;
  document.getElementById("player-score").innerText = "0";
  document.getElementById("cpu-score").innerText = "0";
  document.getElementById("log-display").innerText = "";
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("menu-btn").style.display = "block";

  document.getElementById("status-bubble").innerText = "LOADING DECK...";
  document.querySelectorAll(".swap-arrow").forEach((btn) => {
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
  });

  try {
    // Gera IDs aleatórios entre min e max da geração selecionada
    const pIds = Array.from(
      { length: TOTAL_ROUNDS },
      () =>
        Math.floor(Math.random() * (selectedGen.max - selectedGen.min + 1)) +
        selectedGen.min,
    );
    const cIds = Array.from(
      { length: TOTAL_ROUNDS },
      () =>
        Math.floor(Math.random() * (selectedGen.max - selectedGen.min + 1)) +
        selectedGen.min,
    );

    // Baixa todos os Pokémon simultaneamente (Muito mais rápido)
    playerDeck = await Promise.all(pIds.map((id) => fetchPokemon(id)));
    cpuDeck = await Promise.all(cIds.map((id) => fetchPokemon(id)));

    updateUI();
    document.getElementById("status-bubble").innerText = "ROUND 1";
  } catch (error) {
    console.error("Erro ao carregar:", error);
    document.getElementById("status-bubble").innerText = "CONNECTION ERROR";
    document.getElementById("start-btn").style.display = "block";
  }
}

function updateUI() {
  const pCard = playerDeck[0];
  document.getElementById("player-card-slot").style.pointerEvents = "auto";
  renderCard(pCard, "player-card-slot", false);
  renderCard(cpuDeck[0], "cpu-card-slot", true);

  if (pCard && pCard.isRare) {
    setTimeout(() => {
      alert("⭐ SUPER TRUNFO! ⭐");
    }, 100);
  }
}

function renderCard(pokemon, containerId, isFaceDown) {
  const container = document.getElementById(containerId);
  if (!pokemon) {
    container.innerHTML = "";
    return;
  }

  if (isFaceDown) {
    container.innerHTML = `
            <div class="pokemon-card card-back">
                <div class="card-back__label">POKÉMON</div>
            </div>`;
    return;
  }

  const rareClass = pokemon.isRare ? "rare-card" : "";
  const rareBadge = pokemon.isRare
    ? '<div class="rare-badge">RARE</div><div class="super-trunfo-badge" style="font-size: 1.2rem; font-weight: bold; color: gold; text-shadow: 2px 2px black;">SUPER TRUNFO</div>'
    : "";
  const nameColor = pokemon.isRare
    ? 'style="color: hotpink;"'
    : 'style="color: var(--poke-yellow);"';

  // Criamos o HTML da carta
  container.innerHTML = `
        <div class="pokemon-card ${rareClass}">
            ${rareBadge}
            <h2 style="margin:0; font-family: 'Orbitron'" ${nameColor}><img src="assets/logo.png" alt="Pokeball" class="pokeball-icon">${pokemon.name}</h2>
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="stats-container" id="stats-${containerId}">
                <div class="stat-row" data-stat="HP"><img src="assets/logo.png" alt="Pokeball" class="pokeball-icon"><span>HP</span> <span>${pokemon.stats.HP}</span></div>
                <div class="stat-row" data-stat="ATTACK"><img src="assets/logo.png" alt="Pokeball" class="pokeball-icon"><span>ATTACK</span> <span>${pokemon.stats.ATTACK}</span></div>
                <div class="stat-row" data-stat="DEFENSE"><img src="assets/logo.png" alt="Pokeball" class="pokeball-icon"><span>DEFENSE</span> <span>${pokemon.stats.DEFENSE}</span></div>
                <div class="stat-row" data-stat="SPEED"><img src="assets/logo.png" alt="Pokeball" class="pokeball-icon"><span>SPEED</span> <span>${pokemon.stats.SPEED}</span></div>
            </div>
            <div style="margin-top:10px; font-size:0.7rem; color: #888; letter-spacing: 2px">TYPE: ${pokemon.type.toUpperCase()}</div>
        </div>
    `;

  // Se for a carta do jogador, adicionamos os event listeners manualmente para garantir o clique
  if (containerId === "player-card-slot") {
    const rows = container.querySelectorAll(".stat-row");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const selectedStat = row.getAttribute("data-stat");
        playTurn(selectedStat);
      });
    });
  }
}

function playTurn(stat) {
  const pCard = playerDeck[0];
  const cCard = cpuDeck[0];
  renderCard(cCard, "cpu-card-slot", false);

  if (cCard.isRare) {
    setTimeout(() => alert("⭐ CPU TEM UM SUPER TRUNFO! ⭐"), 100);
  }
  // Valores puros das cartas, sem multiplicadores
  let pValue = pCard.stats[stat];
  let cValue = cCard.stats[stat];

  let winner = "";
  // Regra Super Trunfo: Rare vencem cartas comuns, mas se ambos rare ou empate, é empate
  if (pCard.isRare && cCard.isRare) winner = "tie";
  else if (pCard.isRare && !cCard.isRare) winner = "player";
  else if (cCard.isRare && !pCard.isRare) winner = "cpu";
  else if (pValue > cValue) winner = "player";
  else if (cValue > pValue) winner = "cpu";
  else winner = "tie";

  // Add outlines to cards
  const playerCardEl = document.querySelector(
    "#player-card-slot .pokemon-card",
  );
  const cpuCardEl = document.querySelector("#cpu-card-slot .pokemon-card");

  if (winner === "player") {
    showBattleExplanation(winner, pCard, cCard, stat, pValue, cValue);
    playerCardEl.classList.add("winner-card");
    cpuCardEl.classList.add("loser-card");
    scores.player++;
    document.getElementById("status-bubble").innerText = "YOU WIN!";
    document.getElementById("player-score").innerText = scores.player;

    // Highlight the stat
    const winningCardEl = playerCardEl;
    const losingCardEl = cpuCardEl;
    const winningPokemon = pCard;
    const losingPokemon = cCard;

    const winningStatRow = winningCardEl.querySelector(
      `.stat-row[data-stat="${stat}"]`,
    );
    const losingStatRow = losingCardEl.querySelector(
      `.stat-row[data-stat="${stat}"]`,
    );

    if (!winningPokemon.isRare) winningStatRow.classList.add("winner-stat");
    if (!losingPokemon.isRare) losingStatRow.classList.add("loser-stat");
  } else if (winner === "cpu") {
    showBattleExplanation(winner, cCard, pCard, stat, cValue, pValue);
    playerCardEl.classList.add("loser-card");
    cpuCardEl.classList.add("winner-card");
    scores.cpu++;
    document.getElementById("status-bubble").innerText = "CPU WINS!";
    document.getElementById("cpu-score").innerText = scores.cpu;

    // Highlight the stat
    const winningCardEl = cpuCardEl;
    const losingCardEl = playerCardEl;
    const winningPokemon = cCard;
    const losingPokemon = pCard;

    const winningStatRow = winningCardEl.querySelector(
      `.stat-row[data-stat="${stat}"]`,
    );
    const losingStatRow = losingCardEl.querySelector(
      `.stat-row[data-stat="${stat}"]`,
    );

    if (!winningPokemon.isRare) winningStatRow.classList.add("winner-stat");
    if (!losingPokemon.isRare) losingStatRow.classList.add("loser-stat");
  } else if (winner === "tie") {
    showBattleExplanation(winner, pCard, cCard, stat, pValue, cValue);
    // No outlines for tie
    document.getElementById("status-bubble").innerText = "IT'S A TIE!";
  }

  document.getElementById("next-btn").style.display = "block";
  document.getElementById("player-card-slot").style.pointerEvents = "none";
}

function showBattleExplanation(
  winner,
  winnerCard,
  loserCard,
  stat,
  winnerValue,
  loserValue,
) {
  let explanation = document.getElementById("battle-explanation");

  // Creates the element only once
  if (!explanation) {
    explanation = document.createElement("div");
    explanation.id = "battle-explanation";

    const statusBubble = document.getElementById("status-bubble");
    statusBubble.insertAdjacentElement("afterend", explanation);
  }

  // Tie
  if (winner === "tie") {
    const isDoubleRare = winnerCard.isRare && loserCard.isRare;
    explanation.innerHTML = isDoubleRare
      ? `🤝 TIE because both are<br><span class="rare-text">SUPER TRUNFO CARDS</span>`
      : `🤝 ${winnerCard.name} and ${loserCard.name} TIED because:<br>
         <span class="battle-stat">${stat}</span> (${winnerValue}) equals <span class="battle-stat">${stat}</span> (${loserValue})`;
    return;
  }

  // SUPER TRUNFO rare card rule
  if (winnerCard.isRare && !loserCard.isRare) {
    explanation.innerHTML = `
  🌟 <span class="battle-winner">${winnerCard.name}</span>
  WON because:<br>
  it is a
  <span class="rare-text">SUPER TRUNFO RARE CARD</span>
`;
    return;
  }

  // Normal stat victory
  explanation.innerHTML = `
  🏆 <span class="battle-winner">${winnerCard.name}</span>
  WON because:<br>
  <span class="battle-stat">${stat}</span>
  (${winnerValue})
  is higher<br>
  than <span class="battle-stat">${stat}</span>
  (${loserValue}).<br> 
  <span style="color: red;">${loserCard.name}</span> lost the battle.
`;
}

function nextRound() {
  playerDeck.shift();
  cpuDeck.shift();
  currentRound++;

  document.getElementById("log-display").innerText = "";

  const explanation = document.getElementById("battle-explanation");
  if (explanation) {
    explanation.remove();
  }

  // Remove previous round's classes
  const playerCardEl = document.querySelector(
    "#player-card-slot .pokemon-card",
  );
  const cpuCardEl = document.querySelector("#cpu-card-slot .pokemon-card");
  if (playerCardEl) {
    playerCardEl.classList.remove(
      "winner-card",
      "loser-card",
      "winner-outline",
      "loser-outline",
    );
    playerCardEl
      .querySelectorAll(".stat-row")
      .forEach((row) => row.classList.remove("winner-stat", "loser-stat"));
  }
  if (cpuCardEl) {
    cpuCardEl.classList.remove(
      "winner-card",
      "loser-card",
      "winner-outline",
      "loser-outline",
    );
    cpuCardEl
      .querySelectorAll(".stat-row")
      .forEach((row) => row.classList.remove("winner-stat", "loser-stat"));
  }

  document.getElementById("next-btn").style.display = "none";
  document.getElementById("player-card-slot").style.pointerEvents = "auto";
  document.getElementById("log-display").innerText = "";

  if (currentRound < TOTAL_ROUNDS) {
    updateUI();
    document.getElementById("status-bubble").innerText =
      `ROUND ${currentRound + 1}`;
  } else {
    finishGame();
  }
}

function finishGame() {
  let finalMsg;
  if (scores.player > scores.cpu) {
    finalMsg = "CONGRATULATIONS! YOU ARE THE POKÉ-MASTER!";
  } else if (scores.cpu > scores.player) {
    finalMsg = "OOPS, YOU LOST! TRY AGAIN!";
  } else {
    finalMsg = "IT'S A TIE!";
  }

  document.getElementById("status-bubble").innerText = "GAME OVER";
  alert(finalMsg);
  resetGame();
  showMenu();
}

document.getElementById("next-btn").addEventListener("click", nextRound);

document.getElementById("start-btn").addEventListener("click", startGame);

document.getElementById("menu-btn").addEventListener("click", () => {
  resetGame();
  showMenu();
});

function setPokedexOpen(open) {
  const panel = document.getElementById("pokedex-panel");
  const backdrop = document.getElementById("pokedex-backdrop");
  if (open) {
    panel.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("pokedex-open");
  } else {
    panel.classList.add("hidden");
    backdrop.classList.add("hidden");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pokedex-open");
  }
}

document.getElementById("open-pokedex-btn").addEventListener("click", () => {
  setPokedexOpen(true);
});

document.getElementById("close-pokedex-btn").addEventListener("click", () => {
  setPokedexOpen(false);
});

document.getElementById("pokedex-backdrop").addEventListener("click", () => {
  setPokedexOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!document.getElementById("pokedex-panel").classList.contains("hidden")) {
    setPokedexOpen(false);
  }
});

function selectGeneration(min, max) {
  selectedGen = { min, max };
  resetGame();
  document.getElementById("generation-selection").style.display = "none";
  document.querySelector(".game-container").style.display = "flex";
}

document
  .getElementById("gen1-btn")
  .addEventListener("click", () => selectGeneration(1, 151));
document
  .getElementById("gen2-btn")
  .addEventListener("click", () => selectGeneration(152, 251));
document
  .getElementById("gen3-btn")
  .addEventListener("click", () => selectGeneration(252, 386));
document
  .getElementById("all-btn")
  .addEventListener("click", () => selectGeneration(1, 386));

/* =========================
   3D CARD SYSTEM
========================= */

const viewport3D = document.querySelector(".cards-viewport");

let showingPlayerFront = true;
let isSwapping = false;

/* SWAP */

function swapCards3D() {
  if (isSwapping) return;

  isSwapping = true;

  viewport3D.classList.add("swapping");

  setTimeout(() => {
    const playerSlot = document.getElementById("player-card-slot");
    const cpuSlot = document.getElementById("cpu-card-slot");

    playerSlot.classList.toggle("slot-front");
    playerSlot.classList.toggle("slot-back");

    cpuSlot.classList.toggle("slot-front");
    cpuSlot.classList.toggle("slot-back");

    viewport3D.classList.remove("swapping");

    showingPlayerFront = !showingPlayerFront;

    isSwapping = false;
  }, 200);
}

/* BUTTONS */

document.getElementById("swap-left").addEventListener("click", swapCards3D);

document.getElementById("swap-right").addEventListener("click", swapCards3D);

/* PARALLAX */

function setupCardParallax() {
  document.querySelectorAll(".pokemon-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = (x / rect.width - 0.5) * 18;
      const rotateX = (y / rect.height - 0.5) * -18;

      card.style.transform = `
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(10px)
            `;

      card.style.setProperty("--shine-x", `${-rotateY * 2}px`);

      card.style.setProperty("--shine-y", `${-rotateX * 2}px`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `
                rotateX(0deg)
                rotateY(0deg)
                translateZ(0px)
            `;

      card.style.setProperty("--shine-x", "0px");
      card.style.setProperty("--shine-y", "0px");
    });
  });
}

/* AUTO RE-INIT */

const oldRenderCard = renderCard;

renderCard = function (...args) {
  oldRenderCard(...args);

  setTimeout(() => {
    setupCardParallax();
  }, 50);
};
