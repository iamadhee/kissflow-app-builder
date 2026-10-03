import { useState } from "react";
import { ApprovalRow } from "./kit/Queue.jsx";
import { ExpressPage } from "./kit/ExpressPage.jsx";
import { FlowBoard, FlowTimeline } from "./kit/FlowViews.jsx";
import { FormCard, ItemForm, NewButton, NewMenu } from "./kit/Forms.jsx";
import { CountUp, FilterBar, SearchBar, StoresMap } from "./kit/Fx.jsx";
import { ModelChart } from "./kit/ModelChart.jsx";
import { ComponentGroup, VariantRow } from "./component-review-layout.jsx";

const FORM_FIELDS = [
  { Id: "Customer_Name", Name: "Customer name", Type: "Text" },
  { Id: "Contact_Email", Name: "Contact email", Type: "Email" },
  { Id: "Claim_Amount", Name: "Claim amount", Type: "Currency" },
  { Id: "Purchase_Date", Name: "Purchase date", Type: "Date" },
  { Id: "Priority", Name: "Priority", Type: "Select", Options: ["Low", "Medium", "High"] },
  { Id: "Issue_Description", Name: "Issue description", Type: "Textarea" },
];

const NEW_ITEMS = [
  { flowType: "Form", flowId: "Service_Center_A00", label: "New service center" },
  { flowType: "Process", flowId: "Claim_A01", label: "New claim" },
  { flowType: "Process", flowId: "Claim_A01", label: "New priority review" },
];

const LINKED_FORM_FIELDS = [
  { Id: "Send_Updates", Name: "Send updates", Type: "Boolean" },
  { Id: "Owner", Name: "Owner", Type: "User" },
  { Id: "Reviewers", Name: "Reviewers", Type: "UserList" },
  { Id: "Internal_Notes", Name: "Internal notes", Type: "Textarea" },
];

const SERVICE_CENTER_PAGE = {
  title: "Service centers",
  subtitle: "Generated component preview",
  flowType: "Form",
  flowId: "Service_Center_A00",
  flowName: "Service Center",
  archetype: "overview",
  layout: "stacked",
  fields: ["Service_Center_Name", "City", "Rating"],
  actions: [],
};

const CREATIVE_PAGE = {
  ...SERVICE_CENTER_PAGE,
  title: "Service-center health",
  subtitle: "A generated page with an authored section composition",
  archetype: "analytics",
  layout: "report",
  sections: [
    { id: "coverage-note", kind: "callout", title: "Coverage is healthy", body: "All configured regions have an assigned service center.", tone: "success", width: "full" },
  ],
};

const DISCONNECTED_PAGE = {
  title: "Unconnected page",
  subtitle: "A generated plan without a matching app model",
  flowType: "Form",
  flowId: "Missing_Flow_A00",
  archetype: "overview",
  layout: "stacked",
  fields: [],
  actions: [],
};

const LOCATIONS = [
  { id: 1, name: "Bengaluru Service Center", address: "Indiranagar, Bengaluru" },
  { id: 2, name: "Chennai Service Center", address: "Guindy, Chennai" },
];

function CoverageReviewSection({ rows = [] }) {
  return (
    <div className="rounded-xl bg-ctl-track p-4 text-sm text-ctl-fg">
      Custom renderer received <span className="font-mono tabular-nums">{rows.length}</span> service-center record{rows.length === 1 ? "" : "s"}.
    </div>
  );
}

