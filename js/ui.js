/**
 * ui.js - Clean UI helpers for game bootstrap and rendering
 */

function getEl(id) {
  return document.getElementById(id);
}

function showMenu() {
  const menuEl = getEl("generation-selection");
  const gameEl = document.querySelector(".game-container");
  if (!menuEl || !gameEl) return;
  gameEl.classList.remove("screen--active");
  menuEl.classList.add("screen--active");
  menuEl.style.display = "flex";
  gameEl.style.display = "none";
}

function showGameContainer() {
  const menuEl = getEl("generation-selection");
  const gameEl = document.querySelector(".game-container");
  if (!menuEl || !gameEl) return;
  menuEl.classList.remove("screen--active");
  menuEl.style.display = "none";
  gameEl.classList.add("screen--active");
  gameEl.style.display = "flex";
}

function updateScoreDisplay(playerScore, cpuScore) {
  const playerScoreEl = getEl("player-score");
  const cpuScoreEl = getEl("cpu-score");
  if (playerScoreEl) playerScoreEl.textContent = playerScore;
  if (cpuScoreEl) cpuScoreEl.textContent = cpuScore;
}

function updateStatusBubble(text) {
  const statusBubbleEl = getEl("status-bubble");
  if (statusBubbleEl) statusBubbleEl.textContent = text;
}

function clearCardSlots() {
  const playerSlotEl = getEl("player-card-slot");
  const cpuSlotEl = getEl("cpu-card-slot");
  if (playerSlotEl) playerSlotEl.replaceChildren();
  if (cpuSlotEl) cpuSlotEl.replaceChildren();
}

function getBattleExplanationEl() {
  return getEl("battle-explanation");
}

function resetUI() {
  updateScoreDisplay(0, 0);
  updateStatusBubble("READY?");

  const explanation = getBattleExplanationEl();
  if (explanation) {
    explanation.remove();
  }

  const startBtnEl = getEl("start-btn");
  const nextBtnEl = getEl("next-btn");
  const menuBtnEl = getEl("menu-btn");
  if (startBtnEl) {
    startBtnEl.style.display = "block";
    startBtnEl.classList.add("start-btn-pregame");
  }
  if (nextBtnEl) nextBtnEl.style.display = "none";
  if (menuBtnEl) menuBtnEl.style.display = "none";

  clearCardSlots();
  const playerSlotEl = getEl("player-card-slot");
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "auto";
  setSwapArrowsInteractive(false);
}

function showStartGameUI() {
  const startBtnEl = getEl("start-btn");
  const nextBtnEl = getEl("next-btn");
  const menuBtnEl = getEl("menu-btn");
  if (startBtnEl) {
    startBtnEl.style.display = "none";
    startBtnEl.classList.remove("start-btn-pregame");
  }
  if (nextBtnEl) nextBtnEl.style.display = "none";
  if (menuBtnEl) menuBtnEl.style.display = "block";
  updateStatusBubble("LOADING DECK...");
  setSwapArrowsInteractive(true);
}

function showErrorState() {
  updateStatusBubble("CONNECTION ERROR");
  const startBtnEl = getEl("start-btn");
  if (startBtnEl) {
    startBtnEl.style.display = "block";
    startBtnEl.classList.add("start-btn-pregame");
  }
  setSwapArrowsInteractive(false);
}

function setSwapArrowsInteractive(active) {
  document.querySelectorAll(".swap-arrow").forEach((btn) => {
    btn.style.opacity = active ? "1" : "0";
    btn.style.pointerEvents = active ? "auto" : "none";
  });
}

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

