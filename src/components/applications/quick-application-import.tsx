import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/form-field";
import { displayUiValue } from "@/i18n/presentation";
import { getTranslation } from "@/i18n";
import {
  createQuickApplication,
  isDuplicateApplication,
} from "@/lib/application-pipeline";
import type {
  AppLocale,
  ApplicationStatus,
  JobApplication,
} from "@/types/domain";

const importStatuses: ApplicationStatus[] = [
  "Applied",
  "OA invited",
  "OA completed",
  "Interview invited",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export function QuickApplicationImport({
  language,
  profileId,
  applications,
  onImport,
}: {
  language: AppLocale;
  profileId: string;
  applications: JobApplication[];
  onImport: (application: JobApplication) => void;
}) {
  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const record = createQuickApplication(
        {
          company,
          role,
          appliedDate: date,
          status,
          sourceUrl: sourceUrl.trim() || undefined,
          sourceLabel: sourceUrl
            ? t("applications.officialWebsite")
            : undefined,
        },
        profileId,
      );
      if (isDuplicateApplication(applications, record)) {
        setError(t("applications.duplicate"));
        return;
      }
      onImport(record);
      setCompany("");
      setRole("");
      setDate(today);
      setStatus("Applied");
      setSourceUrl("");
      setError("");
      setOpen(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : t("applications.importFailed"),
      );
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t("applications.quickImport")}
      </Button>
      <Dialog
        open={open}
        title={t("applications.quickImportTitle")}
        description={t("applications.quickImportDescription")}
        onClose={() => setOpen(false)}
      >
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("applications.company")}>
              <Input
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder={t("applications.companyPlaceholder")}
              />
            </Field>
            <Field label={t("applications.role")}>
              <Input
                required
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder={t("applications.rolePlaceholder")}
              />
            </Field>
            <Field label={t("applications.appliedDate")}>
              <Input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field label={t("applications.currentStatus")}>
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ApplicationStatus)
                }
              >
                {importStatuses.map((value) => (
                  <option key={value} value={value}>
                    {displayUiValue(value, language)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t("applications.officialUrl")}>
            <Input
              type="url"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://..."
            />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("applications.createRecord")}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
