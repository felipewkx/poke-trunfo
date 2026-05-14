const TOTAL_ROUNDS = 10;
const TYPE_ADVANTAGE_BONUS = 25;

let playerDeck = [];
let cpuDeck = [];
let scores = { player: 0, cpu: 0 };
let currentRound = 0;
let selectedGen = { min: 1, max: 151 };

const typeMatchupCache = new Map();

function setSwapArrowsInteractive(active) {
  document.querySelectorAll(".swap-arrow").forEach((btn) => {
    btn.style.opacity = active ? "1" : "0";
    btn.style.pointerEvents = active ? "auto" : "none";
  });
}

async function fetchTypeSuperEffectiveTargets(typeName) {
  const key = typeName.toLowerCase();
  if (typeMatchupCache.has(key)) return typeMatchupCache.get(key);
  const res = await fetch(`https://pokeapi.co/api/v2/type/${key}/`);
  if (!res.ok) throw new Error(`Type fetch failed: ${key}`);
  const typeData = await res.json();
  const targets = new Set(
    typeData.damage_relations.double_damage_to.map((t) => t.name),
  );
  typeMatchupCache.set(key, targets);
  return targets;
}

function resetGame() {
  playerDeck = [];
  cpuDeck = [];
  scores = { player: 0, cpu: 0 };
  currentRound = 0;
  document.getElementById("player-score").innerText = "0";
  document.getElementById("cpu-score").innerText = "0";
  document.getElementById("status-bubble").innerText = "READY?";
  const explanation = document.getElementById("battle-explanation");
  if (explanation) explanation.remove();
  document.getElementById("start-btn").style.display = "block";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("menu-btn").style.display = "none";
  document.getElementById("player-card-slot").innerHTML = "";
  document.getElementById("cpu-card-slot").innerHTML = "";
  document.getElementById("player-card-slot").style.pointerEvents = "auto";
  setSwapArrowsInteractive(false);
}

function showMenu() {
  document.querySelector(".game-container").style.display = "none";
  document.getElementById("generation-selection").style.display = "flex";
}

async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) throw new Error(`Pokémon ${id} fetch failed`);
  const data = await response.json();
  const primaryType = data.types[0].type.name;
  const superEffectiveAgainst =
    await fetchTypeSuperEffectiveTargets(primaryType);

  return {
    id,
    name: data.name.toUpperCase(),
    image:
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.other?.home?.front_default ||
      data.sprites.front_default ||
      "",
    type: primaryType,
    superEffectiveAgainst,
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
  currentRound = 1; // Começa na rodada 1

  document.getElementById("player-score").innerText = "0";
  document.getElementById("cpu-score").innerText = "0";
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("menu-btn").style.display = "block";
  document.getElementById("status-bubble").innerText = "LOADING DECK...";
  setSwapArrowsInteractive(true);

  try {
    const randId = () =>
      Math.floor(Math.random() * (selectedGen.max - selectedGen.min + 1)) +
      selectedGen.min;

    const pIds = Array.from({ length: TOTAL_ROUNDS }, randId);
    const cIds = Array.from({ length: TOTAL_ROUNDS }, randId);

    // Baixa o baralho inteiro apenas aqui no início
    playerDeck = await Promise.all(pIds.map((id) => fetchPokemon(id)));
    cpuDeck = await Promise.all(cIds.map((id) => fetchPokemon(id)));

    // Inicia a primeira rodada sem resetar os dados
    renderRound();
  } catch (error) {
    console.error(error);
    document.getElementById("status-bubble").innerText = "CONNECTION ERROR";
    document.getElementById("start-btn").style.display = "block";
    setSwapArrowsInteractive(false);
  }
}

// 2. CRIE ESTA NOVA FUNÇÃO
function renderRound() {
  if (currentRound > TOTAL_ROUNDS || playerDeck.length === 0) {
    finishGame();
    return;
  }

  updateUI();
  document.getElementById("status-bubble").innerText = `ROUND ${currentRound}`;
}

function updateUI() {
  const pCard = playerDeck[0];
  document.getElementById("player-card-slot").style.pointerEvents = "auto";
  renderCard(pCard, "player-card-slot", false, {
    ownerLabel: "Player",
    bonusStat: null,
  });
  renderCard(cpuDeck[0], "cpu-card-slot", true);

  if (pCard?.isRare) {
    setTimeout(() => alert("⭐ SUPER TRUNFO! ⭐"), 100);
  }
}

