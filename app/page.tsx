'use client';

import { Suspense, useState } from 'react';
import SearchForm from '@/app/components/SearchForm';
import { fetchPokemon, Pokemon } from '@/app/lib/fetchPokemon';
import PokemonCard from '@/app/components/PokemonCard';

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pokédex</h1>
      <SearchForm onSearch={handleSearch} />
      {error && <p className="text-red-600">{error}</p>}
      {pokemon && (
        <Suspense fallback={<p>Loading...</p>}>
          <PokemonCard pokemon={pokemon} />
        </Suspense>
      )}
    </main>
  );
} 