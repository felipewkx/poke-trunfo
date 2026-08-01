/**
 * app.js - Main entry point (classic scripts; works on file:// and HTTP)
 */

const game = new GameState();

function resetGame() {
  game.reset();
  resetUI();
}

async function startGame() {
  game.scores = { player: 0, cpu: 0 };
  game.currentRound = 1;

  updateScoreDisplay(0, 0);
  showStartGameUI();

  try {
    const pIds = Array.from({ length: TOTAL_ROUNDS }, () =>
      getRandomPokemonId(game.selectedGen),
    );
    const cIds = Array.from({ length: TOTAL_ROUNDS }, () =>
      getRandomPokemonId(game.selectedGen),
    );

    const [playerDeck, cpuDeck] = await Promise.all([
      Promise.all(pIds.map((id) => fetchPokemon(id))),
      Promise.all(cIds.map((id) => fetchPokemon(id))),
    ]);

    game.playerDeck = playerDeck;
    game.cpuDeck = cpuDeck;

    renderRound();
  } catch (error) {
    console.error(error);
    showErrorState();
  }
}

function renderRound() {
  if (game.isGameOver()) {
    finishGame();
    return;
  }

  game.beginRound();
  updateUI();
  clearBattleExplanation();
  hideNextButton();
  updateStatusBubble(`ROUND ${game.currentRound} - CHOOSE A STAT`);
}

function updateUI() {
  const pCard = game.getPlayerCard();

  enablePlayerCardInteraction();
  renderCard(pCard, "player-card-slot", false, {
    ownerLabel: "YOU",
    bonusStat: null,
    revealStats: false,
    interactive: true,
  });
  renderCard(game.getCpuCard(), "cpu-card-slot", false, {
    ownerLabel: "CPU",
    bonusStat: null,
    revealStats: false,
    interactive: false,
  });

  if (pCard?.isRare) {
    setTimeout(() => alert("⭐ SUPER TRUNFO! ⭐"), 100);
  }
}

function playTurn(stat) {
  if (!game.canPlayTurn()) return;

  const pCard = game.getPlayerCard();
  const cCard = game.getCpuCard();

  if (!pCard || !cCard || !stat) return;

  game.completeRound();

  const { playerBonus, cpuBonus, playerHadAdvantage, cpuHadAdvantage } =
    computeTypeBonuses(pCard, cCard);

  const pTotal = pCard.stats[stat] + playerBonus;
  const cTotal = cCard.stats[stat] + cpuBonus;

  const winner = determineWinner(pCard, cCard, stat, playerBonus, cpuBonus);
  const statsMatter = !pCard.isRare && !cCard.isRare;

  const comparison = {
    stat,
    pCard,
    cCard,
    playerBonus,
    cpuBonus,
    pTotal,
    cTotal,
  };

  try {
    renderCard(cCard, "cpu-card-slot", false, {
      ownerLabel: "CPU",
      bonusStat: cpuHadAdvantage && statsMatter ? stat : null,
      revealStats: true,
      interactive: false,
    });

    renderCard(pCard, "player-card-slot", false, {
      ownerLabel: "YOU",
      bonusStat: playerHadAdvantage && statsMatter ? stat : null,
      revealStats: true,
      interactive: false,
    });

    if (cCard.isRare) {
      setTimeout(() => alert("⭐ CPU TEM UM SUPER TRUNFO! ⭐"), 100);
    }

    if (winner === "player") {
      showBattleExplanation("player", comparison);
      game.incrementPlayerScore();
      updateStatusBubble("YOU WIN!");
      updateScoreDisplay(game.scores.player, game.scores.cpu);
    } else if (winner === "cpu") {
      showBattleExplanation("cpu", comparison);
      game.incrementCpuScore();
      updateStatusBubble("CPU WINS!");
      updateScoreDisplay(game.scores.player, game.scores.cpu);
    } else {
      showBattleExplanationTie(comparison);
      updateStatusBubble("IT'S A TIE!");
    }

    applyCardStyling(winner, stat, pCard.isRare, cCard.isRare);
  } catch (err) {
    console.error("Error during UI updates:", err);
  } finally {
    showNextButton();
    disablePlayerCardInteraction();
  }
}

function nextRound() {
  if (!game.roundResolved) return;

  game.removeTopCards();
  game.incrementRound();

  clearBattleExplanation();
  hideNextButton();
  enablePlayerCardInteraction();
  updateStatusBubble("CHOOSE A STAT");

  renderRound();
}

function finishGame() {
  let finalMsg;

  if (game.scores.player === 10) {
    finalMsg = "WOW, FLAWLESS VICTORY!";
  } else if (game.scores.player > game.scores.cpu) {
    finalMsg = "Congratz! YOU ARE THE MASTER!";
  } else if (game.scores.cpu > game.scores.player) {
    finalMsg = "OOPS, YOU LOST! TRY AGAIN!";
  } else {
    finalMsg = "IT'S A TIE!";
  }

  alert(finalMsg);
  updateStatusBubble("GAME OVER");
  resetGame();
  showMenu();
}

function selectGeneration(min, max) {
  game.setGeneration(min, max);
  resetGame();
  showGameContainer();
}

function setupControls() {
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action], [data-gen-min], .stat-row");
    if (!target) return;

    const genMin = target.getAttribute("data-gen-min");
    if (genMin !== null) {
      const min = Number(genMin);
      const max = Number(target.getAttribute("data-gen-max"));
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        selectGeneration(min, max);
      }
      return;
    }

    const action = target.getAttribute("data-action");
    if (action === "start") {
      startGame();
      return;
    }
    if (action === "next") {
      nextRound();
      return;
    }
    if (action === "menu") {
      resetGame();
      showMenu();
      return;
    }

    const statRow = target.closest(".stat-row");
    if (statRow && statRow.closest("#player-card-slot")) {
      const stat = statRow.getAttribute("data-stat");
      if (stat) playTurn(stat);
    }
  });
}

function showBootError(message) {
  let banner = document.getElementById("boot-error");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "boot-error";
    banner.setAttribute("role", "alert");
    document.body.prepend(banner);
  }
  banner.textContent = message;
}

function init() {
  try {
    const menu = document.getElementById("generation-selection");
    if (!menu) {
      showBootError("Game UI failed to load. Check index.html.");
      return;
    }

    menu.classList.add("screen--active");

    setupControls();
    setupCardSwapping();
    setupPokedexControls();

    window.__pokeTrunfoReady = true;
  } catch (error) {
    console.error(error);
    showBootError(
      "Could not start the game. Open index.html via Live Server or run: python -m http.server",
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
