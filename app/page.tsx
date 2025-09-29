'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';
import SearchForm from '@/app/components/SearchForm';
import { fetchPokemon, Pokemon } from '@/app/lib/fetchPokemon';
import PokemonCard from '@/app/components/PokemonCard';
import { fetchJapaneseNamesBatch, getCachedJapaneseName } from '@/app/lib/fetchJapaneseNames';

async function fetchPokemonList() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
  const data = await res.json();
  return data.results as { name: string; url: string }[];
}

const PAGE_SIZE = 20;

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<{ name: string; url: string }[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // react-paginate は 0 始まり
  const [, setJpVersion] = useState(0); // 軽量な再描画トリガー

  useEffect(() => {
    fetchPokemonList().then(setList);
  }, []);

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

  const filtered = useMemo(() => {
    return list.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [list, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const offset = currentPage * PAGE_SIZE;
  const currentItems = filtered.slice(offset, offset + PAGE_SIZE);

  useEffect(() => {
    const names = currentItems.map((p) => p.name);
    if (names.length === 0) return;
    // グローバルキャッシュ(localStorage/メモリ)で未解決のみを対象
    const uncached = names.filter((n) => !getCachedJapaneseName(n));
    if (uncached.length === 0) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      fetchJapaneseNamesBatch(uncached, { signal: controller.signal })
        .then(() => {
          if (cancelled) return;
          // キャッシュが埋まったので軽量な再描画のみ
          setJpVersion((v) => v + 1);
        })
        .catch((e) => {
          if (e instanceof Error && e.name === 'AbortError') return;
          // noop: フォールバックで英名表示
        });
    }, 200);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [currentItems]);

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pokédex</h1>
      <SearchForm onSearch={handleSearch} />
      {error && <p className="text-red-600">{error}</p>}
      {pokemon && <PokemonCard pokemon={pokemon} />}

      <input
        type="text"
        placeholder="ポケモン一覧を検索..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(0); // 検索変更時は 1 ページ目に戻す
        }}
        className="border rounded p-2 w-full mb-4"
      />

      <ul className="grid grid-cols-2 gap-2">
        {currentItems.map((p, i) => (
          <Link href={`/pokemon/${p.name}`} key={`${p.name}-${i}`}>
            <li className="border rounded p-2 hover:bg-gray-100 transition">
              {getCachedJapaneseName(p.name) ?? p.name}
            </li>
          </Link>
        ))}
      </ul>

      <ReactPaginate
        previousLabel={'←'}
        nextLabel={'→'}
        pageCount={pageCount}
        forcePage={currentPage}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}

        // li には余白・枠は付けない（クリック領域は a 側）
        containerClassName="flex flex-wrap gap-2 justify-center mt-4"
        pageClassName=""
        previousClassName=""
        nextClassName=""
        breakClassName=""

        // クリック領域と見た目は a 側に集約
        pageLinkClassName="inline-flex items-center justify-center px-3 py-2 border rounded
                          hover:bg-gray-100 transition focus-visible:outline-none
                          focus-visible:ring-2 focus-visible:ring-blue-500"
        previousLinkClassName="inline-flex items-center justify-center px-3 py-2 border rounded
                              hover:bg-gray-100 transition focus-visible:outline-none
                              focus-visible:ring-2 focus-visible:ring-blue-500"
        nextLinkClassName="inline-flex items-center justify-center px-3 py-2 border rounded
                          hover:bg-gray-100 transition focus-visible:outline-none
                          focus-visible:ring-2 focus-visible:ring-blue-500"
        breakLinkClassName="px-2 text-gray-500 select-none"

        // アクティブ／無効状態は a に適用する
        activeLinkClassName="bg-blue-600 text-white border-blue-600"
        disabledLinkClassName="opacity-50 cursor-not-allowed pointer-events-none"
    />
    </main>
  );
}