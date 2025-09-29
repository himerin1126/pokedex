import { fetchPokemon, Pokemon } from '@/app/lib/fetchPokemon';

interface PokemonPageProps {
  params: { name: string };
}

// SSR (サーバーコンポーネント)でポケモンデータを取得
export default async function PokemonPage({ params }: PokemonPageProps) {
  const pokemon: Pokemon = await fetchPokemon(params.name);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 capitalize text-center">
        {pokemon.name}
      </h1>

      <div className="flex flex-col items-center space-y-4">
        {/* 画像 */}
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-48 h-48 object-contain"
        />

        {/* 基本情報 */}
        <div className="text-center">
          <p className="text-lg">ID: {pokemon.id}</p>
          <p className="text-lg">
            タイプ: {pokemon.types.join(', ')}
          </p>
        </div>

        {/* ステータス */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-2">ステータス</h2>
          <ul className="space-y-1">
            {pokemon.stats.map((s) => (
              <li key={s.statName} className="flex justify-between">
                <span>{s.statName}</span>
                <span>{s.base_stat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
