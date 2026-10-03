import React from "react";
import { Card } from "./Card.jsx";
import { SurfaceGroup } from "./SurfaceGroup.jsx";
import { cn as cx } from "./cn.js";

/**
 * CatalogCards — image-led browsing; appearance is owned by the selected theme.
 * items: [{id, title, subtitle, image:{src,alt,sourceUrl,photographer,illustrative},
 *          chips?, lead?:{value,unit}, stat?:{value,label}, spare?:[{label,value}]}]
 * Use actual product photos when available. Stock imagery is labelled illustrative.
 * <CatalogCards items={products} onOpen={openProduct} />
 *
 * THE CARD IS A SUMMARY, NOT A RECORD. It answers three questions in the order they are asked —
 * what is it, what does it cost, how much is left — and leaves the rest to the record itself. The
 * title sits at reading size rather than display size: at text-xl a two-word plant name filled the
 * card and outweighed the price. Values truncate instead of wrapping, and the price row is pinned
 * to the bottom, so every card in a row is the same height and their baselines line up.
 */
function CatalogImage({ image, title }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [image?.src]);
  const safe = typeof image?.src === "string" && /^https:\/\//.test(image.src);
  return <div className="relative aspect-[16/10] overflow-hidden bg-ctl-surface">
    {safe && !failed
      ? <img src={image.src} alt={image.alt || title} loading="lazy" decoding="async"
          className="h-full w-full object-cover" onError={() => setFailed(true)} data-kf-media="" data-cx-media="" />
      : <div className="flex h-full items-center justify-center px-5 text-sm text-ctl-muted" role="img" aria-label={`Image unavailable for ${title}`}>Image unavailable</div>}
    {image?.illustrative && <span className="absolute bottom-2 left-2 rounded bg-ctl-surface px-2 py-1 text-xs text-ctl-fg">Illustrative photo</span>}
  </div>;
}

export function CatalogCards({ items = [], onOpen, className = "", renderDetails, renderChips, itemAttributes }) {
  const clickable = typeof onOpen === "function";
  return <SurfaceGroup layout="grid" gap="compact" className={cx("grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] items-stretch", className)} data-kf-catalog="cards">
    {items.map(item => <Card key={item.id} className="h-full"
      interactive={clickable} onClick={clickable ? () => onOpen(item) : undefined}
      {...(typeof itemAttributes === "function" ? itemAttributes(item) : {})}
      // image-led when there are images: a record without one gets no media block, not a 4:3 "Image unavailable" placeholder
      media={item.image?.src ? <CatalogImage image={item.image} title={item.title} /> : undefined}
      footer={/^https:\/\//.test(item.image?.sourceUrl || "")
        ? <a className="text-xs text-ctl-muted underline" href={item.image.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {item.image.photographer ? `Photo by ${item.image.photographer}` : "Photo source"}{item.image.provider === "pexels" ? " on Pexels" : ""}
          </a>
        : undefined}>
      <div className="flex h-full min-w-0 flex-col gap-3">
        {typeof renderChips === "function" && <ChipRow>{renderChips(item)}</ChipRow>}
        <div className="grid min-w-0 gap-1">
          <p className="m-0 truncate text-[15px] font-semibold leading-snug text-ctl-fg" title={item.title}>{item.title}</p>
          {item.subtitle && <p className="m-0 truncate text-xs text-ctl-muted" title={String(item.subtitle)}>{item.subtitle}</p>}
        </div>
        {typeof renderDetails === "function" ? renderDetails(item) : null}
        {item.spare?.length > 0 && <dl className="m-0 grid gap-1">
          {item.spare.map(fact => <div key={fact.label} className="flex items-baseline justify-between gap-2 text-xs">
            <dt className="flex-none text-ctl-muted">{fact.label}</dt>
            <dd className="m-0 min-w-0 truncate text-right font-medium text-ctl-fg" title={String(fact.value)}>{fact.value}</dd>
          </div>)}
        </dl>}
        {(item.lead || item.stat) && <div className="mt-auto flex items-end justify-between gap-3 border-0 border-t border-solid border-ctl-border pt-3">
          {item.lead ? <p className="m-0 flex items-baseline gap-1 min-w-0">
            <span className="text-lg font-semibold leading-none tracking-tight text-ctl-fg tabular-nums">{item.lead.value}</span>
            {item.lead.unit && <span className="truncate text-xs text-ctl-muted">/ {item.lead.unit}</span>}
          </p> : <span aria-hidden="true" />}
          {item.stat && <p className="m-0 flex-none text-xs text-ctl-muted tabular-nums">
            <span className="font-medium text-ctl-fg">{item.stat.value}</span> {String(item.stat.label).toLowerCase()}
          </p>}
        </div>}
      </div>
    </Card>)}
  </SurfaceGroup>;
}

function ChipRow({ children }) {
  const chips = React.Children.toArray(children).filter(Boolean);
  if (!chips.length) return null;
  return <div className="flex flex-wrap items-center gap-2">{chips}</div>;
}
