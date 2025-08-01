export interface Pokemon {
id: number;
name: string; // 日本語名に変換
sprites: { front_default: string };
types: string[]; // 日本語タイプ名に変換
stats: { base_stat: number; statName: string }[]; // statName も日本語に変換
}

export async function fetchPokemon(query: string): Promise<Pokemon> {
const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
if (!res.ok) throw new Error('ポケモンが見つかりません');

const data = await res.json();

// 日本語名取得 (species)
const speciesRes = await fetch(data.species.url);
const speciesData = await speciesRes.json();
const jpNameEntry = speciesData.names.find((n: any) => n.language.name === 'ja-Hrkt');
const name = jpNameEntry?.name ?? data.name;

// 日本語タイプ名
const types = await Promise.all(
data.types.map(async (t: any) => {
const typeRes = await fetch(t.type.url);
const typeData = await typeRes.json();
const jpTypeEntry = typeData.names.find((n: any) => n.language.name === 'ja-Hrkt');
return jpTypeEntry?.name ?? t.type.name;
})
);

// 日本語ステータス名
const stats = await Promise.all(
data.stats.map(async (s: any) => {
const statRes = await fetch(s.stat.url);
const statData = await statRes.json();
const jpStatEntry = statData.names.find((n: any) => n.language.name === 'ja-Hrkt');
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
