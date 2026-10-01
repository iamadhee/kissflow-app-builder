// GENERATED from starter/src/components/kit/AiWorkforcePage.jsx (sha256:a9f351ac8879517d). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { usePageTitle } from "@kissflow/app-ui";
import { Badge } from "./Badge.jsx";
import { Icon } from "./Icon.jsx";
import { PageHeader } from "./PageHeader.jsx";
import { Card } from "./Card.jsx";
import { PageBody, SurfaceCell, SurfaceGroup } from "./SurfaceGroup.jsx";

const iconName = (value) => {
  const name = String(value || "").toLowerCase();
  if (/review|verify|quality|audit/.test(name)) return "check";
  if (/risk|policy|guard|security/.test(name)) return "lock";
  if (/notify|alert|signal/.test(name)) return "bell";
  if (/search|research|find/.test(name)) return "search";
  if (/record|document|brief/.test(name)) return "file";
  return "star";
};

export function AiWorkforcePage({ workforce }) {
  usePageTitle("AI operations");
  const agents = workforce?.agents || [];
  const functions = workforce?.functions || [];
  const workspace = workforce?.workspace || {};
  const activity = workspace?.copilot?.activity || [];
  return <div className="flex min-h-full flex-col bg-page-bg text-ctl-fg">
    <PageHeader
      title="AI operations"
      description="Monitor specialist agents and decisions awaiting human review."
      meta={<Badge tone="success">{agents.length} active roles</Badge>}
    />
    <PageBody as="main" className="flex-1 pt-8">
    <SurfaceGroup layout="grid" gap="lg" className="grid-cols-12">
      <Card className="col-span-12 xl:col-span-8">
        <p className="m-0 text-xs font-semibold uppercase tracking-widest text-brand-text">Current brief</p>
        <h2 className="mb-2 mt-3 font-display text-xl font-semibold">{workspace?.entity?.name || workforce?.app?.name || "Current work"}</h2>
        <p className="m-0 max-w-prose text-sm leading-relaxed text-ctl-fg-muted">{workspace.brief || "Agents are preparing context for the next review."}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(workspace.evidence || []).map((item, index) => <div key={`${item.label}-${index}`} className="rounded-lg bg-layer-subtle p-4">
            <p className="m-0 text-xs font-medium text-ctl-fg-muted">{item.label}</p>
            <p className="mb-0 mt-2 text-lg font-semibold">{item.value}</p>
          </div>)}
        </div>
      </Card>
      <Card className="col-span-12 xl:col-span-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-widest text-brand-text">Human review</p>
        <h2 className="mb-2 mt-3 font-display text-lg font-semibold">Decision boundary</h2>
        <p className="m-0 text-sm leading-relaxed text-ctl-fg-muted">Agents prepare evidence and recommendations. Policy exceptions and consequential decisions remain with an accountable reviewer.</p>
      </Card>

      <SurfaceCell as="section" className="col-span-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><h2 className="m-0 font-display text-xl font-semibold">Agent team</h2><p className="mb-0 mt-1 text-sm text-ctl-fg-muted">Each role owns one outcome and a defined handoff.</p></div>
          <Badge tone="info">{functions.length} connected functions</Badge>
        </div>
        <SurfaceGroup layout="grid" gap="compact" className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => <Card key={agent.id}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-text"><Icon name={iconName(agent.icon || agent.name)} size="lg" /></span>
              <div className="min-w-0"><h3 className="m-0 font-display text-base font-semibold">{agent.name}</h3><p className="mb-0 mt-1 text-sm leading-relaxed text-ctl-fg-muted">{agent.goal}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{(agent.tools || []).map((tool) => <Badge key={tool} tone="neutral">{tool}</Badge>)}</div>
            <div className="mt-4 border-t border-layer-border pt-4 text-xs leading-relaxed text-ctl-fg-muted"><span className="font-semibold text-ctl-fg">Human handoff:</span> {agent.handoff}</div>
          </Card>)}
        </SurfaceGroup>
      </SurfaceCell>

      <Card className="col-span-12 lg:col-span-7">
        <h2 className="m-0 font-display text-lg font-semibold">Recent agent work</h2>
        <div className="mt-4 divide-y divide-layer-border">
          {activity.map((item, index) => <div key={`${item.agent}-${index}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-info-100 text-info-text"><Icon name="check" /></span>
            <div><p className="m-0 text-sm font-semibold">{item.agent}</p><p className="mb-0 mt-1 text-sm text-ctl-fg-muted">{item.did}</p></div>
          </div>)}
          {!activity.length ? <p className="m-0 py-4 text-sm text-ctl-fg-muted">Activity will appear when agents begin preparing the current work.</p> : null}
        </div>
      </Card>
      <Card className="col-span-12 lg:col-span-5">
        <h2 className="m-0 font-display text-lg font-semibold">Connected functions</h2>
        <div className="mt-4 space-y-3">{functions.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg bg-layer-subtle px-4 py-3">
          <span className="text-sm font-medium">{item.name}</span><Badge tone="neutral">{item.usedBy.length} agent{item.usedBy.length === 1 ? "" : "s"}</Badge>
        </div>)}</div>
      </Card>
    </SurfaceGroup>
    </PageBody>
  </div>;
}

export default AiWorkforcePage;
