"use client";

import { useEffect, useState } from "react";
import { runAudit } from "@/lib/audit";
import { supabase } from "@/lib/supabase";

type Tool = {
  name: string;
  plan: string;
  spend: number | "";
  seats: number | "";
};

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState("coding");
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

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
        spend: "",
        seats: "",
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

  const validTools = tools
    .filter((t) => t.name && t.plan && t.spend !== "" && t.seats !== "")
    .map((t) => ({
      ...t,
      spend: Number(t.spend),
      seats: Number(t.seats),
    }));

  const totalSavings = results.reduce((acc, curr) => acc + curr.savings, 0);

  const annualSavings = totalSavings * 12;

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight mb-3 text-gray-900">
            AI Spend Audit
          </h1>

          <p className="text-lg text-gray-500">
            Discover unnecessary AI spend and optimize your AI stack.
          </p>
        </div>

        <button
          onClick={addTool}
          className="bg-black text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition mb-8"
        >
          Add Tool
        </button>

        <div className="space-y-5">
          {tools.map((tool, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-200"
            >
              <select
                value={tool.name}
                onChange={(e) => updateTool(i, "name", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black mb-4"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black mb-4"
              />

              <input
                type="number"
                placeholder="Monthly Spend"
                value={tool.spend}
                onChange={(e) => {
                  const value = e.target.value;

                  updateTool(
                    i,
                    "spend",
                    value === "" ? "" : Math.max(0, Number(value)),
                  );
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black mb-4"
              />

              <input
                type="number"
                placeholder="Seats"
                value={tool.seats}
                onChange={(e) => {
                  const value = e.target.value;

                  updateTool(
                    i,
                    "seats",
                    value === "" ? "" : Math.max(1, Number(value)),
                  );
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black mb-5"
              />

              <button
                onClick={() => removeTool(i)}
                className="bg-red-500 text-white px-5 py-3 rounded-xl font-medium hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 mt-8">
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black mb-4"
            placeholder="Team Size"
          />

          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className="mt-8">
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
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            Run Audit
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-200 mt-10">
            <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">
              Estimated Savings
            </p>

            <h2 className="text-6xl font-black text-green-600 tracking-tight">
              ${totalSavings}/mo
            </h2>

            <p className="text-xl text-gray-700 mt-3">
              ${annualSavings} saved annually
            </p>

            {totalSavings >= 500 && (
              <div className="mt-6 p-5 bg-green-50 rounded-2xl border border-green-200">
                <p className="font-semibold text-gray-800">
                  You may qualify for additional infrastructure savings through
                  Credex.
                </p>

                <button className="mt-4 bg-black text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition">
                  Book Credex Consultation
                </button>
              </div>
            )}
          </div>
        )}

        {summary && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI Optimization Summary
            </h2>

            <p className="text-gray-700 text-base leading-8">{summary}</p>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {results.map((result, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {result.tool}
                </h2>

                <span className="text-green-600 font-bold text-2xl">
                  ${result.savings} saved
                </span>
              </div>

              <div className="space-y-2 text-base text-gray-700">
                <p>
                  Current Spend:
                  <span className="font-semibold ml-2">
                    ${result.currentSpend}
                  </span>
                </p>

                <p>
                  Recommended Plan:
                  <span className="font-semibold ml-2">
                    {result.recommendedPlan}
                  </span>
                </p>

                <p>
                  New Estimated Cost:
                  <span className="font-semibold ml-2">
                    ${result.recommendedCost}
                  </span>
                </p>
              </div>

              <p className="mt-5 text-gray-700 text-base leading-7">
                {result.reason}
              </p>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-5">
              Save Your Audit
            </h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black"
              />

              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-black"
              />

              <button
                onClick={async () => {
                  await supabase.from("leads").insert([
                    {
                      email,
                      company,
                      role,
                      team_size: teamSize,
                    },
                  ]);

                  alert("Audit saved successfully");
                }}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Save Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
