export * from "./Accordion.jsx";
export * from "./Alert.jsx";
export * from "./AppShell.jsx";
export * from "./Avatar.jsx";
export * from "./Badge.jsx";
export * from "./BarChart.jsx";
export * from "./Breadcrumb.jsx";
export * from "./Button.jsx";
export * from "./Calendar.jsx";
export * from "./Card.jsx";
export * from "./Checkbox.jsx";
export * from "./Combobox.jsx";
export * from "./CommandPalette.jsx";
export * from "./DateField.jsx";
export * from "./DatePicker.jsx";
export * from "./DataGrid.jsx";
export * from "./DescriptionList.jsx";
export * from "./DonutLegend.jsx";
export * from "./Drawer.jsx";
export * from "./EmptyState.jsx";
export * from "./FileDrop.jsx";
export * from "./FocusShell.jsx";
export * from "./FunnelChart.jsx";
export * from "./GanttChart.jsx";
export * from "./GaugeRing.jsx";
export * from "./HBars.jsx";
export * from "./Heatmap.jsx";
export * from "./Icon.jsx";
export * from "./FieldValue.jsx";
export * from "./Input.jsx";
export * from "./LineChart.jsx";
export * from "./Menu.jsx";
export * from "./Modal.jsx";
export * from "./MultiCombobox.jsx";
export * from "./NumberInput.jsx";
export * from "./PageHeader.jsx";
export * from "./Pagination.jsx";
export * from "./Popover.jsx";
export * from "./ProgressBar.jsx";
export * from "./ProgressList.jsx";
export * from "./SegmentBar.jsx";
export * from "./Select.jsx";
export * from "./Skeleton.jsx";
export * from "./Slider.jsx";
export * from "./SplitShell.jsx";
export * from "./StackedBar.jsx";
export * from "./StatTile.jsx";
export * from "./StatusRibbon.jsx";
export * from "./InstrumentCard.jsx";
export * from "./KpiStrip.jsx";
export * from "./Stepper.jsx";
export * from "./PageLayout.jsx";
export * from "./SurfaceGroup.jsx";
/* MaterialContext remains exported by Card.jsx for compatibility. Export the
   new surface API explicitly so the barrel does not expose that binding twice. */
export {
  DEFAULT_SURFACE_CONTEXT,
  NEXT_MATERIAL,
  ELEVATION_CLASS,
  MATERIAL_RADIUS_CLASS,
  MATERIAL_STYLE,
  SurfaceContext,
  normalizeGeometry,
  resolveRootMaterial,
  normalizeSurfaceContext,
  nextMaterial,
  resolveElevation,
  materialStyle,
  materialRadiusClass,
  elevationClass,
} from "./Surface.js";
export * from "./Table.jsx";
export * from "./Tabs.jsx";
export * from "./Textarea.jsx";
export * from "./ThemeProvider.jsx";
export * from "./Timeline.jsx";
export * from "./Toast.jsx";
export * from "./Toggle.jsx";
export * from "./Toolbar.jsx";
export * from "./Tooltip.jsx";
export * from "./Tree.jsx";

// Kissflow-specific composites built on the component-system primitives.
export * from "./Board.jsx";
export * from "./Queue.jsx";
export * from "./FlowViews.jsx";
export * from "./Forms.jsx";
export * from "./Fx.jsx";
export * from "./ModelChart.jsx";
export * from "./useFlow.js";
export * from "./ExpressPage.jsx";
export * from "./AiWorkforcePage.jsx";
export * from "./HeaderIdentity.jsx";
export * from "./NavItem.jsx";
export * from "./SidebarWordmark.jsx";
export * from "./format.js";
export * from "./widget-rank.js";

// ── Specialised, dependency-backed surfaces ──────────────────────────────────
// These lived in components/kf until 15 Sep 2026, when the two folders became one: a component a
// builder cannot see is a component it hand-draws instead, and half this library was invisible.
//
// Exported by NAME, not with `export *`: AdvancedDataGrid and InteractiveGantt also export the
// legacy names they had in kf (DataGrid, GanttChart), and a star export of both modules would make
// those names ambiguous — which in ESM means silently absent. Legacy names resolve through the
// module path instead, which is what the build's compatibility mapping uses.
export * from "./CalendarView.jsx";
export * from "./CsvImport.jsx";
export * from "./FlowDiagram.jsx";
export * from "./KfQuery.jsx";
export * from "./Motion.jsx";
export * from "./SmartForm.jsx";
export * from "./SortableList.jsx";
export * from "./VirtualList.jsx";
export * from "./WidgetBoundary.jsx";
export * from "./tones.js";
export { AdvancedDataGrid } from "./AdvancedDataGrid.jsx";
export { InteractiveGantt } from "./InteractiveGantt.jsx";
// Scene3D is deliberately absent: import it lazily from "./Scene3D.jsx" so Three.js stays in its
// own chunk and a page that never draws in 3D never pays for it.

// Stable recipe-facing names used by executable comprehensive page contracts.
export { KanbanBoard as Board } from "./Board.jsx";
export { ApprovalQueue as Queue } from "./Queue.jsx";
