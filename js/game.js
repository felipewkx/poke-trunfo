/**
 * game.js - Game logic, deck management, turn controls, and type advantages
 */

const TOTAL_ROUNDS = 10;
const TYPE_ADVANTAGE_BONUS = 25;

class GameState {
    constructor() {
        this.playerDeck = [];
        this.cpuDeck = [];
        this.scores = { player: 0, cpu: 0 };
        this.currentRound = 0;
        this.selectedGen = { min: 1, max: 151 };
    }

    reset() {
        this.playerDeck = [];
        this.cpuDeck = [];
        this.scores = { player: 0, cpu: 0 };
        this.currentRound = 0;
    }

    setGeneration(min, max) {
        this.selectedGen = { min, max };
    }

    incrementRound() {
        this.currentRound++;
    }

    removeTopCards() {
        if (this.playerDeck.length > 0) this.playerDeck.shift();
        if (this.cpuDeck.length > 0) this.cpuDeck.shift();
    }

    incrementPlayerScore() {
        this.scores.player++;
    }

    incrementCpuScore() {
        this.scores.cpu++;
    }

    getPlayerCard() {
        return this.playerDeck[0];
    }

    getCpuCard() {
        return this.cpuDeck[0];
    }

    isGameOver() {
        if (this.currentRound < 1) return false;
        return this.currentRound > TOTAL_ROUNDS || this.playerDeck.length === 0;
    }
}

/**
 * Computes type advantage bonuses for both players
 * @param {Object} pCard - Player's Pokémon card
 * @param {Object} cCard - CPU's Pokémon card
 * @returns {Object} Bonus information for both players
 */
function computeTypeBonuses(pCard, cCard) {
    const pType = pCard?.type?.toLowerCase();
    const cType = cCard?.type?.toLowerCase();

    const pAdv = pType && cType ? (pCard.superEffectiveAgainst?.has(cType) ?? false) : false;
    const cAdv = pType && cType ? (cCard.superEffectiveAgainst?.has(pType) ?? false) : false;

    return {
        playerBonus: pAdv ? TYPE_ADVANTAGE_BONUS : 0,
        cpuBonus: cAdv ? TYPE_ADVANTAGE_BONUS : 0,
        playerHadAdvantage: pAdv,
        cpuHadAdvantage: cAdv,
    };
}

/**
 * Determines the winner of a round
 * @param {Object} pCard - Player's card
 * @param {Object} cCard - CPU's card
 * @param {string} stat - The stat being compared
 * @param {number} playerBonus - Player's type advantage bonus
 * @param {number} cpuBonus - CPU's type advantage bonus
 * @returns {string} "player", "cpu", or "tie"
 */
function determineWinner(pCard, cCard, stat, playerBonus, cpuBonus) {
    const pTotal = pCard.stats[stat] + playerBonus;
    const cTotal = cCard.stats[stat] + cpuBonus;

    if (pCard.isRare && cCard.isRare) return "tie";
    if (pCard.isRare && !cCard.isRare) return "player";
    if (cCard.isRare && !pCard.isRare) return "cpu";
    if (pTotal > cTotal) return "player";
    if (cTotal > pTotal) return "cpu";
    return "tie";
}

/**
 * Generates a random Pokémon ID within the selected generation
 * @param {Object} selectedGen - Object with min and max properties
 * @returns {number} Random Pokémon ID
 */
function getRandomPokemonId(selectedGen) {
    return Math.floor(Math.random() * (selectedGen.max - selectedGen.min + 1)) + selectedGen.min;
}
