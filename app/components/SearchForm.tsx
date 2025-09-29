'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchForm({ onSearch }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(input.toLowerCase());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        placeholder="ポケモンを検索..."
        className="border p-2 rounded w-full"
      />
    </form>
  );
}
