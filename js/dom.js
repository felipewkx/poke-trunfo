/**
 * dom.js - All HTML/CSS DOM manipulation and UI rendering
 */

const menuEl = document.getElementById("generation-selection");
const gameEl = document.querySelector(".game-container");
const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const statusBubbleEl = document.getElementById("status-bubble");
const startBtnEl = document.getElementById("start-btn");
const nextBtnEl = document.getElementById("next-btn");
const menuBtnEl = document.getElementById("menu-btn");
const playerSlotEl = document.getElementById("player-card-slot");
const cpuSlotEl = document.getElementById("cpu-card-slot");
const cardsViewportEl = document.querySelector(".cards-viewport");
const swapLeftEl = document.getElementById("swap-left");
const swapRightEl = document.getElementById("swap-right");
const openPokedexBtnEl = document.getElementById("open-pokedex-btn");
const closePokedexBtnEl = document.getElementById("close-pokedex-btn");
const pokedexBackdropEl = document.getElementById("pokedex-backdrop");
const pokedexPanelEl = document.getElementById("pokedex-panel");

function getBattleExplanationEl() {
  return document.getElementById("battle-explanation");
}

/**
 * Sets the visibility and interactivity of swap arrows
 * @param {boolean} active - Whether arrows should be active
 */
function setSwapArrowsInteractive(active) {
  document.querySelectorAll(".swap-arrow").forEach((btn) => {
    btn.style.opacity = active ? "1" : "0";
    btn.style.pointerEvents = active ? "auto" : "none";
  });
}

/**
 * Shows the generation selection menu
 */
function showMenu() {
  if (!menuEl || !gameEl) return;
  gameEl.classList.remove("screen--active");
  menuEl.classList.add("screen--active");
  menuEl.style.display = "flex";
  gameEl.style.display = "none";
}

/**
 * Shows the game container
 */
function showGameContainer() {
  if (!menuEl || !gameEl) return;
  menuEl.classList.remove("screen--active");
  menuEl.style.display = "none";
  gameEl.classList.add("screen--active");
  gameEl.style.display = "flex";
}

/**
 * Updates the score display
 * @param {number} playerScore - Player's score
 * @param {number} cpuScore - CPU's score
 */
function updateScoreDisplay(playerScore, cpuScore) {
  if (playerScoreEl) playerScoreEl.textContent = playerScore;
  if (cpuScoreEl) cpuScoreEl.textContent = cpuScore;
}

/**
 * Updates the status bubble text
 * @param {string} text - Text to display
 */
function updateStatusBubble(text) {
  if (statusBubbleEl) statusBubbleEl.textContent = text;
}

/**
 * Clears the card slots
 */
function clearCardSlots() {
  if (playerSlotEl) playerSlotEl.replaceChildren();
  if (cpuSlotEl) cpuSlotEl.replaceChildren();
}

/**
 * Resets the UI to initial state
 */
function resetUI() {
  updateScoreDisplay(0, 0);
  updateStatusBubble("READY?");

  const explanation = getBattleExplanationEl();
  if (explanation) {
    explanation.remove();
  }

  if (startBtnEl) {
    startBtnEl.style.display = "block";
    startBtnEl.classList.add("start-btn-pregame");
  }
  if (nextBtnEl) nextBtnEl.style.display = "none";
  if (menuBtnEl) menuBtnEl.style.display = "none";

  clearCardSlots();
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "auto";
  setSwapArrowsInteractive(false);
}

/**
 * Shows the start game UI state
 */
function showStartGameUI() {
  if (startBtnEl) {
    startBtnEl.style.display = "none";
    startBtnEl.classList.remove("start-btn-pregame");
  }
  if (nextBtnEl) nextBtnEl.style.display = "none";
  if (menuBtnEl) menuBtnEl.style.display = "block";
  updateStatusBubble("LOADING DECK...");
  setSwapArrowsInteractive(true);
}

/**
 * Shows error state
 */
function showErrorState() {
  updateStatusBubble("CONNECTION ERROR");
  if (startBtnEl) {
    startBtnEl.style.display = "block";
    startBtnEl.classList.add("start-btn-pregame");
  }
  setSwapArrowsInteractive(false);
}

/**
 * Generates HTML for a stat row
 * @param {Object} pokemon - Pokémon data
 * @param {string} statKey - Stat name (HP, ATTACK, etc.)
 * @param {string|null} bonusStat - The stat that has a type advantage bonus
 * @param {boolean} revealStats - Whether to show the numeric value or a blind placeholder
 * @returns {string} HTML string
 */
