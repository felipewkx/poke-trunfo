/**
 * api.js - PokéAPI data fetching and formatting
 */

const typeMatchupCache = new Map();
const pokemonCache = new Map();

/**
 * Fetches type matchup data from PokéAPI
 * @param {string} typeName - The Pokémon type name
 * @returns {Promise<Set>} Set of type names this type is super effective against
 */
async function fetchTypeSuperEffectiveTargets(typeName) {
    const key = typeName.toLowerCase();
    if (typeMatchupCache.has(key)) return typeMatchupCache.get(key);

    const request = (async () => {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${key}/`);
        if (!res.ok) throw new Error(`Type fetch failed: ${key}`);

        const typeData = await res.json();
        // Validate the API response shape — invalid data triggers the maintenance fallback
        const doubleDamageTo = typeData?.damage_relations?.double_damage_to;
        if (!Array.isArray(doubleDamageTo)) {
            throw new Error(`Type data invalid for: ${key}`);
        }
        return new Set(doubleDamageTo.map((t) => t.name));
    })().catch((error) => {
        typeMatchupCache.delete(key);
        throw error;
    });

    typeMatchupCache.set(key, request);
    return request;
}

/**
 * Fetches a Pokémon from the PokéAPI
 * @param {number} id - The Pokémon ID
 * @returns {Promise<Object>} Formatted Pokémon data
 */
async function fetchPokemon(id) {
    const key = Number(id);
    if (pokemonCache.has(key)) return pokemonCache.get(key);

    const request = (async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
        if (!response.ok) throw new Error(`Pokémon ${key} fetch failed`);

        const data = await response.json();

        // Validate API response shape — invalid/missing fields trigger the maintenance fallback
        if (
            !data ||
            !Array.isArray(data.types) ||
            !data.types[0]?.type?.name ||
            !Array.isArray(data.stats) ||
            data.stats.length < 6 ||
            !data.sprites
        ) {
            throw new Error(`Pokémon ${key} data invalid`);
        }

        const primaryType = data.types[0].type.name;
        const superEffectiveAgainst = await fetchTypeSuperEffectiveTargets(primaryType);

        return {
            id: key,
            name: data.name.toUpperCase(),
            image:
                data.sprites.other?.["official-artwork"]?.front_default ||
                data.sprites.other?.home?.front_default ||
                data.sprites.front_default ||
                "",
            type: primaryType,
            superEffectiveAgainst,
            isRare: [150, 151, 249, 250, 251, 384, 385, 386].includes(key),
            stats: {
                HP: data.stats[0].base_stat,
                ATTACK: data.stats[1].base_stat + data.stats[3].base_stat,
                DEFENSE: data.stats[2].base_stat + data.stats[4].base_stat,
                SPEED: data.stats[5].base_stat,
            },
        };
    })().catch((error) => {
        pokemonCache.delete(key);
        throw error;
    });

    pokemonCache.set(key, request);
    return request;
}
