export interface Pokemon {
    id: number;
    name: string;
    sprites: { front_default: string };
    types: { type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
  }
  
  export async function fetchPokemon(query: string): Promise<Pokemon> {
    // name か ID をそのままエンドポイントに差し込む
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
    if (!res.ok) throw new Error('ポケモンが見つかりません');
    return res.json();
  }
  