function statRowHtml(pokemon, statKey, bonusStat) {
  const bonus =
    bonusStat === statKey
      ? '<span class="type-advantage-badge" aria-label="Type advantage">+25</span>'
      : "";
  return `
    <div class="stat-row" data-stat="${statKey}">
      <span class="stat-row__left">
        <img src="assets/logo.png" alt="" class="pokeball-icon" width="18" height="18" />
        <span>${statKey}</span>
      </span>
      <span class="stat-row__right">
        <span class="stat-val">${pokemon.stats[statKey]}</span>
        ${bonus}
      </span>
    </div>`;
}

function renderCard(pokemon, containerId, isFaceDown, options = {}) {
  const container = document.getElementById(containerId);
  const { ownerLabel = "", bonusStat = null } = options;

  if (!pokemon) {
    container.innerHTML = "";
    return;
  }

  if (isFaceDown) {
    container.innerHTML = `
      <div class="pokemon-card card-back">
        <div class="card-back__label">POKÉMON</div>
      </div>`;
    queueMicrotask(setupCardParallax);
    return;
  }

  const rareClass = pokemon.isRare ? "rare-card" : "";
  const rareBadge = pokemon.isRare
    ? '<div class="rare-badge">RARE</div><div class="super-trunfo-badge">SUPER TRUNFO</div>'
    : "";
  const nameColor = pokemon.isRare
    ? 'style="color: hotpink;"'
    : 'style="color: var(--poke-yellow);"';

  const ownerHtml = ownerLabel
    ? `<div class="card-type-line"><span class="type-owner-badge">${ownerLabel}</span><span class="card-type-name" aria-label="Element">${pokemon.type.toUpperCase()}</span></div>`
    : `<div class="card-type-line"><span class="card-type-name">${pokemon.type.toUpperCase()}</span></div>`;

  container.innerHTML = `
    <div class="pokemon-card ${rareClass}">
      ${rareBadge}
      <h2 ${nameColor}>
        <img src="assets/logo.png" alt="" class="pokeball-icon" width="18" height="18" />
        ${pokemon.name}
      </h2>
      <img src="${pokemon.image}" alt="${pokemon.name}" />
      <div class="stats-container" id="stats-${containerId}">
        ${statRowHtml(pokemon, "HP", bonusStat)}
        ${statRowHtml(pokemon, "ATTACK", bonusStat)}
        ${statRowHtml(pokemon, "DEFENSE", bonusStat)}
        ${statRowHtml(pokemon, "SPEED", bonusStat)}
      </div>
      ${ownerHtml}
    </div>`;

  if (containerId === "player-card-slot") {
    container.querySelectorAll(".stat-row").forEach((row) => {
      row.addEventListener("click", () => {
        playTurn(row.getAttribute("data-stat"));
      });
    });
  }

  queueMicrotask(setupCardParallax);
}

function computeTypeBonuses(pCard, cCard) {
  // Garante que os cards existem e possuem a propriedade 'type'
  const pType = pCard?.type?.toLowerCase();
  const cType = cCard?.type?.toLowerCase();

  // Verifica as vantagens apenas se os tipos forem válidos
  const pAdv =
    pType && cType ? (pCard.superEffectiveAgainst?.has(cType) ?? false) : false;
  const cAdv =
    pType && cType ? (cCard.superEffectiveAgainst?.has(pType) ?? false) : false;

  return {
    playerBonus: pAdv ? TYPE_ADVANTAGE_BONUS : 0,
    cpuBonus: cAdv ? TYPE_ADVANTAGE_BONUS : 0,
    playerHadAdvantage: pAdv,
    cpuHadAdvantage: cAdv,
  };
}

