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
  const [summary, setSummary] = useState("");

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
      JSON.stringify({
        tools,
        teamSize,
        useCase,
      }),
    );
  }, [tools, teamSize, useCase]);

  const addTool = () => {
    setTools([
      ...tools,
      {
        name: "",
        plan: "",
        spend: 0,
        seats: 1,
      },
    ]);
  };

  const removeTool = (index: number) => {
    const updated = tools.filter((_, i) => i !== index);
    setTools(updated);
  };

  const updateTool = (index: number, key: string, value: any) => {
    const updated = [...tools];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    setTools(updated);
  };

  const validTools = tools.filter((t) => t.name && t.plan);

  const totalSavings = results.reduce((acc, curr) => acc + curr.savings, 0);

  const annualSavings = totalSavings * 12;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Spend Audit</h1>

          <p className="text-gray-600">
            Discover unnecessary AI spend and optimize your stack.
          </p>
        </div>

        <button
          onClick={addTool}
          className="bg-black text-white px-4 py-2 rounded-lg mb-6"
        >
          Add Tool
        </button>

        {tools.map((tool, i) => (
          <div
            key={i}
            className="bg-white border rounded-2xl p-5 shadow-sm mb-4"
          >
            <select
              value={tool.name}
              onChange={(e) => updateTool(i, "name", e.target.value)}
              className="border p-3 w-full mb-3 rounded-lg"
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
              className="border p-3 w-full mb-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Monthly Spend"
              value={tool.spend}
              onChange={(e) =>
                updateTool(i, "spend", Math.max(0, Number(e.target.value)))
              }
              className="border p-3 w-full mb-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Seats"
              value={tool.seats}
              onChange={(e) =>
                updateTool(i, "seats", Math.max(1, Number(e.target.value)))
              }
              className="border p-3 w-full mb-4 rounded-lg"
            />

            <button
              onClick={() => removeTool(i)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="bg-white border rounded-2xl p-5 shadow-sm mt-6">
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
            className="border p-3 w-full mb-4 rounded-lg"
            placeholder="Team Size"
          />

          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="border p-3 w-full rounded-lg"
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className="mt-6">
          <button
            onClick={async () => {
              const auditResults = runAudit(validTools, teamSize, useCase);

              setResults(auditResults);

              const response = await fetch("/api/summary", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  results: auditResults,
                }),
              });

              const data = await response.json();

              setSummary(data.summary);
            }}
            disabled={validTools.length === 0}
            className="bg-green-600 text-white px-5 py-3 rounded-lg disabled:opacity-50"
          >
            Run Audit
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border mt-8">
            <p className="text-sm text-gray-500 mb-2">Estimated Savings</p>

            <h2 className="text-5xl font-bold text-green-600">
              ${totalSavings}/mo
            </h2>

            <p className="text-lg text-gray-700 mt-2">
              ${annualSavings} saved annually
            </p>

            {totalSavings >= 500 && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="font-medium">
                  You may qualify for additional infrastructure savings through
                  Credex.
                </p>

                <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg">
                  Book Credex Consultation
                </button>
              </div>
            )}
          </div>
        )}
        {summary && (
          <div className="bg-white border rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-3">
              AI Optimization Summary
            </h2>

            <p className="text-gray-700 leading-7">{summary}</p>
          </div>
        )}
        <div className="mt-8 space-y-4">
          {results.map((result, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{result.tool}</h2>

                <span className="text-green-600 font-bold text-lg">
                  ${result.savings} saved
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  Current Spend:
                  <span className="font-medium ml-2">
                    ${result.currentSpend}
                  </span>
                </p>

                <p>
                  Recommended Plan:
                  <span className="font-medium ml-2">
                    {result.recommendedPlan}
                  </span>
                </p>

                <p>
                  New Estimated Cost:
                  <span className="font-medium ml-2">
                    ${result.recommendedCost}
                  </span>
                </p>
              </div>

              <p className="mt-4 text-gray-600 text-sm">{result.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