function statRowHtml(pokemon, statKey, bonusStat, revealStats) {
  const value = revealStats ? pokemon.stats[statKey] : "?";
  const hiddenClass = revealStats ? "" : " stat-val--hidden";
  const bonus =
    bonusStat === statKey
      ? `<span class="type-bonus">+${TYPE_ADVANTAGE_BONUS}</span>`
      : "";
  return `
    <div class="stat-row" data-stat="${statKey}">
      <span class="stat-row__left">
        <img src="assets/logo.png" alt="" class="pokeball-icon" width="18" height="18" />
        <span>${statKey}</span>
      </span>
      <span class="stat-row__right">
                <span class="stat-val${hiddenClass}">${value}</span>
        ${bonus}
      </span>
    </div>`;
}

/**
 * Renders a Pokémon card
 * @param {Object} pokemon - Pokémon data
 * @param {string} containerId - ID of the container element
 * @param {boolean} isFaceDown - Whether to show card back
 * @param {Object} options - Additional options (ownerLabel, bonusStat, revealStats)
 */
function renderCard(pokemon, containerId, isFaceDown, options = {}) {
  const container = document.getElementById(containerId);
  const {
    ownerLabel = "",
    bonusStat = null,
    revealStats = true,
    interactive = false,
  } = options;

  if (!container) return;

  if (!pokemon) {
    container.innerHTML = "";
    return;
  }

  if (isFaceDown) {
    container.innerHTML = `
      <div class="pokemon-card card-back">
        <div class="card-back__label">POKÉMON</div>
      </div>`;
    setupCardParallax(container);
    return;
  }

  const rareClass = pokemon.isRare ? "rare-card" : "";
  const statStateClass = revealStats ? "" : "card--stats-hidden";
  const interactiveClass = interactive ? "card--interactive" : "";
  const rareBadge = pokemon.isRare
    ? '<div class="rare-badge">RARE</div><div class="super-trunfo-badge">SUPER TRUNFO</div>'
    : "";
  const ownerBadgeClass =
    ownerLabel === "YOU"
      ? "card-owner-badge--you"
      : ownerLabel === "CPU"
        ? "card-owner-badge--cpu"
        : "";
  const nameColor = pokemon.isRare
    ? 'style="color: hotpink;"'
    : 'style="color: var(--poke-yellow);"';

  const typeHtml = `<div class="card-type-line"><span class="card-type-name" aria-label="Element">${pokemon.type.toUpperCase()}</span></div>`;

  container.innerHTML = `
                <div class="pokemon-card ${rareClass} ${statStateClass} ${interactiveClass}">
      ${rareBadge}
      <h2 ${nameColor}>
                <span class="card-name-line">
                    <img src="assets/logo.png" alt="" class="pokeball-icon" width="18" height="18" />
                    <span class="card-owner-badge ${ownerBadgeClass}">${ownerLabel}</span>
                    <span class="pokemon-name">${pokemon.name}</span>
                </span>
                <span class="card-result-tag" aria-hidden="true"></span>
      </h2>
      <img class="pokemon-sprite" src="${pokemon.image}" alt="${pokemon.name}" />
      <div class="stats-container" id="stats-${containerId}">
                ${statRowHtml(pokemon, "HP", bonusStat, revealStats)}
                ${statRowHtml(pokemon, "ATTACK", bonusStat, revealStats)}
                ${statRowHtml(pokemon, "DEFENSE", bonusStat, revealStats)}
                ${statRowHtml(pokemon, "SPEED", bonusStat, revealStats)}
      </div>
            ${typeHtml}
    </div>`;

  setupCardParallax(container);
}

/**
 * Gets or creates the battle explanation element
 * @returns {HTMLElement} The battle explanation element
 */
function getOrCreateBattleExplanationEl() {
  let explanation = getBattleExplanationEl();
  if (!explanation) {
    explanation = document.createElement("div");
    explanation.id = "battle-explanation";
    document
      .getElementById("status-bubble")
      .insertAdjacentElement("afterend", explanation);
  }
  return explanation;
}

/** Replays fade-in so updated round text stays visible */
function revealBattleExplanation(explanation) {
  explanation.classList.remove("battle-explanation--visible");
  void explanation.offsetWidth;
  explanation.classList.add("battle-explanation--visible");
}

/**
 * Formats base + optional type bonus = total for the round summary
 */
