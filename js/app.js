/**
 * app.js - Main entry point (classic scripts; works on file:// and HTTP)
 */

const ui = window;

const game = new GameState();

function resetGame() {
  game.reset();
  ui.resetUI();
}

async function startGame() {
  game.scores = { player: 0, cpu: 0 };
  game.currentRound = 1;

  ui.updateScoreDisplay(0, 0);
  ui.showStartGameUI();

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
    ui.showErrorState();
  }
}

function renderRound() {
  if (game.isGameOver()) {
    finishGame();
    return;
  }

  game.beginRound();
  updateUI();
  ui.clearBattleExplanation();
  ui.hideNextButton();
  ui.updateStatusBubble(`ROUND ${game.currentRound} - CHOOSE A STAT`);
}

function updateUI() {
  const pCard = game.getPlayerCard();

  ui.enablePlayerCardInteraction();
  ui.renderCard(pCard, "player-card-slot", false, {
    ownerLabel: "YOU",
    bonusStat: null,
    revealStats: false,
    interactive: true,
  });
  ui.renderCard(game.getCpuCard(), "cpu-card-slot", false, {
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
    ui.renderCard(cCard, "cpu-card-slot", false, {
      ownerLabel: "CPU",
      bonusStat: cpuHadAdvantage && statsMatter ? stat : null,
      revealStats: true,
      interactive: false,
    });

    ui.renderCard(pCard, "player-card-slot", false, {
      ownerLabel: "YOU",
      bonusStat: playerHadAdvantage && statsMatter ? stat : null,
      revealStats: true,
      interactive: false,
    });

    if (cCard.isRare) {
      setTimeout(() => alert("⭐ CPU TEM UM SUPER TRUNFO! ⭐"), 100);
    }

    if (winner === "player") {
      ui.showBattleExplanation("player", comparison);
      game.incrementPlayerScore();
      ui.updateStatusBubble("YOU WIN!");
      ui.updateScoreDisplay(game.scores.player, game.scores.cpu);
    } else if (winner === "cpu") {
      ui.showBattleExplanation("cpu", comparison);
      game.incrementCpuScore();
      ui.updateStatusBubble("CPU WINS!");
      ui.updateScoreDisplay(game.scores.player, game.scores.cpu);
    } else {
      ui.showBattleExplanationTie(comparison);
      ui.updateStatusBubble("IT'S A TIE!");
    }

    ui.applyCardStyling(winner, stat, pCard.isRare, cCard.isRare);
  } catch (err) {
    console.error("Error during UI updates:", err);
  } finally {
    ui.showNextButton();
    ui.disablePlayerCardInteraction();
  }
}

function nextRound() {
  if (!game.roundResolved) return;

  game.removeTopCards();
  game.incrementRound();

  ui.clearBattleExplanation();
  ui.hideNextButton();
  ui.enablePlayerCardInteraction();
  ui.updateStatusBubble("CHOOSE A STAT");

  renderRound();
}

function finishGame() {
  let finalMsg;

  if (game.scores.player === 10) {
    finalMsg = "WOW! PERFECT!\nFLAWLESS VICTORY!\nVOCÊ É O MESTRE!";
  } else if (game.scores.player > game.scores.cpu) {
    finalMsg = "YOU WIN!\nMANDOU BEM!";
  } else if (game.scores.cpu > game.scores.player) {
    finalMsg = "YOU LOST!\nPERDEU!";
  } else {
    finalMsg = "EMPATOU!\nIT'S A TIE!";
  }

  alert(finalMsg);
  ui.updateStatusBubble("GAME OVER");
  resetGame();
  ui.showMenu();
}

function selectGeneration(min, max) {
  game.setGeneration(min, max);
  resetGame();
  ui.showGameContainer();
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
      ui.showMenu();
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
    window.setupCardSwapping?.();
    window.setupPokedexControls?.();

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
