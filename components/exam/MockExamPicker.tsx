"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Template = {
  id: string;
  exam_type: string;
  name: string;
  question_count: number;
  duration_minutes: number;
  pass_percentage: number;
  level: string;
};

const EXAM_TYPES = ["DHA", "MOH", "HAAD", "SCHFS", "OMSB", "NHRA"];

const LEVEL_LABELS: Record<string, string> = {
  FULL_MOCK: "Full Mock Exam",
  HALF_MOCK: "Half-Length Mock",
  QUICK_PRACTICE: "Quick Practice",
};

export default function MockExamPicker({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [starting, setStarting] = useState(false);

  const filteredTemplates = templates.filter((t) => t.exam_type === examType);
  const selectedTemplate = filteredTemplates.find((t) => t.id === selectedTemplateId);

  function handleExamTypeChange(newType: string) {
    setExamType(newType);
    setSelectedTemplateId("");
  }

  async function handleStart() {
    if (!selectedTemplateId) return;
    setStarting(true);
    const formData = new FormData();
    formData.set("templateId", selectedTemplateId);
    const res = await fetch("/mock-exam/start", { method: "POST", body: formData });
    if (res.redirected) {
      router.push(res.url);
    } else {
      setStarting(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-md p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate mb-1.5">Exam</label>
          <select
            value={examType}
            onChange={(e) => handleExamTypeChange(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-white"
          >
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1.5">Format</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-white"
          >
            <option value="">Choose a format...</option>
            {filteredTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {LEVEL_LABELS[t.level] ?? t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTemplate && (
        <div className="bg-mist rounded-sm p-4 mb-6 text-sm">
          <p className="text-ink font-medium mb-1">{selectedTemplate.name}</p>
          <p className="text-slate">
            {selectedTemplate.question_count} questions · {selectedTemplate.duration_minutes} minutes · Pass mark {selectedTemplate.pass_percentage}%
          </p>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!selectedTemplateId || starting}
        className="bg-ink text-paper px-6 py-3 rounded-sm font-medium text-sm disabled:opacity-50 w-full sm:w-auto"
      >
        {starting ? "Starting..." : "Start exam"}
      </button>
    </div>
  );
}
