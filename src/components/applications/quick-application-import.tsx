import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/form-field";
import { displayUiValue } from "@/i18n/presentation";
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
  const zh = language === "zh-CN";
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
            ? zh
              ? "官网"
              : "Official website"
            : undefined,
        },
        profileId,
      );
      if (isDuplicateApplication(applications, record)) {
        setError(
          zh
            ? "相同公司、岗位和投递日期的记录已存在。"
            : "An application with the same company, role and date already exists.",
        );
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
          : zh
            ? "导入失败。"
            : "Import failed.",
      );
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {zh ? "一键导入投递" : "Quick import"}
      </Button>
      <Dialog
        open={open}
        title={zh ? "一键导入投递记录" : "Quick-import application"}
        description={
          zh
            ? "填写公司、岗位、投递日期和状态，即可生成申请记录。"
            : "Create an application record from its essential details."
        }
        onClose={() => setOpen(false)}
      >
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={zh ? "公司" : "Company"}>
              <Input
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder={zh ? "例如：小红书" : "e.g. RED"}
              />
            </Field>
            <Field label={zh ? "岗位" : "Role"}>
              <Input
                required
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder={
                  zh ? "例如：软件开发工程师" : "e.g. Software Engineer"
                }
              />
            </Field>
            <Field label={zh ? "投递日期" : "Applied date"}>
              <Input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field label={zh ? "当前状态" : "Current status"}>
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
          <Field label={zh ? "官网链接（可选）" : "Official URL (optional)"}>
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
              {zh ? "取消" : "Cancel"}
            </Button>
            <Button type="submit">{zh ? "生成记录" : "Create record"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