function formatStatMath(card, stat, bonus) {
  const base = card.stats[stat];
  const total = base + bonus;
  if (bonus > 0) {
    return `${card.name}: ${base} + ${bonus} = <b>${total}</b>`;
  }
  return `${card.name}: ${base} = <b>${total}</b>`;
}

/**
 * Type advantage note for a single side
 */
function typeAdvantageNote(card, opponentType, bonus) {
  if (!bonus) return "";
  return `<br><span class="battle-type-note">${card.type.toUpperCase()} is super-effective vs ${opponentType.toUpperCase()} (+${TYPE_ADVANTAGE_BONUS})</span>`;
}

/**
 * Shows battle explanation for a tie
 * @param {Object} comparison - Round comparison from playTurn
 */
function showBattleExplanationTie(comparison) {
  const explanation = getOrCreateBattleExplanationEl();
  const { stat, pCard, cCard, playerBonus, cpuBonus, pTotal, cTotal } =
    comparison;

  if (pCard.isRare && cCard.isRare) {
    explanation.innerHTML = `🤝 TIE — both are<br><span class="rare-text">SUPER TRUNFO CARDS</span>`;
    revealBattleExplanation(explanation);
    return;
  }

  const playerLine = formatStatMath(pCard, stat, playerBonus);
  const cpuLine = formatStatMath(cCard, stat, cpuBonus);
  const playerNote = typeAdvantageNote(pCard, cCard.type, playerBonus);
  const cpuNote = typeAdvantageNote(cCard, pCard.type, cpuBonus);

  explanation.innerHTML = `
      🤝 TIE on <span class="battle-stat">${stat}</span><br>
      ${playerLine}${playerNote}<br>
      ${cpuLine}${cpuNote}<br>
      <span class="battle-totals">Final: ${pTotal} vs ${cTotal}</span>`;
  revealBattleExplanation(explanation);
}

/**
 * Shows battle explanation for a winner
 * @param {"player"|"cpu"} winnerSide
 * @param {Object} comparison - Round comparison from playTurn
 */
function showBattleExplanation(winnerSide, comparison) {
  const explanation = getOrCreateBattleExplanationEl();
  const { stat, pCard, cCard, playerBonus, cpuBonus, pTotal, cTotal } =
    comparison;

  const winnerCard = winnerSide === "player" ? pCard : cCard;
  const loserCard = winnerSide === "player" ? cCard : pCard;
  const winnerBonus = winnerSide === "player" ? playerBonus : cpuBonus;
  const loserBonus = winnerSide === "player" ? cpuBonus : playerBonus;
  const winnerTotal = winnerSide === "player" ? pTotal : cTotal;
  const loserTotal = winnerSide === "player" ? cTotal : pTotal;

  if (winnerCard.isRare && !loserCard.isRare) {
    explanation.innerHTML = `🌟 <span class="battle-winner">${winnerCard.name}</span> wins — <span class="rare-text">SUPER TRUNFO</span>`;
    revealBattleExplanation(explanation);
    return;
  }

  const winnerLine = formatStatMath(winnerCard, stat, winnerBonus);
  const loserLine = formatStatMath(loserCard, stat, loserBonus);
  const winnerNote = typeAdvantageNote(winnerCard, loserCard.type, winnerBonus);
  const loserNote = typeAdvantageNote(loserCard, winnerCard.type, loserBonus);

  explanation.innerHTML = `
      🏆 <span class="battle-winner">${winnerCard.name}</span> wins on <span class="battle-stat">${stat}</span><br>
      ${winnerLine}${winnerNote}<br>
      ${loserLine}${loserNote}<br>
      <span class="battle-totals">Final: ${winnerTotal} vs ${loserTotal}</span><br>
      <span class="battle-loser-note">${loserCard.name} lost the battle.</span>`;
  revealBattleExplanation(explanation);
}

/**
 * Clears the battle explanation
 */
function clearBattleExplanation() {
  const explanation = getBattleExplanationEl();
  if (explanation) {
    explanation.innerHTML = "";
    explanation.style.display = "";
  }
}

/**
 * Shows the next round button
 */
function showNextButton() {
  if (nextBtnEl) nextBtnEl.style.display = "block";
}

/**
 * Hides the next round button
 */
function hideNextButton() {
  if (nextBtnEl) nextBtnEl.style.display = "none";
}

/**
 * Disables player card interaction
 */
function disablePlayerCardInteraction() {
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "none";
}

