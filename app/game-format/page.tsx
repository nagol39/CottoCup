'use client';

import { useEffect, useState } from 'react';

interface GameFormat {
  id: number;
  title: string;
  description: string;
  rules: string[];
  display_order: number;
}

interface RulesSection {
  id: number;
  title: string;
  rules: string[];
  display_order: number;
}

export default function GameFormatPage() {
  const [gameFormats, setGameFormats] = useState<GameFormat[]>([]);
  const [rulesSections, setRulesSections] = useState<RulesSection[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const formatsRes = await fetch('/api/game-formats');
      const formatsData = await formatsRes.json();
      setGameFormats(formatsData);

      const rulesRes = await fetch('/api/rules-sections');
      const rulesData = await rulesRes.json();
      setRulesSections(rulesData);
    };

    fetchData();
  }, []);

  return (
    <main className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6">Game Format</h1>

      {gameFormats.map((format) => (
        <section key={format.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{format.title}</h2>
          <p className="mb-3">{format.description}</p>
          <ul className="list-disc list-inside text-gray-800">
            {format.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Rules</h2>

        {rulesSections.map((section) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-medium mb-2">{section.title}</h3>
            <ul className="list-disc list-inside text-gray-800">
              {section.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}