function CompositeComponentGroups() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stage, setStage] = useState("all");
  const [region, setRegion] = useState("south");

  return (
    <div className="contents">
      <ComponentGroup name="SearchBar" description="Free-text search with dropdown narrowers and count.">
        <VariantRow name="Uncontrolled · Empty">
          <SearchBar placeholder="Search owners…" />
        </VariantRow>
        <VariantRow name="Controlled · Query">
          <SearchBar value="battery replacement" onChange={() => {}} placeholder="Search claims…" />
        </VariantRow>
        <VariantRow name="Select · Result count">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search claims…"
            count="128 results"
            selects={[{ name: "stage", label: "Stage", value: stage, options: [{ value: "all", label: "All stages" }, { value: "review", label: "Review" }], onChange: setStage }]}
          />
        </VariantRow>
        <VariantRow name="Multiple narrowers">
          <SearchBar
            placeholder="Search the portfolio…"
            count="18 matching"
            selects={[
              { name: "stage", label: "Stage", value: stage, options: [{ value: "all", label: "All stages" }, { value: "review", label: "Review" }], onChange: setStage },
              { name: "region", label: "Region", value: region, options: [{ value: "south", label: "South" }, { value: "west", label: "West" }], onChange: setRegion },
            ]}
            className="max-w-4xl"
          />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FilterBar" description="Closed, mutually exclusive filter vocabulary.">
        <VariantRow name="Sizes · SM / MD / LG">
          <div className="flex flex-wrap items-center gap-3">
            <FilterBar filters={[{ value: "sm", label: "Small" }]} size="sm" />
            <FilterBar filters={[{ value: "md", label: "Medium" }]} size="md" />
            <FilterBar filters={[{ value: "lg", label: "Large" }]} size="lg" />
          </div>
        </VariantRow>
        <VariantRow name="Controlled · Counts">
          <FilterBar filters={[{ value: "all", label: "All", count: 128 }, { value: "mine", label: "Mine", count: 18 }, { value: "risk", label: "At risk", count: 3 }]} value={filter} onChange={setFilter} />
        </VariantRow>
        <VariantRow name="Uncontrolled · Strings"><FilterBar filters={["Open", "Pending", "Closed"]} /></VariantRow>
        <VariantRow name="Controlled · No counts"><FilterBar filters={[{ value: "today", label: "Today" }, { value: "week", label: "This week" }, { value: "month", label: "This month" }]} value="week" onChange={() => {}} /></VariantRow>
        <VariantRow name="Single option"><FilterBar filters={[{ value: "all", label: "All records", count: 128 }]} /></VariantRow>
        <VariantRow name="Empty · No control"><FilterBar filters={[]} /><span className="text-sm text-ctl-fg-muted">No filter controls rendered.</span></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="CountUp" description="Animated and immediate numeric figures.">
        <VariantRow name="Animated · Positive"><span className="text-3xl font-semibold text-ctl-fg"><CountUp value={12842} /></span></VariantRow>
        <VariantRow name="Immediate · Positive"><span className="text-3xl font-semibold text-ctl-fg"><CountUp value={942} duration={0} /></span></VariantRow>
        <VariantRow name="Immediate · Zero"><span className="text-3xl font-semibold text-ctl-fg"><CountUp value={0} duration={0} /></span></VariantRow>
        <VariantRow name="Immediate · Negative"><CountUp value={-37} duration={0} className="text-3xl font-semibold text-danger-text" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="StoresMap" description="Themed location list with selectable and empty states.">
        <VariantRow name="Data · Select actions"><StoresMap locations={LOCATIONS} onSelect={() => {}} /></VariantRow>
        <VariantRow name="Data · Read only"><StoresMap locations={LOCATIONS} /></VariantRow>
        <VariantRow name="Fallback · Label only"><StoresMap locations={[{ id: 3, label: "Remote service partner" }]} /></VariantRow>
        <VariantRow name="Empty state"><StoresMap locations={[]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ExpressPage" description="Generated page grammar connected to the starter schema.">
        <VariantRow name="Connected · Overview">
          <ExpressPage page={SERVICE_CENTER_PAGE} />
        </VariantRow>
        <VariantRow name="Connected · Creative section">
          <ExpressPage page={CREATIVE_PAGE} />
        </VariantRow>
        <VariantRow name="Connected · Custom renderer">
          <ExpressPage page={CREATIVE_PAGE} sectionRenderers={{ "coverage-note": CoverageReviewSection }} />
        </VariantRow>
        <VariantRow name="Disconnected · Error">
          <ExpressPage page={DISCONNECTED_PAGE} />
        </VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FlowTimeline" description="SDK-bound timeline showing the active access, loading, error or data state.">
        <VariantRow name="Theme selected"><FlowTimeline flowType="Form" flowId="Service_Center_A00" titleField="Service_Center_Name" max={5} /></VariantRow>
        <VariantRow name="Existing · Form · Live state"><FlowTimeline variant="continuous-rail" flowType="Form" flowId="Service_Center_A00" titleField="Service_Center_Name" max={5} /></VariantRow>
        <VariantRow name="Existing · Process · Explicit fields"><FlowTimeline variant="continuous-rail" flowType="Process" flowId="Claim_A01" dateField="_created_at" titleField="Customer_Name" tone="accent" max={5} /></VariantRow>
        <VariantRow name="Existing · Auto fields · Limited"><FlowTimeline variant="continuous-rail" flowType="Process" flowId="Claim_A01" max={2} tone="success" /></VariantRow>
        <VariantRow name="Existing · Missing flow · Empty"><FlowTimeline variant="continuous-rail" flowType="Form" flowId="Missing_Flow_A00" max={5} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FlowBoard" description="SDK-bound board with configurable columns and group field.">
        <VariantRow name="Explicit columns · Owners"><FlowBoard flowType="Process" flowId="Claim_A01" groupField="_current_step" columns={["Submitted", "Review", "Decision"]} cardTitle="Customer_Name" ownerField="_current_assigned_to" /></VariantRow>
        <VariantRow name="Auto columns · Metadata"><FlowBoard flowType="Process" flowId="Claim_A01" groupField="_current_step" cardTitle="Customer_Name" cardMeta="Priority" ownerField="_current_assigned_to" /></VariantRow>
        <VariantRow name="Column tones"><FlowBoard flowType="Process" flowId="Claim_A01" groupField="_current_step" columns={["Submitted", "Review", "Decision"]} cardTitle="Customer_Name" toneOf={(name) => name === "Submitted" ? "info" : name === "Review" ? "warning" : "success"} /></VariantRow>
        <VariantRow name="Missing flow · Empty"><FlowBoard flowType="Form" flowId="Missing_Flow_A00" groupField="Status" columns={["Open", "Closed"]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="FormCard" description="Create form with text, choice, date, number and multiline fields.">
        <VariantRow name="Editing · Six field types"><FormCard flowType="Process" flowId="Claim_A01" title="Create claim" fields={FORM_FIELDS} required={["Customer_Name", "Issue_Description"]} /></VariantRow>
        <VariantRow name="Max · First three fields"><FormCard flowType="Process" flowId="Claim_A01" title="Quick claim" fields={FORM_FIELDS} max={3} /></VariantRow>
        <VariantRow name="Validation · Submit empty"><FormCard flowType="Process" flowId="Claim_A01" title="Required details" fields={FORM_FIELDS.slice(0, 2)} required={["Customer_Name", "Contact_Email"]} /></VariantRow>
        <VariantRow name="No editable fields · Disabled"><FormCard flowType="Form" flowId="Service_Center_A00" fields={[{ Id: "_id", Name: "Internal id", Type: "Text", IsInternal: true }]} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ItemForm" description="Seeded edit form with cancel and save actions.">
        <VariantRow name="Editing · Populated"><ItemForm flowType="Process" flowId="Claim_A01" item={{ _id: "preview-claim", Customer_Name: "Ava Shah", Contact_Email: "ava@example.com", Claim_Amount: 86000, Purchase_Date: "2026-08-20", Priority: "High", Issue_Description: "Battery replacement review." }} fields={FORM_FIELDS} required={["Customer_Name"]} onClose={() => {}} /></VariantRow>
        <VariantRow name="Validation · Submit empty"><ItemForm flowType="Process" flowId="Claim_A01" item={{ _id: "empty-preview-claim" }} fields={FORM_FIELDS.slice(0, 2)} required={["Customer_Name", "Contact_Email"]} onClose={() => {}} /></VariantRow>
        <VariantRow name="Boolean · Linked records"><ItemForm flowType="Form" flowId="Service_Center_A00" item={{ _id: "linked-preview", Send_Updates: true, Owner: { Name: "Ava Shah" }, Reviewers: [{ Name: "Diego Iyer" }, { Name: "Kim Rao" }, { Name: "Sam Lee" }], Internal_Notes: "Visible to the review team." }} fields={LINKED_FORM_FIELDS} /></VariantRow>
        <VariantRow name="No editable fields · Disabled"><ItemForm flowType="Form" flowId="Service_Center_A00" item={{ _id: "readonly-preview" }} fields={[{ Id: "_id", Name: "Internal id", Type: "Text", IsInternal: true }]} onClose={() => {}} /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="NewButton" description="One-click record creation ranks and labels.">
        <VariantRow name="Rank · Primary"><NewButton flowType="Form" flowId="Service_Center_A00" label="New service center" rank="primary" /></VariantRow>
        <VariantRow name="Rank · Secondary / Outline"><div className="flex flex-wrap gap-3"><NewButton flowType="Form" flowId="Service_Center_A00" label="Secondary new" rank="secondary" /><NewButton flowType="Form" flowId="Service_Center_A00" label="Outline new" rank="outline" /></div></VariantRow>
        <VariantRow name="Rank · Ghost"><NewButton flowType="Form" flowId="Service_Center_A00" label="Ghost new" rank="ghost" /></VariantRow>
        <VariantRow name="Rank · Danger"><NewButton flowType="Form" flowId="Service_Center_A00" label="Destructive new" rank="danger" /></VariantRow>
        <VariantRow name="Process · Default label"><NewButton flowType="Process" flowId="Claim_A01" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="NewMenu" description="Single-flow collapse and multi-flow create menu.">
        <VariantRow name="Single item · Collapsed"><NewMenu items={NEW_ITEMS.slice(0, 1)} label="New service center" /></VariantRow>
        <VariantRow name="Multiple items · Default"><NewMenu items={NEW_ITEMS.slice(0, 2)} /></VariantRow>
        <VariantRow name="Multiple items · Custom label"><NewMenu items={NEW_ITEMS} label="Create record" /></VariantRow>
        <VariantRow name="Empty · No control"><NewMenu items={[]} /><span className="text-sm text-ctl-fg-muted">No creation control rendered.</span></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ModelChart" description="Two theme-owned ranked breakdowns sharing the same SDK grouping, cap and declaration contract.">
        <VariantRow name="Theme selected"><ModelChart title="Claims by category" flowType="Process" flowId="Claim_A01" groupBy="Category" cap={4} /></VariantRow>
        <VariantRow name="Layout · Ranked bars"><ModelChart variant="ranked-bars" title="Claims by category" flowType="Process" flowId="Claim_A01" groupBy="Category" cap={4} /></VariantRow>
        <VariantRow name="Layout · Share ledger"><ModelChart variant="share-ledger" title="Claims by category" flowType="Process" flowId="Claim_A01" groupBy="Category" cap={4} /></VariantRow>
        <VariantRow name="Existing · Process · Explicit group"><ModelChart variant="ranked-bars" title="Claims by stage" flowType="Process" flowId="Claim_A01" groupBy="_current_step" cap={5} /></VariantRow>
        <VariantRow name="Existing · Auto group · Default cap"><ModelChart variant="ranked-bars" title="Automatically grouped claims" flowType="Process" flowId="Claim_A01" /></VariantRow>
        <VariantRow name="Existing · Cap · Top one declared"><ModelChart variant="ranked-bars" title="Leading claim stage" flowType="Process" flowId="Claim_A01" groupBy="_current_step" cap={1} /></VariantRow>
        <VariantRow name="Existing · Missing flow · Empty"><ModelChart variant="ranked-bars" title="No chart data" flowType="Form" flowId="Missing_Flow_A00" groupBy="Status" /></VariantRow>
      </ComponentGroup>

      <ComponentGroup name="ApprovalRow" description="Pending, approved and rejected decision states.">
        <VariantRow name="Resting · No actions"><ApprovalRow title="Battery replacement review" meta="CL-1041" owner="Ava Shah" status="Queued" age="1h" /></VariantRow>
        <VariantRow name="Pending · Both actions"><ApprovalRow title="Approve battery replacement" meta="CL-1042" owner="Ava Shah" status="Due today" tone="warning" age="3h" onApprove={() => {}} onReject={() => {}} /></VariantRow>
        <VariantRow name="Pending · Approve only"><ApprovalRow title="Confirm inspection evidence" meta="CL-1043" owner="Diego Iyer" status="Ready" tone="info" age="4h" onApprove={() => {}} /></VariantRow>
        <VariantRow name="Pending · Reject only"><ApprovalRow title="Decline duplicate request" meta="CL-1044" owner="Kim Rao" status="Duplicate" tone="neutral" age="5h" onReject={() => {}} /></VariantRow>
        <VariantRow name="Title action · Custom labels"><ApprovalRow title="Review reimbursement" meta="CL-1045" owner="Sam Lee" status="Needs decision" tone="accent" age="8h" actionLabels={{ approve: "Grant", reject: "Decline" }} onApprove={() => {}} onReject={() => {}} onOpen={() => {}} /></VariantRow>
        <VariantRow name="Late · Danger"><ApprovalRow title="Review transport reimbursement" meta="CL-1046" owner="Diego Iyer" status="Past SLA" tone="danger" age="2d" onApprove={() => {}} onReject={() => {}} /></VariantRow>
        <VariantRow name="Status tones"><div className="grid gap-1"><ApprovalRow title="Neutral" status="Queued" tone="neutral" /><ApprovalRow title="Accent" status="Selected" tone="accent" /><ApprovalRow title="Success" status="Cleared" tone="success" /><ApprovalRow title="Warning" status="Due soon" tone="warning" /><ApprovalRow title="Info" status="In review" tone="info" /><ApprovalRow title="Danger" status="Past SLA" tone="danger" /></div></VariantRow>
        <VariantRow name="Decided · Approved"><ApprovalRow title="Replacement approved" meta="CL-1047" owner="Kim Rao" status="Complete" decided="approved" /></VariantRow>
        <VariantRow name="Decided · Rejected"><ApprovalRow title="Claim rejected" meta="CL-1048" owner="Sam Lee" status="Complete" decided="rejected" /></VariantRow>
      </ComponentGroup>
    </div>
  );
}

export { CompositeComponentGroups };
export default CompositeComponentGroups;
