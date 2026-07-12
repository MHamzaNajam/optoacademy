"use client";

import { useState } from "react";
import Papa from "papaparse";

const CHUNK_SIZE = 300;

type UploadResult = {
  insertedCount: number;
  errorCount: number;
  errors: { row: number; reason: string }[];
};

export default function QuestionsUploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResults(null);
    setParseError(null);
    setProcessedRows(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data as any[];
        if (rows.length === 0) {
          setParseError("No rows found in this file.");
          return;
        }
        setTotalRows(rows.length);
        await uploadInChunks(rows);
      },
      error: (err) => {
        setParseError(`Could not read file: ${err.message}`);
      },
    });
  }

  async function uploadInChunks(rows: any[]) {
    setUploading(true);
    let totalInserted = 0;
    let allErrors: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      try {
        const res = await fetch("/api/admin/questions/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: chunk }),
        });

        const data = await res.json();

        if (!res.ok) {
          allErrors.push({ row: i + 1, reason: data.error || "Unknown server error" });
        } else {
          totalInserted += data.insertedCount;
          const offsetErrors = (data.errors || []).map((e: any) => ({
            row: e.row + i,
            reason: e.reason,
          }));
          allErrors = allErrors.concat(offsetErrors);
        }
      } catch (err: any) {
        allErrors.push({ row: i + 1, reason: `Network error: ${err.message}` });
      }

      setProcessedRows(Math.min(i + CHUNK_SIZE, rows.length));
    }

    setResults({
      insertedCount: totalInserted,
      errorCount: allErrors.length,
      errors: allErrors,
    });
    setUploading(false);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink mb-2">Bulk upload questions</h1>
      <p className="text-sm text-slate mb-8">
        Upload a CSV file of questions. Works for 10 questions or 10,000 — large
        files are processed in batches automatically.
      </p>

      <div className="bg-white border border-line rounded-md p-6 mb-6">
        <h2 className="text-sm font-semibold text-ink mb-3">Template rules</h2>
        <ul className="text-xs text-slate space-y-1.5 list-disc list-inside">
          <li><strong>domain_name</strong> must exactly match one of your 9 domains</li>
          <li><strong>option_e</strong> can be left blank for 4-option questions</li>
          <li><strong>correct_option</strong> must be a single letter, A through E</li>
          <li><strong>difficulty</strong> must be EASY, MEDIUM, or HARD</li>
          <li><strong>is_trial</strong> must be TRUE or FALSE</li>
        </ul>
      </div>

      <div className="bg-white border border-line rounded-md p-6">
        <label className="block text-sm font-medium text-ink mb-3">
          Choose a CSV file
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm"
        />

        {fileName && (
          <p className="text-xs text-slate mt-3">Selected: {fileName}</p>
        )}

        {parseError && (
          <p className="text-xs text-[#c0392b] bg-[#c0392b]/5 border border-[#c0392b]/20 rounded-sm px-3 py-2 mt-3">
            {parseError}
          </p>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-mist rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal h-2 transition-all"
                style={{ width: `${(processedRows / totalRows) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate mt-2">
              Processing {processedRows} of {totalRows} rows...
            </p>
          </div>
        )}

        {results && (
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm font-medium text-ink mb-1">
              Upload complete: {results.insertedCount} added, {results.errorCount} skipped
            </p>
            {results.errorCount > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto bg-mist rounded-sm p-3">
                {results.errors.map((e, i) => (
                  <p key={i} className="text-xs text-[#c0392b] mb-1">
                    Row {e.row}: {e.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
