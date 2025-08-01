'use client';
import { FormEvent, useState } from 'react';

interface Props {
  onSearch: (value: string) => void;
}

export default function SearchForm({ onSearch }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };


  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border rounded px-2 py-1 flex-1"
        placeholder="名前かIDを入力 (例: pikachu)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-1 rounded">検索</button>
    </form>
  );
}
