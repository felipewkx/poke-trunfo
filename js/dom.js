/**
 * dom.js - All HTML/CSS DOM manipulation and UI rendering
 */

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
    const menu = document.getElementById("generation-selection");
    const game = document.querySelector(".game-container");
    if (!menu || !game) return;
    game.classList.remove("screen--active");
    menu.classList.add("screen--active");
    menu.style.display = "flex";
    game.style.display = "none";
}

/**
 * Shows the game container
 */
function showGameContainer() {
    const menu = document.getElementById("generation-selection");
    const game = document.querySelector(".game-container");
    if (!menu || !game) return;
    menu.classList.remove("screen--active");
    menu.style.display = "none";
    game.classList.add("screen--active");
    game.style.display = "flex";
}

/**
 * Updates the score display
 * @param {number} playerScore - Player's score
 * @param {number} cpuScore - CPU's score
 */
function updateScoreDisplay(playerScore, cpuScore) {
    document.getElementById("player-score").innerText = playerScore;
    document.getElementById("cpu-score").innerText = cpuScore;
}

/**
 * Updates the status bubble text
 * @param {string} text - Text to display
 */
function updateStatusBubble(text) {
    document.getElementById("status-bubble").innerText = text;
}

/**
 * Clears the card slots
 */
function clearCardSlots() {
    document.getElementById("player-card-slot").innerHTML = "";
    document.getElementById("cpu-card-slot").innerHTML = "";
}

/**
 * Resets the UI to initial state
 */
function resetUI() {
    updateScoreDisplay(0, 0);
    updateStatusBubble("READY?");

    const explanation = document.getElementById("battle-explanation");
    if (explanation) explanation.remove();

    document.getElementById("start-btn").style.display = "block";
    document.getElementById("start-btn").classList.add("start-btn-pregame");
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("menu-btn").style.display = "none";

    clearCardSlots();
    document.getElementById("player-card-slot").style.pointerEvents = "auto";
    setSwapArrowsInteractive(false);
}

/**
 * Shows the start game UI state
 */
function showStartGameUI() {
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("start-btn").classList.remove("start-btn-pregame");
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("menu-btn").style.display = "block";
    updateStatusBubble("LOADING DECK...");
    setSwapArrowsInteractive(true);
}

/**
 * Shows error state
 */
function showErrorState() {
    updateStatusBubble("CONNECTION ERROR");
    document.getElementById("start-btn").style.display = "block";
    document.getElementById("start-btn").classList.add("start-btn-pregame");
    setSwapArrowsInteractive(false);
}

/**
 * Generates HTML for a stat row
 * @param {Object} pokemon - Pokémon data
 * @param {string} statKey - Stat name (HP, ATTACK, etc.)
 * @param {string|null} bonusStat - The stat that has a type advantage bonus
 * @returns {string} HTML string
 */
function statRowHtml(pokemon, statKey, bonusStat) {
    const bonus = bonusStat === statKey ? `<span class="type-bonus">+${TYPE_ADVANTAGE_BONUS}</span>` : "";
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

/**
 * Renders a Pokémon card
 * @param {Object} pokemon - Pokémon data
 * @param {string} containerId - ID of the container element
 * @param {boolean} isFaceDown - Whether to show card back
 * @param {Object} options - Additional options (ownerLabel, bonusStat)
 */
function renderCard(pokemon, containerId, isFaceDown, options = {}) {
    const container = document.getElementById(containerId);
    const { ownerLabel = "", bonusStat = null } = options;

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
      <img class="pokemon-sprite" src="${pokemon.image}" alt="${pokemon.name}" />
      <div class="stats-container" id="stats-${containerId}">
        ${statRowHtml(pokemon, "HP", bonusStat)}
        ${statRowHtml(pokemon, "ATTACK", bonusStat)}
        ${statRowHtml(pokemon, "DEFENSE", bonusStat)}
        ${statRowHtml(pokemon, "SPEED", bonusStat)}
      </div>
      ${ownerHtml}
    </div>`;

    queueMicrotask(setupCardParallax);
}

/**
 * Gets or creates the battle explanation element
 * @returns {HTMLElement} The battle explanation element
 */
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
    const { stat, pCard, cCard, playerBonus, cpuBonus, pTotal, cTotal } = comparison;

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
    const { stat, pCard, cCard, playerBonus, cpuBonus, pTotal, cTotal } = comparison;

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
    const winnerNote = typeAdvantageNote(
        winnerCard,
        loserCard.type,
        winnerBonus
    );
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
    const explanation = document.getElementById("battle-explanation");
    if (explanation) {
        explanation.innerHTML = "";
        explanation.style.display = "";
    }
}

/**
 * Shows the next round button
 */
function showNextButton() {
    document.getElementById("next-btn").style.display = "block";
}

/**
 * Hides the next round button
 */
function hideNextButton() {
    document.getElementById("next-btn").style.display = "none";
}

/**
 * Disables player card interaction
 */
function disablePlayerCardInteraction() {
    document.getElementById("player-card-slot").style.pointerEvents = "none";
}

/**
 * Enables player card interaction
 */
function enablePlayerCardInteraction() {
    document.getElementById("player-card-slot").style.pointerEvents = "auto";
}

/**
 * Applies winner/loser styling to cards
 * @param {string} winner - "player", "cpu", or "tie"
 * @param {string} stat - The stat that was compared
 * @param {boolean} pCardIsRare - Whether player's card is rare
 * @param {boolean} cCardIsRare - Whether CPU's card is rare
 */
function applyCardStyling(winner, stat, pCardIsRare, cCardIsRare) {
    const playerCardEl = document.querySelector("#player-card-slot .pokemon-card");
    const cpuCardEl = document.querySelector("#cpu-card-slot .pokemon-card");

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

/**
 * Sets up 3D card swapping
 */
function setupCardSwapping() {
    const viewport3D = document.querySelector(".cards-viewport");
    const swapLeft = document.getElementById("swap-left");
    const swapRight = document.getElementById("swap-right");
    if (!viewport3D || !swapLeft || !swapRight) return;

    let isSwapping = false;

    function swapCards3D() {
        if (isSwapping) return;
        isSwapping = true;
        viewport3D.classList.add("swapping");

        setTimeout(() => {
            const playerSlot = document.getElementById("player-card-slot");
            const cpuSlot = document.getElementById("cpu-card-slot");
            if (!playerSlot || !cpuSlot) {
                isSwapping = false;
                return;
            }
            playerSlot.classList.toggle("slot-front");
            playerSlot.classList.toggle("slot-back");
            cpuSlot.classList.toggle("slot-front");
            cpuSlot.classList.toggle("slot-back");
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
    const openBtn = document.getElementById("open-pokedex-btn");
    const closeBtn = document.getElementById("close-pokedex-btn");
    const backdrop = document.getElementById("pokedex-backdrop");
    const panel = document.getElementById("pokedex-panel");
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
