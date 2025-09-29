export interface Pokemon {
id: number;
name: string; // 日本語名に変換
sprites: { front_default: string };
types: string[]; // 日本語タイプ名に変換
stats: { base_stat: number; statName: string }[]; // statName も日本語に変換
}

interface PokeAPIName {
language: { name: string };
name: string;
}

interface PokeAPIType {
type: { url: string; name: string };
}

interface PokeAPIStat {
stat: { url: string; name: string };
base_stat: number;
}

interface PokeAPISpecies {
names: PokeAPIName[];
}

interface PokeAPITypeData {
names: PokeAPIName[];
}

interface PokeAPIStatData {
names: PokeAPIName[];
}

export async function fetchPokemon(query: string): Promise<Pokemon> {
const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
if (!res.ok) throw new Error('ポケモンが見つかりません');

const data = await res.json();

// 日本語名取得 (species)
const speciesRes = await fetch(data.species.url);
const speciesData: PokeAPISpecies = await speciesRes.json();
const jpNameEntry = speciesData.names.find((n: PokeAPIName) => n.language.name === 'ja-Hrkt');
const name = jpNameEntry?.name ?? data.name;

// 日本語タイプ名
const types = await Promise.all(
data.types.map(async (t: PokeAPIType) => {
const typeRes = await fetch(t.type.url);
const typeData: PokeAPITypeData = await typeRes.json();
const jpTypeEntry = typeData.names.find((n: PokeAPIName) => n.language.name === 'ja-Hrkt');
return jpTypeEntry?.name ?? t.type.name;
})
);

// 日本語ステータス名
const stats = await Promise.all(
data.stats.map(async (s: PokeAPIStat) => {
const statRes = await fetch(s.stat.url);
const statData: PokeAPIStatData = await statRes.json();
const jpStatEntry = statData.names.find((n: PokeAPIName) => n.language.name === 'ja-Hrkt');
return {
base_stat: s.base_stat,
statName: jpStatEntry?.name ?? s.stat.name
};
})
);

return {
id: data.id,
name,
sprites: data.sprites,
types,
stats
};
}
