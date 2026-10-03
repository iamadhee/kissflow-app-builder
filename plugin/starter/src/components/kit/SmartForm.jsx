import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Textarea } from "./Textarea.jsx";

// A form that says what is wrong, next to the thing that is wrong, before it submits.
//
// The hand-rolled alternative the generator writes is a pile of useState plus an onSubmit that
// alert()s the first problem it finds. That form tells you about the second error only after you fix
// the first, loses everything on a failed submit, and validates nothing the eye cannot see.
//
// FormCard/ItemForm remain the right choice for a Kissflow MODEL — they render the real fields with
// the real permissions and post through the SDK. This is for everything that is not a model record:
// a filter panel, a bulk-action dialog, a settings pane, a step in a wizard.

/** Build a zod schema from the field list, so callers describe fields once rather than twice. */
function schemaFor(fields) {
  const shape = {};
  for (const f of fields) {
    let v = f.type === "number" ? z.coerce.number() : z.string();
    if (f.type === "email") v = z.string().email("Enter a valid email address");
    if (f.type === "number") {
      if (f.min != null) v = v.min(f.min, `Must be at least ${f.min}`);
      if (f.max != null) v = v.max(f.max, `Must be at most ${f.max}`);
    }
    // `required` has to be applied BEFORE optional() or an empty string slips through as valid
    if (f.required) v = f.type === "number" ? v : v.min(1, `${f.label || f.name} is required`);
    else v = v.optional().or(z.literal(""));
    shape[f.name] = v;
  }
  return z.object(shape);
}

/**
 * fields: [{ name, label, type?: text|number|email|textarea|select, required?, options?: [{value,label}], placeholder?, min?, max? }]
 * onSubmit: (values) => void | Promise — the button disables itself while a promise is in flight.
 */
export function SmartForm({ fields = [], onSubmit, submitLabel = "Save", defaultValues = {}, schema }) {
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema || schemaFor(fields)),
    defaultValues,
  });

  if (!fields.length) return null;

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit?.(v))}
      className="space-y-4"
      data-kf-component="smart-form"
      noValidate
    >
      {fields.map((f) => {
        const label = f.label || f.name;
        const error = errors[f.name]?.message ? String(errors[f.name].message) : undefined;

        if (f.type === "select") {
          return (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field }) => (
                <Select
                  id={f.name}
                  label={f.required ? <>{label}<span className="text-danger-600"> *</span></> : label}
                  options={f.options || []}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={f.placeholder || "Select…"}
                  error={error}
                  invalid={Boolean(error)}
                  disabled={f.disabled}
                />
              )}
            />
          );
        }

        const registration = register(f.name);
        const sharedProps = {
          id: f.name,
          label,
          placeholder: f.placeholder,
          error,
          invalid: Boolean(error),
          required: f.required,
          disabled: f.disabled,
          name: registration.name,
          onBlur: registration.onBlur,
          onChange: registration.onChange,
          innerRef: registration.ref,
        };

        if (f.type === "textarea") {
          return <Textarea key={f.name} {...sharedProps} rows={f.rows || 3} />;
        }

        return (
          <Input
            key={f.name}
            {...sharedProps}
            type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
            min={f.min}
            max={f.max}
          />
        );
      })}

      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

export { z };   // so a caller can pass a bespoke `schema` without its own zod dependency