function playTurn(stat) {
  const pCard = playerDeck[0];
  const cCard = cpuDeck[0];
  if (!pCard || !cCard || !stat) return;

  const { playerBonus, cpuBonus, playerHadAdvantage, cpuHadAdvantage } =
    computeTypeBonuses(pCard, cCard);

  const pBase = pCard.stats[stat];
  const cBase = cCard.stats[stat];
  const pTotal = pBase + playerBonus;
  const cTotal = cBase + cpuBonus;

  let winner = "";
  if (pCard.isRare && cCard.isRare) winner = "tie";
  else if (pCard.isRare && !cCard.isRare) winner = "player";
  else if (cCard.isRare && !pCard.isRare) winner = "cpu";
  else if (pTotal > cTotal) winner = "player";
  else if (cTotal > pTotal) winner = "cpu";
  else winner = "tie";

  const statsMatter = !pCard.isRare && !cCard.isRare;

  renderCard(cCard, "cpu-card-slot", false, {
    ownerLabel: "CPU",
    bonusStat: winner === "cpu" && cpuHadAdvantage && statsMatter ? stat : null,
  });
  renderCard(pCard, "player-card-slot", false, {
    ownerLabel: "Player",
    bonusStat:
      winner === "player" && playerHadAdvantage && statsMatter ? stat : null,
  });

  if (cCard.isRare) {
    setTimeout(() => alert("⭐ CPU TEM UM SUPER TRUNFO! ⭐"), 100);
  }

  const playerCardEl = document.querySelector(
    "#player-card-slot .pokemon-card",
  );
  const cpuCardEl = document.querySelector("#cpu-card-slot .pokemon-card");

  const logParts = [
    `Round ${currentRound}: ${stat}`,
    `${pCard.name} (${pCard.type.toUpperCase()}) ${pBase}${playerBonus ? ` + ${playerBonus} type` : ""} = ${pTotal}`,
    `${cCard.name} (${cCard.type.toUpperCase()}) ${cBase}${cpuBonus ? ` + ${cpuBonus} type` : ""} = ${cTotal}`,
  ];
  if (playerHadAdvantage || cpuHadAdvantage) {
    logParts.push(
      "Type chart (PokéAPI): super-effective matchups grant +" +
        TYPE_ADVANTAGE_BONUS +
        " to the chosen stat.",
    );
    if (playerHadAdvantage) {
      logParts.push(
        `${pCard.name}'s type is super-effective vs ${cCard.type.toUpperCase()}.`,
      );
    }
    if (cpuHadAdvantage) {
      logParts.push(
        `${cCard.name}'s type is super-effective vs ${pCard.type.toUpperCase()}.`,
      );
    }
  }
  console.debug(logParts.join(" | "));

  if (winner === "player") {
    showBattleExplanation(pCard, cCard, stat, {
      winnerTotal: pTotal,
      loserTotal: cTotal,
      winnerBonus: playerBonus,
      loserBonus: cpuBonus,
    });
    playerCardEl.classList.add("winner-card");
    cpuCardEl.classList.add("loser-card");
    scores.player++;
    document.getElementById("status-bubble").innerText = "YOU WIN!";
    document.getElementById("player-score").innerText = scores.player;
    if (!pCard.isRare) {
      playerCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("winner-stat");
    }
    if (!cCard.isRare) {
      cpuCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("loser-stat");
    }
  } else if (winner === "cpu") {
    showBattleExplanation(cCard, pCard, stat, {
      winnerTotal: cTotal,
      loserTotal: pTotal,
      winnerBonus: cpuBonus,
      loserBonus: playerBonus,
    });
    playerCardEl.classList.add("loser-card");
    cpuCardEl.classList.add("winner-card");
    scores.cpu++;
    document.getElementById("status-bubble").innerText = "CPU WINS!";
    document.getElementById("cpu-score").innerText = scores.cpu;
    if (!cCard.isRare) {
      cpuCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("winner-stat");
    }
    if (!pCard.isRare) {
      playerCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("loser-stat");
    }
  } else {
    showBattleExplanationTie(pCard, cCard, stat, {
      pTotal,
      cTotal,
      playerBonus,
      cpuBonus,
    });
    document.getElementById("status-bubble").innerText = "IT'S A TIE!";
  }

  document.getElementById("next-btn").style.display = "block";
  document.getElementById("player-card-slot").style.pointerEvents = "none";
}

function getOrCreateBattleExplanationEl() {
  let explanation = document.getElementById("battle-explanation");
  if (!explanation) {
    explanation = document.createElement("div");
    explanation.id = "battle-explanation";
    document
      .getElementById("status-bubble")
      .insertAdjacentElement("afterend", explanation);
  }
  return explanation;
}

