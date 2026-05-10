"use client";

import { useEffect, useState } from "react";
import { runAudit } from "@/lib/audit";
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
  const [results, setResults] = useState<any[]>([]);
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
      try {
        const parsed = JSON.parse(saved);
        setTools(parsed.tools || []);
        setTeamSize(parsed.teamSize || 1);
        setUseCase(parsed.useCase || "coding");
      } catch {}
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

  const removeTool = (index: number) => {
    const updated = tools.filter((_, i) => i !== index);
    setTools(updated);
  };

  const updateTool = (index: number, key: string, value: any) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], [key]: value };
    setTools(updated);
  };

  const validTools = tools.filter((t) => t.name && t.plan);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Spend Audit</h1>

      <button onClick={addTool} className="bg-black text-white px-4 py-2 mb-4">
        Add Tool
      </button>

      {tools.map((tool, i) => (
        <div key={i} className="border p-4 mb-4 rounded">
          <select
            value={tool.name}
            onChange={(e) =>
              updateTool(i, "spend", Math.max(0, Number(e.target.value)))
            }
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
            onChange={(e) =>
              updateTool(i, "spend", Math.max(0, Number(e.target.value)))
            }
            className="border p-2 w-full mb-2"
          />

          <input
            type="number"
            placeholder="Seats"
            value={tool.seats}
            onChange={(e) =>
              updateTool(i, "seats", Math.max(1, Number(e.target.value)))
            }
            className="border p-2 w-full mb-3"
          />

          <button
            onClick={() => removeTool(i)}
            className="bg-red-500 text-white px-3 py-1"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="border p-4 mt-6 rounded">
        <input
          type="number"
          value={teamSize}
          onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
          className="border p-2 w-full mb-3"
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

      <div className="mt-6">
        <button
          onClick={() => {
            const auditResults = runAudit(validTools, teamSize, useCase);

            setResults(auditResults);
          }}
          disabled={validTools.length === 0}
          className="bg-green-600 text-white px-4 py-2 disabled:opacity-50"
        >
          Run Audit
        </button>
        <div className="mt-8">
          {results.map((result, i) => (
            <div key={i} className="border p-4 mb-3 rounded">
              <h2 className="font-bold text-lg">{result.tool}</h2>

              <p>Current Spend: ${result.currentSpend}</p>

              <p>Recommended: {result.recommendedPlan}</p>

              <p>New Cost: ${result.recommendedCost}</p>

              <p>Savings: ${result.savings}</p>

              <p className="mt-2 text-sm text-gray-600">{result.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
