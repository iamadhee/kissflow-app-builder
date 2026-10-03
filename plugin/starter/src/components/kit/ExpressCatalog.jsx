import React from "react";
import { Badge } from "./Badge.jsx";
import { CatalogCards } from "./CatalogCards.jsx";

// Keep record identity and actions intact; imagery is a field, never a browser-side stock search.
//
// A CATALOGUE CARD IS NOT A SPEC SHEET. Rendering every field as a label/value row gave eight of
// them the same weight, so nothing on the card was the thing you were scanning for; a long value
// ("Trachelospermum asiaticum") wrapped and pushed that one card taller than its neighbours, and the
// row of buttons underneath stopped lining up. The fields are read for the ROLE they play instead —
// what it is, what it costs, how much is left — and the rest is what "View details" is for.
// "42 in stock quantity" is a field name read aloud. The quantifier is already the number beside it,
// so the label keeps only the word that says WHAT is counted.
function availabilityWord(label) {
  const word = String(label || "").toLowerCase()
    .replace(/\s*(quantity|qty|count|level|amount)\s*$/, "")
    .replace(/^\s*(current|total)\s+/, "")
    .trim();
  if (!word) return "available";
  return word === "stock" ? "in stock" : word;
}

export function ExpressCatalog({ rows, fields, section = {}, onOpen, rawCell, displayCell }) {
  const matches = (field, ref) => ref && [field.id, field.label].includes(ref);
  const named = (field, pattern) => pattern.test(`${field.label || ""} ${field.id || ""}`);
  const numeric = (field) => /currency|number|decimal|percent/i.test(field.type || "");

  const imageField = fields.find(f => matches(f, section.imageField))
    || fields.find(f => /image|photo|picture|thumbnail/i.test(f.label || f.id));
  const titleField = fields.find(f => matches(f, section.titleField))
    || fields.find(f => f !== imageField && /name|title|model|product|vehicle/i.test(f.label || f.id))
    || fields.find(f => f !== imageField);

  const rest = fields.filter(f => f !== imageField && f !== titleField);
  const priceField = rest.find(f => numeric(f) && named(f, /price|cost|rate|fee|amount|charge/i));
  const stockField = rest.find(f => numeric(f) && named(f, /stock|quantity|qty|available|on.?hand|inventory|count/i));
  const unitField = rest.find(f => f !== priceField && named(f, /\bunit\b|uom|pack|size|measure/i) && !numeric(f));
  const chipFields = rest.filter(f => f !== unitField
    && /select|choice|status|category|type|tag|class|grade/i.test(`${f.type || ""} ${f.label || f.id}`)).slice(0, 2);
  const claimed = new Set([priceField, stockField, unitField, ...chipFields].filter(Boolean));
  const subtitleField = rest.find(f => !claimed.has(f) && !numeric(f));
  const spare = rest.filter(f => !claimed.has(f) && f !== subtitleField).slice(0, 2);

  const items = rows.map((row, index) => {
    const title = displayCell(row, titleField);
    let value = rawCell(row, imageField);
    if (Array.isArray(value)) value = value[0];
    const image = typeof value === "string" ? { src: value, alt: title } : value && typeof value === "object"
      ? { ...value, src: value.src || value.url, alt: value.alt || title } : undefined;
    // Stock photography is illustrative, even if its author omitted the flag.
    if (image?.src && /^https:\/\/images\.pexels\.com\//i.test(image.src)) image.illustrative = true;
    const cell = (field) => (field ? displayCell(row, field) : undefined);
    const present = (text) => (text != null && text !== "" && text !== "—" ? text : undefined);
    return {
      id: row._id || row.id || index,
      title,
      image,
      row,
      subtitle: present(cell(subtitleField)),
      chips: chipFields.map(cell).filter(x => present(x)),
      lead: priceField ? { value: cell(priceField), unit: present(cell(unitField)) } : undefined,
      stat: stockField ? { value: cell(stockField), label: availabilityWord(stockField.label) } : undefined,
      spare: spare.map(field => ({ label: field.label, value: cell(field) })).filter(x => present(x.value)),
    };
  });

  return <CatalogCards items={items} onOpen={typeof onOpen === "function" ? item => onOpen(item.row) : undefined}
    renderChips={item => item.chips.map((chip, i) => <Badge key={i} tone="neutral">{chip}</Badge>)} />;
}