function showBattleExplanationTie(pCard, cCard, stat, totals) {
  const explanation = getOrCreateBattleExplanationEl();
  const isDoubleRare = pCard.isRare && cCard.isRare;
  if (isDoubleRare) {
    explanation.innerHTML = `🤝 TIE — both are<br><span class="rare-text">SUPER TRUNFO CARDS</span>`;
    return;
  }
  const { pTotal, cTotal, playerBonus, cpuBonus } = totals;
  let extra = "";
  if (playerBonus || cpuBonus) {
    extra = `<br><span class="battle-stat">${stat}</span> totals: ${pCard.name} <b>${pTotal}</b> vs ${cCard.name} <b>${cTotal}</b> (type advantage +${TYPE_ADVANTAGE_BONUS} from PokéAPI chart).`;
  }
  explanation.innerHTML = `🤝 TIE on <span class="battle-stat">${stat}</span>${extra}`;
}

function showBattleExplanation(winnerCard, loserCard, stat, totals) {
  const explanation = getOrCreateBattleExplanationEl();

  if (winnerCard.isRare && !loserCard.isRare) {
    explanation.innerHTML = `🌟 <span class="battle-winner">${winnerCard.name}</span> wins — <span class="rare-text">SUPER TRUNFO</span>`;
    return;
  }

  const { winnerTotal, loserTotal, winnerBonus, loserBonus } = totals;
  let bonusLine = "";

  if (winnerBonus || loserBonus) {
    const parts = [];
    if (winnerBonus && winnerCard.type && loserCard.type) {
      parts.push(
        `+${TYPE_ADVANTAGE_BONUS} <br> (${winnerCard.type.toUpperCase()} is super-effective vs ${loserCard.type.toUpperCase()})`,
      );
    }
    if (loserBonus && loserCard.type && winnerCard.type) {
      parts.push(
        `+${TYPE_ADVANTAGE_BONUS} for <br> (${loserCard.type.toUpperCase()} is super-effective vs ${winnerCard.type.toUpperCase()})`,
      );
    }
    if (parts.length > 0) {
      bonusLine = `<br>Type bonus: ${parts.join("; ")}.`;
    }
  }
  // Esta linha fecha corretamente a função showBattleExplanation
  explanation.innerHTML = `🏆 <span class="battle-winner">${winnerCard.name}</span> wins on <span class="battle-stat">${stat}</span><br> (${winnerTotal} vs ${loserTotal})${bonusLine}<br><span style="color: yellow;">${loserCard.name}</span> lost the battle.`;
}

// Função para avançar de rodada corrigida
function nextRound() {
  if (playerDeck.length > 0) playerDeck.shift();
  if (cpuDeck.length > 0) cpuDeck.shift();

  currentRound++; // Agora o incremento vai funcionar corretamente

  const explanation = document.getElementById("battle-explanation");
  if (explanation) explanation.innerHTML = "";

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.style.display = "none";

  const playerSlot = document.getElementById("player-card-slot");
  if (playerSlot) playerSlot.style.pointerEvents = "auto";

  const statusBubble = document.getElementById("status-bubble");
  if (statusBubble) statusBubble.innerText = "CHOOSE A STAT";

  renderRound();
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

  // 1. Alerta unificado (removida a duplicata)
  alert(finalMsg);

  // 2. Verifica se o elemento existe antes de alterar o texto
  const statusBubble = document.getElementById("status-bubble");
  if (statusBubble) {
    statusBubble.innerText = "GAME OVER";
  }

  // 3. Reseta os estados e telas do jogo
  resetGame();
  showMenu();
}

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

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("next-btn").addEventListener("click", nextRound);
document.getElementById("menu-btn").addEventListener("click", () => {
  resetGame();
  showMenu();
});

const viewport3D = document.querySelector(".cards-viewport");
let isSwapping = false;

function swapCards3D() {
  if (isSwapping || !viewport3D) return;
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
    isSwapping = false;
  }, 200);
}

document.getElementById("swap-left").addEventListener("click", swapCards3D);
document.getElementById("swap-right").addEventListener("click", swapCards3D);

function setupCardParallax() {
  const prefersFinePointer = window.matchMedia("(hover: hover)").matches;
  if (!prefersFinePointer) return;

  document.querySelectorAll(".pokemon-card").forEach((card) => {
    if (card.dataset.parallaxBound === "1") return;
    card.dataset.parallaxBound = "1";

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * 18;
      const rotateX = (y / rect.height - 0.5) * -18;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      card.style.setProperty("--shine-x", `${-rotateY * 2}px`);
      card.style.setProperty("--shine-y", `${-rotateX * 2}px`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
      card.style.setProperty("--shine-x", "0px");
      card.style.setProperty("--shine-y", "0px");
    });
  });
}
