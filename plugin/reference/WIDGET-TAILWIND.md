# Theme-aligned Tailwind for assembled widgets

When assembling a custom widget from layout elements and kit primitives, use the starter's existing
Tailwind CSS v4 pipeline through `className`. Read the selected design/theme and the staged
`src/shadcn.css` semantic bridge plus `src/tokens.css`; do not copy their values into page code.

- Tailwind owns internal grid/flex layout, responsive columns/spans, wrapping and sizing. Use
  `min-w-0`, `w-full`, `flex-wrap`, `md:grid-cols-2` and appropriate responsive spans. Ordinary
  `p-*`, `gap-*` and `space-*` inside widgets resolve through the theme's `--spacing`.
- Use semantic classes: `bg-ctl-surface` (surface), `bg-muted` (raised surface), `text-foreground`
  (body), `text-muted-foreground` (secondary), `border-layer-border` (divider), `text-brand-600`
  (emphasis). Use theme chart tokens for charts and kit semantic tones for status. No stock colour
  palettes, literal colours, inline fonts or hand-picked radius/shadow scales.
- Keep the chosen component recipes: `PageHeader` then sibling `PageBody`; compose widget rows
  with `SurfaceGroup` and its `gap` prop. Custom/cardless widgets use `SurfaceCell`; a `Card` or
  `StatTile` already owns its surface. Do not add a competing `gap-*` on SurfaceGroup or override
  kit padding, material backgrounds, radius or elevation. Bare must retain its rule-separated
  material, while Panel/Flat/Spacing retain their own treatment. Controls remain kit controls.
- Write complete literal utility names, including conditional branches such as
  `active ? "text-brand-600" : "text-muted-foreground"`; never interpolate `"bg-" + tone` or
  `"grid-cols-" + count`. For data-driven geometry use an existing component prop or a narrowly
  scoped CSS variable, not runtime-generated class names or a second design system.
- Do not install Tailwind/CDN imports, add a config/reset, copy theme CSS, branch page JSX by
  theme id, or change the selected theme. Tailwind is for creative composition within its theme,
  not replacing authored component recipes with generic boxes.

Before handoff, run the existing build and inspect the assembled widget at narrow and wide widths
in the selected theme. Confirm classes emitted, no clipped content, and no doubled surface inset.