function renderCard(pokemon, containerId, isFaceDown, options = {}) {
  const container = getEl(containerId);
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
  const ownerBadgeClass =
    ownerLabel === "YOU"
      ? "card-owner-badge--you"
      : ownerLabel === "CPU"
        ? "card-owner-badge--cpu"
        : "";
  const rareBadge = pokemon.isRare
    ? '<div class="rare-badge">RARE</div><div class="super-trunfo-badge">SUPER TRUNFO</div>'
    : "";
  const nameColor = pokemon.isRare
    ? 'style="color: hotpink;"'
    : 'style="color: var(--poke-yellow);"';

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
      <div class="card-type-line"><span class="card-type-name" aria-label="Element">${pokemon.type.toUpperCase()}</span></div>
    </div>`;

  setupCardParallax(container);
}

function getOrCreateBattleExplanationEl() {
  let explanation = getBattleExplanationEl();
  if (!explanation) {
    explanation = document.createElement("div");
    explanation.id = "battle-explanation";
    getEl("status-bubble")?.insertAdjacentElement("afterend", explanation);
  }
  return explanation;
}

function revealBattleExplanation(explanation) {
  explanation.classList.remove("battle-explanation--visible");
  void explanation.offsetWidth;
  explanation.classList.add("battle-explanation--visible");
}

function formatStatMath(card, stat, bonus) {
  const base = card.stats[stat];
  const total = base + bonus;
  return bonus > 0
    ? `${card.name}: ${base} + ${bonus} = <b>${total}</b>`
    : `${card.name}: ${base} = <b>${total}</b>`;
}

function typeAdvantageNote(card, opponentType, bonus) {
  if (!bonus) return "";
  return `<br><span class="battle-type-note">${card.type.toUpperCase()} is super-effective vs ${opponentType.toUpperCase()} (+${TYPE_ADVANTAGE_BONUS})</span>`;
}

function showBattleExplanationTie(comparison) {
  const explanation = getOrCreateBattleExplanationEl();
  const { stat, pCard, cCard, playerBonus, cpuBonus, pTotal, cTotal } =
    comparison;

  if (pCard.isRare && cCard.isRare) {
    explanation.innerHTML = `🤝 TIE — both are<br><span class="rare-text">SUPER TRUNFO CARDS</span>`;
    revealBattleExplanation(explanation);
    return;
  }

  explanation.innerHTML = `
    🤝 TIE on <span class="battle-stat">${stat}</span><br>
    ${formatStatMath(pCard, stat, playerBonus)}${typeAdvantageNote(pCard, cCard.type, playerBonus)}<br>
    ${formatStatMath(cCard, stat, cpuBonus)}${typeAdvantageNote(cCard, pCard.type, cpuBonus)}<br>
    <span class="battle-totals">Final: ${pTotal} vs ${cTotal}</span>`;
  revealBattleExplanation(explanation);
}

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

  explanation.innerHTML = `
    🏆 <span class="battle-winner">${winnerCard.name}</span> wins on <span class="battle-stat">${stat}</span><br>
    ${formatStatMath(winnerCard, stat, winnerBonus)}${typeAdvantageNote(winnerCard, loserCard.type, winnerBonus)}<br>
    ${formatStatMath(loserCard, stat, loserBonus)}${typeAdvantageNote(loserCard, winnerCard.type, loserBonus)}<br>
    <span class="battle-totals">Final: ${winnerTotal} vs ${loserTotal}</span><br>
    <span class="battle-loser-note">${loserCard.name} lost the battle.</span>`;
  revealBattleExplanation(explanation);
}

function clearBattleExplanation() {
  const explanation = getBattleExplanationEl();
  if (explanation) {
    explanation.innerHTML = "";
    explanation.style.display = "";
  }
}

function showNextButton() {
  const nextBtnEl = getEl("next-btn");
  if (nextBtnEl) nextBtnEl.style.display = "block";
}

function hideNextButton() {
  const nextBtnEl = getEl("next-btn");
  if (nextBtnEl) nextBtnEl.style.display = "none";
}

function disablePlayerCardInteraction() {
  const playerSlotEl = getEl("player-card-slot");
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "none";
}

function enablePlayerCardInteraction() {
  const playerSlotEl = getEl("player-card-slot");
  if (playerSlotEl) playerSlotEl.style.pointerEvents = "auto";
}

function applyCardStyling(winner, stat, pCardIsRare, cCardIsRare) {
  const playerSlotEl = getEl("player-card-slot");
  const cpuSlotEl = getEl("cpu-card-slot");
  const playerCardEl = playerSlotEl?.querySelector(".pokemon-card");
  const cpuCardEl = cpuSlotEl?.querySelector(".pokemon-card");
  if (!playerCardEl || !cpuCardEl) return;

  if (winner === "player") {
    playerCardEl.classList.add("winner-card");
    cpuCardEl.classList.add("loser-card");
    if (!pCardIsRare && stat)
      playerCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("winner-stat");
    if (!cCardIsRare && stat)
      cpuCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("loser-stat");
  } else if (winner === "cpu") {
    playerCardEl.classList.add("loser-card");
    cpuCardEl.classList.add("winner-card");
    if (!cCardIsRare && stat)
      cpuCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("winner-stat");
    if (!pCardIsRare && stat)
      playerCardEl
        .querySelector(`.stat-row[data-stat="${stat}"]`)
        ?.classList.add("loser-stat");
  }
}

function setupCardParallax() {
  return;
}

function setupCardSwapping() {
  const viewport3D = document.querySelector(".cards-viewport");
  const swapLeft = getEl("swap-left");
  const swapRight = getEl("swap-right");
  if (!viewport3D || !swapLeft || !swapRight) return;

  let isSwapping = false;
  function swapCards3D() {
    if (isSwapping) return;
    isSwapping = true;
    viewport3D.classList.add("swapping");
    setTimeout(() => {
      const playerSlotEl = getEl("player-card-slot");
      const cpuSlotEl = getEl("cpu-card-slot");
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

function setupPokedexControls() {
  const openBtn = getEl("open-pokedex-btn");
  const closeBtn = getEl("close-pokedex-btn");
  const backdrop = getEl("pokedex-backdrop");
  const panel = getEl("pokedex-panel");
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
    if (e.key === "Escape" && !panel.classList.contains("hidden")) {
      setPokedexOpen(false);
    }
  });
}

window.setSwapArrowsInteractive = setSwapArrowsInteractive;
window.showMenu = showMenu;
window.showGameContainer = showGameContainer;
window.updateScoreDisplay = updateScoreDisplay;
window.updateStatusBubble = updateStatusBubble;
window.clearCardSlots = clearCardSlots;
window.resetUI = resetUI;
window.showStartGameUI = showStartGameUI;
window.showErrorState = showErrorState;
window.renderCard = renderCard;
window.clearBattleExplanation = clearBattleExplanation;
window.showNextButton = showNextButton;
window.hideNextButton = hideNextButton;
window.disablePlayerCardInteraction = disablePlayerCardInteraction;
window.enablePlayerCardInteraction = enablePlayerCardInteraction;
window.applyCardStyling = applyCardStyling;
window.setupCardSwapping = setupCardSwapping;
window.setupPokedexControls = setupPokedexControls;
