"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { portfolio } from "../../data/portfolio";

/**
 * Accessible contact form.
 *
 * Accessibility contract:
 * - Every control has an explicit <label for> pair (no aria-label overrides).
 * - Fields are validated with the project's existing zod dependency; the form is
 *   rendered with noValidate so our messages (not the browser's) are announced.
 * - Invalid fields expose aria-invalid and aria-describedby -> their error text.
 * - Failed submission moves focus to an error summary (role="alert") that links
 *   to each invalid field.
 *
 * Submission contract: this project has no backend, so the form must NOT claim
 * the message was "sent". A valid submission opens a prefilled mail draft to the
 * agency address and tells the user that mail client is now responsible.
 */

const CONTACT_SCHEMA = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Keep the name under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address, for example name@example.com."),
  subject: z.string().trim().min(1, "Enter a subject.").max(200, "Keep the subject under 200 characters."),
  // A mailto: URL carries the body in the query string, which mail clients
  // truncate past a few KB, so the message is capped well below that.
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
  message: "Message",
};

const inputClasses =
  "w-full border bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] " +
  "transition-colors duration-300 placeholder:text-[var(--text-tertiary)] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]";

const labelClasses =
  "block text-xs uppercase tracking-widest text-[var(--text-tertiary)]";

/** Build a `mailto:` URL so a message can actually reach the agency. */
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

export default function ContactForm() {
  // useId keeps the field ids unique if this form is ever rendered twice.
  const fieldIdPrefix = useId();
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "draft-opened">("idle");

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const idFor = (field: FieldName) => `${fieldIdPrefix}-${field}`;
  const errorIdFor = (field: FieldName) => `${fieldIdPrefix}-${field}-error`;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as FieldName;
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear an existing error as soon as the user edits that field, and drop the
    // summary so it never describes a state that no longer exists.
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
      // Focus after the summary renders; see GOV.UK error-summary pattern.
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    // Hand the message to the user's mail client; nothing is sent by this page.
    window.location.href = buildMailtoUrl(values);
    setStatus("draft-opened");
    requestAnimationFrame(() => successRef.current?.focus());
  };

  const errorFields = FIELD_ORDER.filter((field) => errors[field]);
  const hasErrors = errorFields.length > 0;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="max-w-md space-y-5"
    >
      <p className="text-xs text-[var(--text-tertiary)]">
        All fields are required. Submitting opens a prefilled email in your mail
        app, addressed to {portfolio.contact.management}.
      </p>

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
          placeholder="Your name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? errorIdFor("name") : undefined}
          className={`${inputClasses} ${
            errors.name ? "border-[var(--danger-text)]" : "border-[var(--border-subtle)]"
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
          placeholder="your@email.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorIdFor("email") : undefined}
          className={`${inputClasses} ${
            errors.email ? "border-[var(--danger-text)]" : "border-[var(--border-subtle)]"
          }`}
        />
        {errors.email && (
          <p id={errorIdFor("email")} className="text-xs text-[var(--danger-text)]">
            {errors.email}
          </p>
        )}
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
          placeholder="Subject"
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? errorIdFor("subject") : undefined}
          className={`${inputClasses} ${
            errors.subject ? "border-[var(--danger-text)]" : "border-[var(--border-subtle)]"
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
          placeholder="Your message..."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errorIdFor("message") : undefined}
          className={`${inputClasses} resize-y ${
            errors.message ? "border-[var(--danger-text)]" : "border-[var(--border-subtle)]"
          }`}
        />
        {errors.message && (
          <p id={errorIdFor("message")} className="text-xs text-[var(--danger-text)]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="cinematic-button w-full justify-center py-4"
      >
        Send Message
      </button>

      {/* Live region is always in the DOM so updates are announced reliably. */}
      <div aria-live="polite">
        {status === "draft-opened" && (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="py-2 text-center text-xs text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            Your mail app should now be open with the message ready to send. If
            nothing opened, email {portfolio.contact.management} directly.
          </div>
        )}
      </div>
    </form>
  );
}
