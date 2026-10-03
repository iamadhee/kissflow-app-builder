import { useState } from "react";
import { FileText, LayoutDashboard, Search, Settings, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "./kit/AppShell.jsx";
import { Button, ButtonBase } from "./kit/Button.jsx";
import { CommandPalette } from "./kit/CommandPalette.jsx";
import { Drawer } from "./kit/Drawer.jsx";
import { FocusShell } from "./kit/FocusShell.jsx";
import { Menu } from "./kit/Menu.jsx";
import { Modal } from "./kit/Modal.jsx";
import { NavItem } from "./kit/NavItem.jsx";
import { SidebarWordmark } from "./kit/SidebarWordmark.jsx";
import { SplitShell } from "./kit/SplitShell.jsx";
import { ThemeProvider, ThemeToggle } from "./kit/ThemeProvider.jsx";
import { ToastStack } from "./kit/Toast.jsx";
import { CustomEmbed, Toaster, toast } from "./kit/Fx.jsx";
import { ComponentGroup, VariantRow } from "./component-review-layout.jsx";

const SHELL_NAV = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "claims", label: "Claims", icon: <FileText size={16} />, count: 18 },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const NESTED_SHELL_NAV = [
  { type: "group", id: "workspace", label: "Workspace" },
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  {
    id: "claims",
    label: "Claims",
    icon: <FileText size={16} />,
    defaultOpen: true,
    items: [
      { id: "open-claims", label: "Open claims", count: 12 },
      { id: "reviewed-claims", label: "Reviewed", count: 6 },
    ],
  },
  { type: "group", id: "admin", label: "Administration" },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const MENU_ITEMS = [
  { type: "group", label: "Claim actions" },
  { label: "Open record", icon: <FileText size={14} />, shortcut: "↵" },
  { label: "Mark reviewed", checked: true },
  { label: "Include archived", checked: false, keepOpen: true },
  { label: "Assign team", selected: true },
  {
    label: "Move to",
    icon: <LayoutDashboard size={14} />,
    items: [
      { label: "Priority queue" },
      { label: "Standard queue" },
    ],
  },
  { type: "separator" },
  { label: "Archive", danger: true },
  { label: "Unavailable", disabled: true },
];

const COMMAND_GROUPS = [
  { label: "Navigation", items: [{ id: "overview", label: "Go to overview", hint: "Open the workspace summary", shortcut: "G O", icon: <LayoutDashboard size={15} /> }] },
  { label: "Actions", items: [{ id: "search", label: "Search claims", hint: "Find a claim or owner", shortcut: "/", icon: <Search size={15} /> }, { id: "locked", label: "Admin settings", disabled: true, icon: <Settings size={15} /> }] },
];

const TOASTS = [
  { id: "neutral", tone: "neutral", title: "Draft retained", description: "No changes were published." },
  { id: "accent", tone: "accent", title: "Workspace updated", description: "The new view is ready." },
  { id: "success", tone: "success", title: "Claim approved", description: "The owner has been notified." },
  { id: "warning", tone: "warning", title: "SLA approaching", description: "Review this claim within one hour." },
  { id: "info", tone: "info", title: "Review started", description: "Changes are visible to the team." },
  { id: "danger", tone: "danger", title: "Save failed", description: "Try the action again." },
];

function ShellFrame({
  variant,
  chrome = "base",
  design = "classic",
  material = "flat",
  nav = SHELL_NAV,
  active = "claims",
  ...shellProps
}) {
  return (
    <div className="h-72 min-w-[680px] overflow-hidden rounded-xl border border-solid border-layer-border">
      <AppShell
        nav={nav}
        active={active}
        variant={variant}
        chrome={chrome}
        design={design}
        material={material}
        brand={<SidebarWordmark variant={variant === "top" ? "topbar" : "sidebar"} icon={Zap} name="Claims Lab" />}
        topbar={<span className="text-sm text-ctl-fg-muted">Component preview</span>}
        sidebarFooter={<span className="text-sm text-chrome-muted">Dev workspace</span>}
        {...shellProps}
      >
        <div className="grid min-h-full place-items-center p-6 text-sm text-ctl-fg-muted">Content surface</div>
      </AppShell>
    </div>
  );
}

function SplitFrame({ selected = "CL-1042", ...props }) {
  return (
    <div className="h-72 min-w-[640px] overflow-hidden rounded-xl border border-solid border-layer-border">
      <SplitShell
        selected={selected}
        listHeader={<strong>Claims</strong>}
        detailHeader={<div className="p-4 font-semibold">CL-1042</div>}
        list={(
          <div className="grid gap-1 p-2">
            <Button variant="ghost" fullWidth>CL-1042</Button>
            <Button variant="ghost" fullWidth>CL-1043</Button>
          </div>
        )}
        detail={<div className="p-5 text-sm text-ctl-fg-muted">Selected record detail</div>}
        emptyDetail={<span className="text-sm text-ctl-fg-muted">No record selected</span>}
        {...props}
      />
    </div>
  );
}

function ShellComponentGroups() {
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [palette, setPalette] = useState(null);
  const [shellPanelOpen, setShellPanelOpen] = useState(false);

  return (
    <div className="contents">
      <ComponentGroup name="AppShell" description="Navigation, chrome, geometry and material axes in contained live frames.">
        {["sidebar", "top"].map((variant) => (
          <VariantRow key={variant} name={`Navigation · ${variant}`}><div className="overflow-x-auto"><ShellFrame variant={variant} /></div></VariantRow>
        ))}
        <VariantRow name="Navigation · Empty">
          <div className="overflow-x-auto"><ShellFrame variant="sidebar" nav={[]} /></div>
        </VariantRow>
        <VariantRow name="Navigation · Groups / nested / counts">
          <div className="overflow-x-auto"><ShellFrame variant="sidebar" nav={NESTED_SHELL_NAV} active="open-claims" /></div>
        </VariantRow>
        <VariantRow name="Chrome · Base / Accent">
          <div className="grid gap-4 overflow-x-auto">
            {["base", "accent"].map((chrome) => <ShellFrame key={chrome} variant="sidebar" chrome={chrome} />)}
          </div>
        </VariantRow>
        <VariantRow name="Geometry · Classic / Float">
          <div className="grid gap-4 overflow-x-auto">
            {["classic", "float"].map((design) => <ShellFrame key={design} variant="sidebar" design={design} />)}
          </div>
        </VariantRow>
        <VariantRow name="Material · Panel / Flat / Bare / Spacing">
          <div className="grid gap-4 overflow-x-auto">
            {["panel", "flat", "bare", "spacing"].map((material) => <ShellFrame key={material} variant="sidebar" material={material} />)}
          </div>
        </VariantRow>
        <VariantRow name="Sidebar border · Light / Normal / None">
          <div className="grid gap-4 overflow-x-auto">
            {["light", "normal", "none"].map((sidebarBorder) => <ShellFrame key={sidebarBorder} variant="sidebar" material="panel" sidebarBorder={sidebarBorder} />)}
          </div>
        </VariantRow>
        <VariantRow name="Context panel · Controlled">
          <div className="grid gap-3 overflow-x-auto">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={() => setShellPanelOpen((value) => !value)}>
                {shellPanelOpen ? "Close panel" : "Open panel"}
              </Button>
              <span className="text-sm text-ctl-fg-muted">{shellPanelOpen ? "Open" : "Closed"}</span>
            </div>
            <ShellFrame
              variant="sidebar"
              rightPanel={<div className="text-sm text-ctl-fg-muted">Persistent claim context</div>}
              rightPanelTitle="Claim details"
              rightPanelOpen={shellPanelOpen}
              onRightPanelToggle={setShellPanelOpen}
            />
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="CommandPalette" description="Keyboard-first grouped command search.">
        <VariantRow name="Grouped · Icons / hints / shortcuts">
          <Button variant="secondary" onClick={() => setPalette({ groups: COMMAND_GROUPS })}>Open grouped palette</Button>
        </VariantRow>
        <VariantRow name="Footer · Hidden">
          <Button variant="secondary" onClick={() => setPalette({ groups: COMMAND_GROUPS, footer: false, placeholder: "Find an action…" })}>Open without footer</Button>
        </VariantRow>
        <VariantRow name="Results · Empty">
          <Button variant="secondary" onClick={() => setPalette({ groups: [], emptyLabel: "No available commands" })}>Open empty palette</Button>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Drawer" description="Both sides and all three supported widths.">
        <VariantRow name="Sides · Left / Right">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setDrawer({ side: "left", size: "md" })}>Open left</Button>
            <Button variant="secondary" onClick={() => setDrawer({ side: "right", size: "md" })}>Open right</Button>
          </div>
        </VariantRow>
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap gap-3">{["sm", "md", "lg"].map((size) => <Button key={size} variant="secondary" onClick={() => setDrawer({ side: "right", size })}>{size.toUpperCase()}</Button>)}</div>
        </VariantRow>
        <VariantRow name="Header · Close hidden">
          <Button variant="secondary" onClick={() => setDrawer({ side: "right", size: "md", showClose: false })}>Open without close icon</Button>
        </VariantRow>
        <VariantRow name="Header · Fully hidden">
          <Button variant="secondary" onClick={() => setDrawer({ side: "right", size: "md", title: false, showClose: false })}>Open headerless drawer</Button>
        </VariantRow>
        <VariantRow name="Footer · Hidden">
          <Button variant="secondary" onClick={() => setDrawer({ side: "right", size: "md", footer: false })}>Open without footer</Button>
        </VariantRow>
        <VariantRow name="Scrim · Dismiss blocked">
          <Button variant="secondary" onClick={() => setDrawer({ side: "right", size: "md", closeOnScrim: false })}>Open locked scrim</Button>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FocusShell" description="Centred task shell with width, alignment and aside variants.">
        <VariantRow name="Widths · SM / MD / LG">
          <div className="grid gap-4 lg:grid-cols-3">
            {["sm", "md", "lg"].map((width) => (
              <div key={width} className="h-72 overflow-hidden rounded-xl border border-solid border-layer-border">
                <FocusShell width={width} title={`${width.toUpperCase()} focus`} description="A single focused task." brand={<span className="font-semibold">Claims Lab</span>} footer="Secure workspace">
                  <Button fullWidth>Continue</Button>
                </FocusShell>
              </div>
            ))}
          </div>
        </VariantRow>
        <VariantRow name="Alignment · Center / top">
          <div className="grid gap-4 lg:grid-cols-2">
            {["center", "top"].map((align) => (
              <div key={align} className="h-72 overflow-hidden rounded-xl border border-solid border-layer-border">
                <FocusShell align={align} width="sm" title={`${align === "center" ? "Centred" : "Top-aligned"} task`} description="A focused workflow without navigation."><Button>Continue</Button></FocusShell>
              </div>
            ))}
          </div>
        </VariantRow>
        <VariantRow name="Aside · Context panel">
          <div className="h-72 overflow-hidden rounded-xl border border-solid border-layer-border">
            <FocusShell align="top" width="md" title="Review claim" description="Content aligned to the top." aside={<div><strong>Summary</strong><p className="text-sm text-ctl-fg-muted">An optional contextual panel.</p></div>}><Button>Start review</Button></FocusShell>
          </div>
        </VariantRow>
        <VariantRow name="Slots · Header / footer">
          <div className="h-72 overflow-hidden rounded-xl border border-solid border-layer-border">
            <FocusShell width="sm" header={<span className="text-xs font-medium uppercase tracking-wider text-brand-text">Secure review</span>} footer={<span>Need help? Contact an administrator.</span>}>
              <Button fullWidth>Open workspace</Button>
            </FocusShell>
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Menu" description="Placements and row treatments including group, separator, checked and danger.">
        <VariantRow name="Placements">
          <div className="flex flex-wrap gap-3">
            {["bottom-start", "bottom-end", "top-start", "top-end"].map((placement) => <Menu key={placement} placement={placement} trigger={<ButtonBase variant="secondary">{placement}</ButtonBase>} items={MENU_ITEMS} />)}
          </div>
        </VariantRow>
        <VariantRow name="Items · Open state matrix">
          <div className="min-h-80">
            <Menu open onOpenChange={() => {}} trigger={<ButtonBase variant="secondary">Claim actions</ButtonBase>} items={MENU_ITEMS} />
          </div>
        </VariantRow>
        <VariantRow name="Items · Empty">
          <div className="min-h-20">
            <Menu open onOpenChange={() => {}} trigger={<ButtonBase variant="secondary">Empty menu</ButtonBase>} items={[]} />
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Modal" description="Decision dialog sizes and close-control treatment.">
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap gap-3">{["sm", "md", "lg"].map((size) => <Button key={size} variant="secondary" onClick={() => setModal({ size, showClose: true })}>{size.toUpperCase()}</Button>)}</div>
        </VariantRow>
        <VariantRow name="Close control · Hidden"><Button variant="secondary" onClick={() => setModal({ size: "md", showClose: false })}>Open without close icon</Button></VariantRow>
        <VariantRow name="Header · Fully hidden"><Button variant="secondary" onClick={() => setModal({ size: "md", title: false, showClose: false })}>Open headerless modal</Button></VariantRow>
        <VariantRow name="Footer · Hidden"><Button variant="secondary" onClick={() => setModal({ size: "md", footer: false })}>Open without footer</Button></VariantRow>
        <VariantRow name="Scrim · Dismiss blocked"><Button variant="secondary" onClick={() => setModal({ size: "md", closeOnScrim: false })}>Open locked scrim</Button></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SplitShell" description="List/detail orientation, selection and stacked behavior.">
        {["left", "right"].map((side) => (
          <VariantRow key={side} name={`Side · ${side}`}>
            <div className="overflow-x-auto"><SplitFrame side={side} /></div>
          </VariantRow>
        ))}
        <VariantRow name="List width · SM / MD / LG">
          <div className="grid gap-4 overflow-x-auto">
            {["sm", "md", "lg"].map((listWidth) => <SplitFrame key={listWidth} listWidth={listWidth} />)}
          </div>
        </VariantRow>
        <VariantRow name="Detail · Selected / empty">
          <div className="grid gap-4 overflow-x-auto">
            <SplitFrame />
            <SplitFrame selected={false} />
          </div>
        </VariantRow>
        <VariantRow name="Stacked · List / detail with back">
          <div className="grid gap-4 overflow-x-auto lg:grid-cols-2">
            <SplitFrame stacked selected={false} />
            <SplitFrame stacked onBack={() => {}} />
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ThemeProvider" description="Controlled light, dark and system themes without persistence side effects.">
        <VariantRow name="Mode · Light / Dark / System">
          <div className="grid gap-3 sm:grid-cols-3">
            {["light", "dark", "system"].map((theme) => <ThemeProvider key={theme} theme={theme} persist={false} className="rounded-xl border border-solid border-layer-border p-4"><div className="rounded-lg bg-ctl-surface p-3 text-sm font-medium capitalize">{theme} provider</div></ThemeProvider>)}
          </div>
        </VariantRow>
        <VariantRow name="Tokens · Accent / numeric radius"><ThemeProvider defaultTheme="light" persist={false} accent="#d946ef" radius={18} className="rounded-xl border border-solid border-layer-border p-4"><Button>Custom provider</Button></ThemeProvider></VariantRow>
        <VariantRow name="Tokens · String radius"><ThemeProvider defaultTheme="light" persist={false} radius="4px" className="rounded-xl border border-solid border-layer-border p-4"><Button variant="secondary">Compact radius</Button></ThemeProvider></VariantRow>
        <VariantRow name="Class ownership · Host managed"><ThemeProvider theme="dark" persist={false} applyClass={false} className="rounded-xl border border-solid border-layer-border p-4"><span className="text-sm">Provider exposes resolved theme without applying a nested dark class.</span></ThemeProvider></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ThemeToggle" description="Size, label and width treatments inside an isolated provider.">
        <VariantRow name="Selection · Light / System / Dark">
          <div className="flex flex-wrap gap-3">
            {["light", "system", "dark"].map((defaultTheme) => <ThemeProvider key={defaultTheme} defaultTheme={defaultTheme} persist={false} applyClass={false}><ThemeToggle /></ThemeProvider>)}
          </div>
        </VariantRow>
        <VariantRow name="Size · MD / SM"><div className="flex flex-wrap items-center gap-3"><ThemeProvider defaultTheme="light" persist={false} applyClass={false}><ThemeToggle /></ThemeProvider><ThemeProvider defaultTheme="light" persist={false} applyClass={false}><ThemeToggle size="sm" /></ThemeProvider></div></VariantRow>
        <VariantRow name="Labels · Icons only"><ThemeProvider defaultTheme="system" persist={false} applyClass={false}><ThemeToggle labels={false} /></ThemeProvider></VariantRow>
        <VariantRow name="Width · Full"><ThemeProvider defaultTheme="dark" persist={false} applyClass={false}><ThemeToggle fullWidth /></ThemeProvider></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ToastStack" description="Static, screenshot-friendly toast positions and tones.">
        {["top-left", "top-center", "top-right", "bottom-left", "bottom-right"].map((position) => (
          <VariantRow key={position} name={`Position · ${position}`}><div className="relative min-h-52 overflow-hidden rounded-xl border border-solid border-layer-border"><ToastStack items={TOASTS.slice(0, 2)} position={position} onDismiss={() => {}} /></div></VariantRow>
        ))}
        <VariantRow name="Tone · All six">
          <div className="relative min-h-[42rem] overflow-hidden rounded-xl border border-solid border-layer-border">
            <ToastStack items={TOASTS} position="top-left" onDismiss={() => {}} />
          </div>
        </VariantRow>
        <VariantRow name="Content · Title / description / action">
          <div className="relative min-h-80 overflow-hidden rounded-xl border border-solid border-layer-border">
            <ToastStack
              position="top-left"
              onDismiss={() => {}}
              items={[
                { id: "title", tone: "neutral", title: "Title only" },
                { id: "description", tone: "info", description: "A description can stand on its own." },
                { id: "action", tone: "success", title: "Export ready", description: "The report can now be downloaded.", action: <Button size="sm" variant="link">Download</Button> },
              ]}
            />
          </div>
        </VariantRow>
        <VariantRow name="Inset · On / off">
          <div className="grid gap-4 sm:grid-cols-2">
            {[true, false].map((inset) => <div key={String(inset)} className="relative min-h-40 overflow-hidden rounded-xl border border-solid border-layer-border"><ToastStack items={TOASTS.slice(2, 3)} position="top-left" inset={inset} /></div>)}
          </div>
        </VariantRow>
        <VariantRow name="Items · Empty">
          <div className="relative min-h-24 rounded-xl border border-dashed border-layer-border">
            <ToastStack items={[]} position="top-left" />
          </div>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="Toaster" description="Global queue host with each supported semantic tone.">
        <VariantRow name="Tone · Neutral / Accent / Success / Warning / Info / Danger">
          <div className="flex flex-wrap gap-3">{["neutral", "accent", "success", "warning", "info", "danger"].map((tone) => <Button key={tone} variant="secondary" onClick={() => toast(`${tone} toaster message`, tone)}>{tone}</Button>)}</div>
          <Toaster />
        </VariantRow>
        <VariantRow name="Alias · Pending to warning">
          <Button variant="secondary" onClick={() => toast("pending toaster message", "pending")}>pending</Button>
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="SidebarWordmark" description="App identity for sidebar and topbar placement.">
        <VariantRow name="Placement · Sidebar"><div className="max-w-sm bg-chrome-surface"><SidebarWordmark variant="sidebar" icon={Zap} name="Warranty Claims" /></div></VariantRow>
        <VariantRow name="Placement · Topbar"><div className="max-w-sm bg-chrome-surface p-3"><SidebarWordmark variant="topbar" icon={Zap} name="Warranty Claims" /></div></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="NavItem" description="Router-aware active, idle and icon treatments.">
        <VariantRow name="Route · Active / idle"><nav className="grid max-w-sm gap-1 bg-ctl-surface p-3"><NavItem to="/" end icon={LayoutDashboard} label="Active destination" /><NavItem to="/component-review-idle" icon={ShieldCheck} label="Idle destination" /></nav></VariantRow>
        <VariantRow name="Label · Truncated"><nav className="grid max-w-56 gap-1 bg-ctl-surface p-3"><NavItem to="/component-review-long" icon={FileText} label="A destination with a deliberately long navigation label" /></nav></VariantRow>
        <VariantRow name="Match · Exact root"><nav className="grid max-w-sm gap-1 bg-ctl-surface p-3"><NavItem to="/" end icon={LayoutDashboard} label="Exact root route" /></nav></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="CustomEmbed" description="Sandboxed integration frame with custom height.">
        <VariantRow name="Sandbox · Default"><CustomEmbed src="about:blank" title="Default sandbox preview" height={180} /></VariantRow>
        <VariantRow name="Sandbox · Restricted"><CustomEmbed src="about:blank" title="Restricted sandbox preview" sandbox="allow-forms" height={120} /></VariantRow>
        <VariantRow name="Height · 240"><CustomEmbed src="about:blank" title="Tall component preview" height={240} /></VariantRow>
        <VariantRow name="Source · Empty"><div className="min-h-20 rounded-lg border border-dashed border-layer-border"><CustomEmbed /></div></VariantRow>
      </ComponentGroup>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.title === false ? null : `${modal?.size?.toUpperCase() || "MD"} modal`}
        description="Live overlay component preview."
        size={modal?.size}
        showClose={modal?.showClose}
        closeOnScrim={modal?.closeOnScrim}
        footer={modal?.footer === false ? null : <><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => setModal(null)}>Confirm</Button></>}
      >Review focus trapping, spacing, scrim and footer alignment.</Modal>

      <Drawer
        open={Boolean(drawer)}
        onClose={() => setDrawer(null)}
        title={drawer?.title === false ? null : `${drawer?.side || "right"} drawer`}
        description="Live edge and width preview."
        side={drawer?.side}
        size={drawer?.size}
        showClose={drawer?.showClose}
        closeOnScrim={drawer?.closeOnScrim}
        footer={drawer?.footer === false ? null : <Button onClick={() => setDrawer(null)}>Done</Button>}
      >Drawer content remains independently scrollable.</Drawer>

      <CommandPalette
        open={Boolean(palette)}
        onClose={() => setPalette(null)}
        groups={palette?.groups || []}
        placeholder={palette?.placeholder}
        emptyLabel={palette?.emptyLabel}
        footer={palette?.footer}
      />
    </div>
  );
}

export { ShellComponentGroups };
export default ShellComponentGroups;
