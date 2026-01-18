"use client";
import { useState } from "react";

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  timeToDeliver: number;
  difficultyLevel: string;
  tags: string[];
  image: string;
}

export default function CaseStudiesFilter({
  data,
  onFilter,
}: {
  data: CaseStudy[];
  onFilter: (filtered: CaseStudy[]) => void;
}) {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [maxTime, setMaxTime] = useState<number | undefined>(undefined);

  const categories = Array.from(new Set(data.map((d) => d.category)));

  const applyFilters = () => {
    const filtered = data.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      return (
        matchSearch &&
        (!category || item.category === category) &&
        (!difficulty || item.difficultyLevel === difficulty) &&
        (!maxTime || item.timeToDeliver <= maxTime)
      );
    });

    onFilter(filtered);
  };

  return (
    <div className="bg-black border border-gray-700 p-4 rounded-xl mb-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by keywords…"
        className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Category */}
        <select
          className="bg-gray-900 text-white p-2 rounded border border-gray-700"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          className="bg-gray-900 text-white p-2 rounded border border-gray-700"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Time Filter */}
        <input
          type="number"
          placeholder="Max time (minutes)"
          className="bg-gray-900 text-white p-2 rounded border border-gray-700"
          onChange={(e) =>
            setMaxTime(e.target.value ? Number(e.target.value) : undefined)
          }
        />
      </div>

      {/* Button */}
      <button
        onClick={applyFilters}
        className="mt-4 w-full py-2 bg-white text-black font-semibold rounded"
      >
        Apply Filters
      </button>
    </div>
  );
}
