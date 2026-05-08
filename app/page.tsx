"use client";

import { useEffect, useState } from "react";

type Tool = {
  name: string;
  plan: string;
  spend: number;
  seats: number;
};

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState("coding");

  const toolOptions = [
    "ChatGPT",
    "Claude",
    "GitHub Copilot",
    "Cursor",
    "Gemini",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("auditData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTools(parsed.tools || []);
      setTeamSize(parsed.teamSize || 1);
      setUseCase(parsed.useCase || "coding");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "auditData",
      JSON.stringify({ tools, teamSize, useCase }),
    );
  }, [tools, teamSize, useCase]);

  const addTool = () => {
    setTools([...tools, { name: "", plan: "", spend: 0, seats: 1 }]);
  };

  const updateTool = (index: number, key: string, value: any) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], [key]: value };
    setTools(updated);
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Spend Audit</h1>

      <button onClick={addTool} className="bg-black text-white px-4 py-2 mb-4">
        Add Tool
      </button>

      {tools.map((tool, i) => (
        <div key={i} className="border p-4 mb-3">
          <select
            value={tool.name}
            onChange={(e) => updateTool(i, "name", e.target.value)}
            className="border p-2 w-full mb-2"
          >
            <option value="">Select Tool</option>
            {toolOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <input
            placeholder="Plan"
            value={tool.plan}
            onChange={(e) => updateTool(i, "plan", e.target.value)}
            className="border p-2 w-full mb-2"
          />

          <input
            type="number"
            placeholder="Monthly Spend"
            value={tool.spend}
            onChange={(e) => updateTool(i, "spend", Number(e.target.value))}
            className="border p-2 w-full mb-2"
          />

          <input
            type="number"
            placeholder="Seats"
            value={tool.seats}
            onChange={(e) => updateTool(i, "seats", Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>
      ))}

      <div className="border p-4 mt-4">
        <input
          type="number"
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
          className="border p-2 w-full mb-2"
          placeholder="Team Size"
        />

        <select
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="coding">Coding</option>
          <option value="writing">Writing</option>
          <option value="research">Research</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
    </div>
  );
}
