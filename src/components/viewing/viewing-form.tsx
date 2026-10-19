"use client";

import { CircleCheck } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { submitViewingRequest, type ViewingRequestState } from "@/lib/actions/viewing-request";
import { cn } from "@/lib/cn";
import { formatDayDate, paymentReadinessLabel, timeSlotLabel } from "@/lib/format";
import { viewingRequestLink } from "@/lib/messages";
import { PAYMENT_READINESS, TIME_SLOTS, type Car } from "@/lib/types";
import {
  HONEYPOT_FIELD,
  MAX_DAYS_AHEAD,
  fieldErrors,
  saToday,
  viewingFormToInput,
  viewingRequestSchema,
  type ViewingFieldErrors,
  type ViewingRequestData,
} from "@/lib/validation/viewing-request";

type CarRef = Pick<Car, "id" | "year" | "make" | "model" | "variant" | "stockNumber">;

const initialState: ViewingRequestState = { status: "idle" };

export function ViewingForm({ car }: { car: CarRef }) {
  const [state, formAction, pending] = useActionState(submitViewingRequest, initialState);
  const [clientErrors, setClientErrors] = useState<ViewingFieldErrors>({});
  // The validated values, kept for the success screen's WhatsApp hand-off.
  const [submitted, setSubmitted] = useState<ViewingRequestData | null>(null);

  if (state.status === "success" && submitted) {
    return <ViewingSuccess car={car} data={submitted} stored={state.stored} />;
  }

  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors = { ...serverErrors, ...clientErrors };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Submitting manually (instead of <form action>) stops React from
        // clearing the fields if the server returns an error.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Same zod schema as the server, so people see problems instantly.
        const parsed = viewingRequestSchema.safeParse(viewingFormToInput(formData));
        if (!parsed.success) {
          const errs = fieldErrors(parsed.error);
          setClientErrors(errs);
          const first = Object.keys(errs)[0];
          e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
          return;
        }
        setClientErrors({});
        setSubmitted(parsed.data);
        startTransition(() => formAction(formData));
      }}
      className="space-y-5"
    >
      <input type="hidden" name="carId" value={car.id} />

      {/* Honeypot: hidden from people and screen readers, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" error={errors.name} />
        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="082 123 4567"
          error={errors.phone}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Preferred date"
          name="preferredDate"
          type="date"
          error={errors.preferredDate}
          // Set via ref (not state) so the server render never depends on today's date.
          inputRef={(el) => {
            if (!el) return;
            const today = saToday();
            el.min = today;
            const max = new Date(`${today}T12:00:00Z`);
            max.setUTCDate(max.getUTCDate() + MAX_DAYS_AHEAD);
            el.max = max.toISOString().slice(0, 10);
          }}
        />
        <RadioGroup
          legend="Time of day"
          name="preferredTime"
          options={TIME_SLOTS.map((t) => ({ value: t, label: timeSlotLabel[t] }))}
          error={errors.preferredTime}
          columns={3}
        />
      </div>

      <RadioGroup
        legend="How will you pay?"
        name="paymentReadiness"
        options={PAYMENT_READINESS.map((p) => ({ value: p, label: paymentReadinessLabel[p] }))}
        error={errors.paymentReadiness}
        columns={3}
      />

      <div>
        <label htmlFor="vr-message" className={labelClass}>
          Message <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="vr-message"
          name="message"
          rows={3}
          maxLength={1000}
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={errors.message ? "vr-message-error" : undefined}
          className={cn(inputClass, "py-2")}
        />
        <FieldError id="vr-message-error" message={errors.message} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="agree"
            aria-invalid={Boolean(errors.agree) || undefined}
            aria-describedby={errors.agree ? "vr-agree-error" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-navy-950"
          />
          <span>I understand viewings are by appointment and for serious buyers only.</span>
        </label>
        <FieldError id="vr-agree-error" message={errors.agree} />
      </div>

      {state.status === "error" && (
        <p role="alert" className="rounded-card border border-status-sold/30 bg-white p-3 text-status-sold">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClasses("dark", "lg", "w-full sm:w-auto")}>
        {pending ? "Sending…" : "Request viewing"}
      </button>
    </form>
  );
}

function ViewingSuccess({ car, data, stored }: { car: CarRef; data: ViewingRequestData; stored: boolean }) {
  return (
    <div role="status" className="space-y-4">
      <p className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-wide text-status-available">
        <CircleCheck size={26} aria-hidden="true" /> Request sent
      </p>
      <p className="text-lg">
        Thanks, {data.name.split(" ")[0]}. We&apos;ll be in touch to confirm a time and place for{" "}
        <strong>{formatDayDate(data.preferredDate)}</strong> ({timeSlotLabel[data.preferredTime].toLowerCase()}).
      </p>
      {!stored && (
        <p className="text-sm text-muted">
          Demo mode: this request wasn&apos;t saved. Send it on WhatsApp below.
        </p>
      )}
      <p className="text-muted">Want a quicker answer? Send the same request on WhatsApp.</p>
      <a
        href={viewingRequestLink(car, data)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", "lg")}
      >
        <WhatsAppIcon size={20} /> Also send on WhatsApp
      </a>
    </div>
  );
}

const labelClass = "block text-sm font-semibold text-navy-950";
const inputClass =
  "mt-1 block min-h-11 w-full rounded-card border border-line bg-white px-3 text-base text-ink aria-[invalid=true]:border-status-sold";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-semibold text-status-sold">
      {message}
    </p>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

function TextField({ label, name, error, inputRef, ...props }: TextFieldProps) {
  const id = `vr-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

interface RadioGroupProps {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string;
  columns: 2 | 3;
}

/** Big tappable radio "chips" instead of a dropdown: quicker on a phone. */
function RadioGroup({ legend, name, options, error, columns }: RadioGroupProps) {
  const errorId = `vr-${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={labelClass}>{legend}</legend>
      <div className={cn("mt-1 grid gap-2", columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-card border bg-white px-3 text-sm font-semibold",
              "has-checked:border-navy-950 has-checked:bg-navy-950 has-checked:text-white",
              "has-focus-visible:outline-3 has-focus-visible:outline-orange-500",
              error ? "border-status-sold" : "border-line",
            )}
          >
            <input type="radio" name={name} value={o.value} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
