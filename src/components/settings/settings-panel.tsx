"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { useCareerOS } from "@/providers/careeros-provider";
import type { ThemePreference } from "@/types/domain";

export function SettingsPanel() {
  const { state, activeWorkspace, setTheme, setDefaultProfile, resetCurrentProfile, resetAll, exportData, importData } = useCareerOS();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function download() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `careeros-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    const result = importData(await file.text());
    setMessage(result.message);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="page-enter">
      <PageHeading eyebrow="Local workspace" title="Settings" description="Control appearance and your browser-stored CareerOS data." />
      {message && <p role="status" className="mb-5 rounded-xl bg-[#dce9df] p-4 text-sm font-bold text-[#245b45]">{message}</p>}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card eyebrow="Appearance" title="Theme preference">
          <label className="block text-sm font-bold">Theme<Select value={state.theme} onChange={(e) => setTheme(e.target.value as ThemePreference)}>{["System", "Light", "Dark"].map((value) => <option key={value}>{value}</option>)}</Select></label>
        </Card>
        <Card eyebrow="Profile behaviour" title="Default profile">
          <label className="block text-sm font-bold">Profile shown by default<Select value={state.defaultProfileId} onChange={(e) => setDefaultProfile(e.target.value)}>{Object.values(state.profiles).map((workspace) => <option key={workspace.profile.id} value={workspace.profile.id}>{workspace.profile.displayName}</option>)}</Select></label>
        </Card>
        <Card eyebrow="Portable backup" title="Export or import local data">
          <p className="text-sm leading-6 text-[#68736c]">Exports include storage version {state.version}, both profile workspaces and all locally saved records.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Button onClick={download}>Export JSON</Button><Button variant="secondary" onClick={() => inputRef.current?.click()}>Import JSON</Button><input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" aria-label="Import CareerOS JSON data" onChange={(e) => void upload(e.target.files?.[0])} /></div>
        </Card>
        <Card eyebrow="Privacy" title="Your data stays in this browser">
          <p className="text-sm leading-6 text-[#68736c]">CareerOS currently uses localStorage. Data is not synced to a server, shared between browsers or protected by an account. Export a backup before clearing browser data.</p>
        </Card>
        <Card className="lg:col-span-2" eyebrow="Destructive actions" title="Reset local data">
          <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => window.confirm(`Reset all local data for ${activeWorkspace.profile.displayName}?`) && resetCurrentProfile()}>Reset current profile</Button><Button variant="danger" onClick={() => window.confirm("Reset all CareerOS local MVP data for both profiles?") && resetAll()}>Reset all local data</Button></div>
        </Card>
      </div>
    </div>
  );
}
