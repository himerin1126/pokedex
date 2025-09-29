'use client';

import Image from 'next/image';
import { Pokemon } from '@/app/lib/fetchPokemon';
import Link from 'next/link';

interface Props {
  pokemon: Pokemon;
}

export default function PokemonCard({ pokemon }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-4">
        <Image src={pokemon.sprites.front_default} alt={pokemon.name} width={96} height={96} />
        <h2 className="text-xl font-semibold capitalize">{pokemon.name}</h2>
        <span className="text-gray-500">#{pokemon.id}</span>
      </div>

      <div className="mt-4">
        <h3 className="font-medium">タイプ</h3>
        <ul className="flex gap-2">
          {pokemon.types.map((t, index) => (
            <li key={index} className="px-2 py-0.5 bg-gray-100 rounded">
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-medium">ステータス</h3>
        <ul>
          {pokemon.stats.map((s, index) => (
            <li key={index} className="flex justify-between">
              <span>{s.statName}</span>
              <span>{s.base_stat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Link href={`/pokemon/${pokemon.name}`}>
      <div className="border rounded p-4 hover:shadow-lg transition text-center">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} className="mx-auto mb-2" />
        <h3 className="capitalize font-bold">{pokemon.name}</h3>
        <p>ID: {pokemon.id}</p>
      </div>
    </Link>
  );
}