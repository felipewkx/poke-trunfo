function playTurn(stat) {
  // CORRIGIDO: Retornado o [0] para pegar a carta do topo do baralho
  const pCard = playerDeck[0];
  const cCard = cpuDeck[0];
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
    `Round ${currentRound + 1}: ${stat}`,
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
        `+${TYPE_ADVANTAGE_BONUS} for ${winnerCard.name} (${winnerCard.type.toUpperCase()} super-effective vs ${loserCard.type.toUpperCase()})`,
      );
    }
    if (loserBonus && loserCard.type && winnerCard.type) {
      parts.push(
        `+${TYPE_ADVANTAGE_BONUS} for ${loserCard.name} (${loserCard.type.toUpperCase()} super-effective vs ${winnerCard.type.toUpperCase()})`,
      );
    }
    if (parts.length > 0) {
      bonusLine = `<br>Type bonus (PokéAPI): ${parts.join("; ")}.`;
    }
  }

  explanation.innerHTML = `⚔️ <span class="battle-winner">${winnerCard.name}</span> wins on <span class="battle-stat">${stat}</span> (${winnerTotal} vs ${loserTotal})!${bonusLine}`;
}
