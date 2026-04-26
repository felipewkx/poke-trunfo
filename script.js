// VARIÁVEIS NO TOPO
let playerDeck = [];
let cpuDeck = [];
let scores = { player: 0, cpu: 0 };
let currentRound = 0;
const TOTAL_ROUNDS = 10;

async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  return {
    name: data.name.toUpperCase(),
    image: data.sprites.other["official-artwork"].front_default,
    type: data.types[0].type.name,
    isRare: data.name === "mew" || data.name === "mewtwo",
    stats: {
      HP: data.stats[0].base_stat,
      ATTACK: Math.floor(
        (data.stats[1].base_stat + data.stats[3].base_stat) / 2,
      ),
      DEFENSE: Math.floor(
        (data.stats[2].base_stat + data.stats[4].base_stat) / 2,
      ),
      AGI: data.stats[5].base_stat,
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

  document.getElementById("status-bubble").innerText = "LOADING DECK...";

  try {
    // Gera IDs aleatórios entre 1 e 151
    const pIds = Array.from(
      { length: TOTAL_ROUNDS },
      () => Math.floor(Math.random() * 151) + 1,
    );
    const cIds = Array.from(
      { length: TOTAL_ROUNDS },
      () => Math.floor(Math.random() * 151) + 1,
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
  document.getElementById("player-card-slot").style.pointerEvents = "auto";
  renderCard(playerDeck[0], "player-card-slot", false);
  renderCard(cpuDeck[0], "cpu-card-slot", true);
}

function renderCard(pokemon, containerId, isFaceDown) {
  const container = document.getElementById(containerId);
  if (!pokemon) {
    container.innerHTML = "";
    return;
  }

  if (isFaceDown) {
    container.innerHTML = `
            <div class="pokemon-card" style="background: #004a99; display:flex; align-items:center; justify-content:center;">
                <div style="font-family: 'Orbitron'; opacity: 0.2; transform: rotate(-45deg); font-size: 2rem;">POKÉMON</div>
            </div>`;
    return;
  }

  const rareClass = pokemon.isRare ? "rare-card" : "";
  const rareBadge = pokemon.isRare ? '<div class="rare-badge">RARE</div>' : "";

  // Criamos o HTML da carta
  container.innerHTML = `
        <div class="pokemon-card ${rareClass}">
            ${rareBadge}
            <h2 style="margin:0; color: var(--neon-blue); font-family: 'Orbitron'">${pokemon.name}</h2>
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="stats-container" id="stats-${containerId}">
                <div class="stat-row" data-stat="HP"><span>HP</span> <span>${pokemon.stats.HP}</span></div>
                <div class="stat-row" data-stat="ATTACK"><span>ATTACK</span> <span>${pokemon.stats.ATTACK}</span></div>
                <div class="stat-row" data-stat="DEFENSE"><span>DEFENSE</span> <span>${pokemon.stats.DEFENSE}</span></div>
                <div class="stat-row" data-stat="AGI"><span>AGI</span> <span>${pokemon.stats.AGI}</span></div>
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

  // Valores puros das cartas, sem multiplicadores
  let pValue = pCard.stats[stat];
  let cValue = cCard.stats[stat];

  let winner = "";
  // Regra Super Trunfo: Mew/Mewtwo (Rare) vencem cartas comuns
  if (pCard.isRare && !cCard.isRare) winner = "player";
  else if (cCard.isRare && !pCard.isRare) winner = "cpu";
  else winner = pValue >= cValue ? "player" : "cpu";

  // Exibe o Log da Batalha com valores originais
  const logMsg = `${pCard.name} (${pValue}) vs ${cCard.name} (${cValue}) em ${stat}`;
  document.getElementById("log-display").innerHTML = logMsg;

  if (winner === "player") {
    scores.player++;
    document.getElementById("status-bubble").innerText = "YOU WIN!";
    document.getElementById("player-score").innerText = scores.player;
  } else {
    scores.cpu++;
    document.getElementById("status-bubble").innerText = "CPU WINS!";
    document.getElementById("cpu-score").innerText = scores.cpu;
  }

  document.getElementById("next-btn").style.display = "block";
  document.getElementById("player-card-slot").style.pointerEvents = "none";
}

function nextRound() {
  playerDeck.shift();
  cpuDeck.shift();
  currentRound++;

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
  let finalMsg =
    scores.player > scores.cpu
      ? "CONGRATULATIONS! YOU ARE THE CHAMPION!"
      : "SORRY, YOU LOST! TRY AGAIN!";

  document.getElementById("status-bubble").innerText = "GAME OVER";
  alert(finalMsg);
  document.getElementById("start-btn").style.display = "block";
  document.getElementById("start-btn").innerText = "RESTART GAME";
}

document.getElementById("next-btn").addEventListener("click", nextRound);

document.getElementById("start-btn").addEventListener("click", startGame);
