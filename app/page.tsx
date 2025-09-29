'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import SearchForm from '@/app/components/SearchForm';
import { fetchPokemon, Pokemon } from '@/app/lib/fetchPokemon';
import PokemonCard from '@/app/components/PokemonCard';

// ポケモン一覧取得用
async function fetchPokemonList() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
  const data = await res.json();
  return data.results as { name: string; url: string }[];
}

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<{ name: string; url: string }[]>([]);
  const [search, setSearch] = useState('');

  // 初回一覧取得
  useEffect(() => {
    fetchPokemonList().then(setList);
  }, []);

  // 検索フォームから個別ポケモン検索
  const handleSearch = async (query: string) => {
    setError(null);
    try {
      const data = await fetchPokemon(query);
      setPokemon(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPokemon(null);
    }
  };

  // 検索バーによる一覧フィルター
  const filteredList = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pokédex</h1>

      {/* 個別検索フォーム */}
      <SearchForm onSearch={handleSearch} />

      {/* エラー表示 */}
      {error && <p className="text-red-600">{error}</p>}

      {/* 個別検索結果 */}
      {pokemon && (
        <Suspense fallback={<p>Loading...</p>}>
          <PokemonCard pokemon={pokemon} />
        </Suspense>
      )}

      {/* 一覧検索バー */}
      <input
        type="text"
        placeholder="ポケモン一覧を検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {/* ポケモン一覧 */}
      <ul className="grid grid-cols-2 gap-2">
        {filteredList.map((p, i) => (
          <li
            key={i}
            className="border rounded p-2 hover:bg-gray-100 transition"
          >
            <Link href={`/pokemon/${p.name}`}>
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
