/**
 * api.js - PokéAPI data fetching and formatting
 */

const typeMatchupCache = new Map();

/**
 * Fetches type matchup data from PokéAPI
 * @param {string} typeName - The Pokémon type name
 * @returns {Promise<Set>} Set of type names this type is super effective against
 */
async function fetchTypeSuperEffectiveTargets(typeName) {
    const key = typeName.toLowerCase();
    if (typeMatchupCache.has(key)) return typeMatchupCache.get(key);

    const res = await fetch(`https://pokeapi.co/api/v2/type/${key}/`);
    if (!res.ok) throw new Error(`Type fetch failed: ${key}`);

    const typeData = await res.json();
    const targets = new Set(
        typeData.damage_relations.double_damage_to.map((t) => t.name)
    );

    typeMatchupCache.set(key, targets);
    return targets;
}

/**
 * Fetches a Pokémon from the PokéAPI
 * @param {number} id - The Pokémon ID
 * @returns {Promise<Object>} Formatted Pokémon data
 */
async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error(`Pokémon ${id} fetch failed`);

    const data = await response.json();
    const primaryType = data.types[0].type.name;
    const superEffectiveAgainst = await fetchTypeSuperEffectiveTargets(primaryType);

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
