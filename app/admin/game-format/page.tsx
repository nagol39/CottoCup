'use client';

import { useState, useEffect } from 'react';

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

export default function AdminGameFormatPage() {
  const [gameFormats, setGameFormats] = useState<GameFormat[]>([]);
  const [rulesSections, setRulesSections] = useState<RulesSection[]>([]);
  const [activeTab, setActiveTab] = useState<'formats' | 'rules'>('formats');
  
  // Game Format Form State
  const [formatForm, setFormatForm] = useState({
    id: 0,
    title: '',
    description: '',
    rules: [''],
    display_order: 0
  });
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  
  // Rules Section Form State
  const [rulesForm, setRulesForm] = useState({
    id: 0,
    title: '',
    rules: [''],
    display_order: 0
  });
  const [isEditingRules, setIsEditingRules] = useState(false);

  useEffect(() => {
    fetchGameFormats();
    fetchRulesSections();
  }, []);

  const fetchGameFormats = async () => {
    const res = await fetch('/api/game-formats');
    const data = await res.json();
    setGameFormats(data);
  };

  const fetchRulesSections = async () => {
    const res = await fetch('/api/rules-sections');
    const data = await res.json();
    setRulesSections(data);
  };

  const handleFormatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredRules = formatForm.rules.filter(r => r.trim() !== '');
    
    const method = isEditingFormat ? 'PUT' : 'POST';
    await fetch('/api/game-formats', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formatForm,
        rules: filteredRules
      })
    });
    
    setFormatForm({ id: 0, title: '', description: '', rules: [''], display_order: 0 });
    setIsEditingFormat(false);
    fetchGameFormats();
  };

  const handleRulesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredRules = rulesForm.rules.filter(r => r.trim() !== '');
    
    const method = isEditingRules ? 'PUT' : 'POST';
    await fetch('/api/rules-sections', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rulesForm,
        rules: filteredRules
      })
    });
    
    setRulesForm({ id: 0, title: '', rules: [''], display_order: 0 });
    setIsEditingRules(false);
    fetchRulesSections();
  };

  const handleEditFormat = (format: GameFormat) => {
    setFormatForm(format);
    setIsEditingFormat(true);
  };

  const handleEditRules = (section: RulesSection) => {
    setRulesForm(section);
    setIsEditingRules(true);
  };

  const handleDeleteFormat = async (id: number) => {
    if (confirm('Are you sure you want to delete this game format?')) {
      await fetch(`/api/game-formats?id=${id}`, { method: 'DELETE' });
      fetchGameFormats();
    }
  };

  const handleDeleteRules = async (id: number) => {
    if (confirm('Are you sure you want to delete this rules section?')) {
      await fetch(`/api/rules-sections?id=${id}`, { method: 'DELETE' });
      fetchRulesSections();
    }
  };

  const addFormatRule = () => {
    setFormatForm({ ...formatForm, rules: [...formatForm.rules, ''] });
  };

  const updateFormatRule = (index: number, value: string) => {
    const newRules = [...formatForm.rules];
    newRules[index] = value;
    setFormatForm({ ...formatForm, rules: newRules });
  };

  const removeFormatRule = (index: number) => {
    const newRules = formatForm.rules.filter((_, i) => i !== index);
    setFormatForm({ ...formatForm, rules: newRules });
  };

  const addRuleItem = () => {
    setRulesForm({ ...rulesForm, rules: [...rulesForm.rules, ''] });
  };

  const updateRuleItem = (index: number, value: string) => {
    const newRules = [...rulesForm.rules];
    newRules[index] = value;
    setRulesForm({ ...rulesForm, rules: newRules });
  };

  const removeRuleItem = (index: number) => {
    const newRules = rulesForm.rules.filter((_, i) => i !== index);
    setRulesForm({ ...rulesForm, rules: newRules });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Manage Game Formats & Rules</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('formats')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'formats'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Game Formats
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'rules'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rules Sections
          </button>
        </div>

        {/* Game Formats Tab */}
        {activeTab === 'formats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                {isEditingFormat ? 'Edit Game Format' : 'Add New Game Format'}
              </h2>
              <form onSubmit={handleFormatSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={formatForm.title}
                    onChange={(e) => setFormatForm({ ...formatForm, title: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Description</label>
                  <textarea
                    value={formatForm.description}
                    onChange={(e) => setFormatForm({ ...formatForm, description: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded px-3 py-2 h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Rules (Bullet Points)</label>
                  {formatForm.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateFormatRule(index, e.target.value)}
                        className="flex-1 border-2 border-gray-300 rounded px-3 py-2"
                        placeholder="Rule text"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormatRule(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFormatRule}
                    className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    + Add Rule
                  </button>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formatForm.display_order}
                    onChange={(e) => setFormatForm({ ...formatForm, display_order: parseInt(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditingFormat ? 'Update' : 'Create'}
                  </button>
                  {isEditingFormat && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormatForm({ id: 0, title: '', description: '', rules: [''], display_order: 0 });
                        setIsEditingFormat(false);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Existing Game Formats</h2>
              <div className="space-y-4">
                {gameFormats.map((format) => (
                  <div key={format.id} className="border-2 border-gray-200 rounded p-4">
                    <h3 className="font-bold text-lg">{format.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{format.description}</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                      {format.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditFormat(format)}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFormat(format.id)}
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rules Sections Tab */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                {isEditingRules ? 'Edit Rules Section' : 'Add New Rules Section'}
              </h2>
              <form onSubmit={handleRulesSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Section Title</label>
                  <input
                    type="text"
                    value={rulesForm.title}
                    onChange={(e) => setRulesForm({ ...rulesForm, title: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Rules (Bullet Points)</label>
                  {rulesForm.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateRuleItem(index, e.target.value)}
                        className="flex-1 border-2 border-gray-300 rounded px-3 py-2"
                        placeholder="Rule text"
                      />
                      <button
                        type="button"
                        onClick={() => removeRuleItem(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRuleItem}
                    className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    + Add Rule
                  </button>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Display Order</label>
                  <input
                    type="number"
                    value={rulesForm.display_order}
                    onChange={(e) => setRulesForm({ ...rulesForm, display_order: parseInt(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditingRules ? 'Update' : 'Create'}
                  </button>
                  {isEditingRules && (
                    <button
                      type="button"
                      onClick={() => {
                        setRulesForm({ id: 0, title: '', rules: [''], display_order: 0 });
                        setIsEditingRules(false);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Existing Rules Sections</h2>
              <div className="space-y-4">
                {rulesSections.map((section) => (
                  <div key={section.id} className="border-2 border-gray-200 rounded p-4">
                    <h3 className="font-bold text-lg">{section.title}</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                      {section.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditRules(section)}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRules(section.id)}
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
