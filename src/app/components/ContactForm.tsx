"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { portfolio } from "../../data/portfolio";

const CONTACT_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Keep the name under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address, for example name@example.com."),
  subject: z
    .string()
    .trim()
    .min(1, "Enter a subject.")
    .max(200, "Keep the subject under 200 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Enter a message of at least 10 characters.")
    .max(1500, "Keep the message under 1500 characters, or email directly."),
});

type ContactValues = z.infer<typeof CONTACT_SCHEMA>;
type FieldName = keyof ContactValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMPTY_VALUES: ContactValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const FIELD_ORDER: FieldName[] = ["name", "email", "subject", "message"];

const FIELD_LABELS: Record<FieldName, string> = {
  name: "Name",
  email: "Email",
  subject: "Subject",
  message: "Project brief",
};

const inputClasses =
  "w-full border-0 border-b border-[var(--border-strong)] bg-transparent px-0 py-3 text-base text-[var(--text-primary)] " +
  "transition-colors duration-200 placeholder:text-[var(--text-tertiary)] " +
  "focus:border-[var(--accent)] focus:outline-none focus-visible:shadow-[0_1px_0_0_var(--accent)]";

const labelClasses =
  "block text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--text-tertiary)]";

function buildMailtoUrl(values: ContactValues): string {
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    "",
    values.message,
  ].join("\n");

  return `mailto:${portfolio.contact.management}?subject=${encodeURIComponent(
    values.subject,
  )}&body=${encodeURIComponent(body)}`;
}

interface ContactFormProps {
  selectedSubject?: string;
}

export default function ContactForm({ selectedSubject }: ContactFormProps) {
  const fieldIdPrefix = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "draft-opened">("idle");

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedSubject) return;
    setValues((prev) => ({ ...prev, subject: selectedSubject }));
    setErrors((prev) => {
      if (!("subject" in prev)) return prev;
      const next = { ...prev };
      delete next.subject;
      return next;
    });
  }, [selectedSubject]);

  const idFor = (field: FieldName) => `${fieldIdPrefix}-${field}`;
  const errorIdFor = (field: FieldName) => `${fieldIdPrefix}-${field}-error`;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as FieldName;
    setValues((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (candidate: ContactValues): FieldErrors => {
    const parsed = CONTACT_SCHEMA.safeParse(candidate);
    if (parsed.success) {
      return {};
    }
    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as FieldName | undefined;
      if (field && FIELD_ORDER.includes(field) && !next[field]) {
        next[field] = issue.message;
      }
    }
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    window.location.href = buildMailtoUrl(values);
    setStatus("draft-opened");
    requestAnimationFrame(() => successRef.current?.focus());
  };

  const errorFields = FIELD_ORDER.filter((field) => errors[field]);
  const hasErrors = errorFields.length > 0;

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {hasErrors && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          aria-labelledby={`${fieldIdPrefix}-error-summary-title`}
          className="border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger-text)]"
        >
          <p id={`${fieldIdPrefix}-error-summary-title`} className="font-medium">
            There{" "}
            {errorFields.length === 1
              ? "is 1 problem"
              : `are ${errorFields.length} problems`}{" "}
            with this form
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorFields.map((field) => (
              <li key={field}>
                <a href={`#${idFor(field)}`} className="underline hover:opacity-80">
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={idFor("name")} className={labelClasses}>
            {FIELD_LABELS.name}
            <span aria-hidden="true" className="ml-1 text-[var(--danger-text)]">
              *
            </span>
          </label>
          <input
            type="text"
            id={idFor("name")}
            name="name"
            value={values.name}
            onChange={handleChange}
            autoComplete="name"
            required
            placeholder="Your name or agency"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? errorIdFor("name") : undefined}
            className={`${inputClasses} ${
              errors.name
                ? "border-[var(--danger-text)]"
                : "border-[var(--border-subtle)]"
            }`}
          />
          {errors.name && (
            <p id={errorIdFor("name")} className="text-xs text-[var(--danger-text)]">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor={idFor("email")} className={labelClasses}>
            {FIELD_LABELS.email}
            <span aria-hidden="true" className="ml-1 text-[var(--danger-text)]">
              *
            </span>
          </label>
          <input
            type="email"
            id={idFor("email")}
            name="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            inputMode="email"
            required
            placeholder="name@company.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? errorIdFor("email") : undefined}
            className={`${inputClasses} ${
              errors.email
                ? "border-[var(--danger-text)]"
                : "border-[var(--border-subtle)]"
            }`}
          />
          {errors.email && (
            <p id={errorIdFor("email")} className="text-xs text-[var(--danger-text)]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={idFor("subject")} className={labelClasses}>
          {FIELD_LABELS.subject}
          <span aria-hidden="true" className="ml-1 text-[var(--danger-text)]">
            *
          </span>
        </label>
        <input
          type="text"
          id={idFor("subject")}
          name="subject"
          value={values.subject}
          onChange={handleChange}
          required
          placeholder="For example, editorial shoot in Sousse"
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? errorIdFor("subject") : undefined}
          className={`${inputClasses} ${
            errors.subject
              ? "border-[var(--danger-text)]"
              : "border-[var(--border-subtle)]"
          }`}
        />
        {errors.subject && (
          <p id={errorIdFor("subject")} className="text-xs text-[var(--danger-text)]">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={idFor("message")} className={labelClasses}>
          {FIELD_LABELS.message}
          <span aria-hidden="true" className="ml-1 text-[var(--danger-text)]">
            *
          </span>
        </label>
        <textarea
          id={idFor("message")}
          name="message"
          value={values.message}
          onChange={handleChange}
          required
          rows={5}
          maxLength={1500}
          placeholder="Dates, location, usage and creative direction"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errorIdFor("message") : undefined}
          className={`${inputClasses} resize-y ${
            errors.message
              ? "border-[var(--danger-text)]"
              : "border-[var(--border-subtle)]"
          }`}
        />
        {errors.message && (
          <p id={errorIdFor("message")} className="text-xs text-[var(--danger-text)]">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="button-solid">
          Write booking email
        </button>
        <p className="text-xs text-[var(--text-tertiary)]">
          Opens your email app, addressed to {portfolio.contact.management}
        </p>
      </div>

      <div aria-live="polite">
        {status === "draft-opened" && (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 text-xs text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            Your mail app should now be open with the draft ready to send. If
            nothing opened, write directly to {portfolio.contact.management}.
          </div>
        )}
      </div>
    </form>
  );
}