/**
 * Enables player card interaction
 */
function enablePlayerCardInteraction() {
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "auto";
}

/**
 * Applies winner/loser styling to cards
 * @param {string} winner - "player", "cpu", or "tie"
 * @param {string} stat - The stat that was compared
 * @param {boolean} pCardIsRare - Whether player's card is rare
 * @param {boolean} cCardIsRare - Whether CPU's card is rare
 */
function applyCardStyling(winner, stat, pCardIsRare, cCardIsRare) {
  const playerCardEl = playerSlotEl?.querySelector(".pokemon-card");
  const cpuCardEl = cpuSlotEl?.querySelector(".pokemon-card");

  if (!playerCardEl || !cpuCardEl) return;

  if (winner === "player") {
    playerCardEl.classList.add("winner-card");
    cpuCardEl.classList.add("loser-card");

    if (!pCardIsRare && stat) {
      const row = playerCardEl.querySelector(`.stat-row[data-stat="${stat}"]`);
      if (row) row.classList.add("winner-stat");
    }
    if (!cCardIsRare && stat) {
      const row = cpuCardEl.querySelector(`.stat-row[data-stat="${stat}"]`);
      if (row) row.classList.add("loser-stat");
    }
  } else if (winner === "cpu") {
    playerCardEl.classList.add("loser-card");
    cpuCardEl.classList.add("winner-card");

    if (!cCardIsRare && stat) {
      const row = cpuCardEl.querySelector(`.stat-row[data-stat="${stat}"]`);
      if (row) row.classList.add("winner-stat");
    }
    if (!pCardIsRare && stat) {
      const row = playerCardEl.querySelector(`.stat-row[data-stat="${stat}"]`);
      if (row) row.classList.add("loser-stat");
    }
  }
}

/**
 * Sets up card parallax effect
 */
function setupCardParallax(container = document) {
  const prefersFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  if (!prefersFinePointer) return;

  const cards = container.querySelectorAll(".pokemon-card");
  cards.forEach((card) => {
    if (card.dataset.parallaxBound === "1") return;
    card.dataset.parallaxBound = "1";

    let animationFrame = 0;
    let lastPointer = null;

    function resetCard() {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }

    function scheduleUpdate() {
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        if (!lastPointer) return;

        const rect = card.getBoundingClientRect();
        const x = lastPointer.clientX - rect.left;
        const y = lastPointer.clientY - rect.top;
        const rotateY = (x / rect.width - 0.5) * 18;
        const rotateX = (y / rect.height - 0.5) * -18;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
    }

    card.addEventListener("pointermove", (e) => {
      lastPointer = e;
      scheduleUpdate();
    });

    card.addEventListener("pointerleave", () => {
      lastPointer = null;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      resetCard();
    });
  });
}

/**
 * Sets up 3D card swapping
 */
function setupCardSwapping() {
  const viewport3D = cardsViewportEl;
  const swapLeft = swapLeftEl;
  const swapRight = swapRightEl;
  if (!viewport3D || !swapLeft || !swapRight) return;

  let isSwapping = false;

  function swapCards3D() {
    if (isSwapping) return;
    isSwapping = true;
    viewport3D.classList.add("swapping");

    setTimeout(() => {
      if (!playerSlotEl || !cpuSlotEl) {
        isSwapping = false;
        return;
      }
      playerSlotEl.classList.toggle("slot-front");
      playerSlotEl.classList.toggle("slot-back");
      cpuSlotEl.classList.toggle("slot-front");
      cpuSlotEl.classList.toggle("slot-back");
      viewport3D.classList.remove("swapping");
      isSwapping = false;
    }, 200);
  }

  swapLeft.addEventListener("click", swapCards3D);
  swapRight.addEventListener("click", swapCards3D);
}

/**
 * Sets up Pokédex panel controls
 */
function setupPokedexControls() {
  const openBtn = openPokedexBtnEl;
  const closeBtn = closePokedexBtnEl;
  const backdrop = pokedexBackdropEl;
  const panel = pokedexPanelEl;
  if (!openBtn || !closeBtn || !backdrop || !panel) return;

  function setPokedexOpen(open) {
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

  openBtn.addEventListener("click", () => setPokedexOpen(true));
  closeBtn.addEventListener("click", () => setPokedexOpen(false));
  backdrop.addEventListener("click", () => setPokedexOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!panel.classList.contains("hidden")) {
      setPokedexOpen(false);
    }
  });
}
