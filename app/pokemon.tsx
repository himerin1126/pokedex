// lib/pokemon.ts
export async function fetchPokemonList() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    if (!res.ok) throw new Error("ポケモン一覧の取得に失敗しました");
  
    const data = await res.json();
    return data.results as { name: string; url: string }[];
  }
  