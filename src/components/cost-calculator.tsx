"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Building2, Calculator, Cog, DraftingCompass, HardHat, Ruler, Wind, Workflow } from "lucide-react";

type EstimateLine = { label: string; amount: number; note?: string };
type Estimate = { base: number; gstRate: number; lines: EstimateLine[] };

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(value);

const parseAmount = (value: string) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

const fieldClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-bold text-muted-foreground";

function NumberField({ label, value, onChange, suffix, min = 0, step = "any", required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <input type="number" min={min} max={label === "GST rate" ? 100 : undefined} step={step} required={required} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} ${suffix ? "pr-16" : ""}`} />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">{suffix}</span>}
      </span>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function EstimateResult({ estimate }: { estimate: Estimate }) {
  const gst = estimate.base * estimate.gstRate / 100;
  return (
    <section aria-live="polite" className="rounded-2xl border border-primary/20 bg-primary/[0.035] p-4 sm:p-5">
      <h3 className="text-base font-extrabold">Estimate</h3>
      <div className="mt-3 divide-y divide-border/80">
        {estimate.lines.map((line, index) => (
          <div key={`${line.label}-${index}`} className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <span className="min-w-0"><span className="font-medium">{line.label}</span>{line.note && <span className="mt-0.5 block text-xs text-muted-foreground">{line.note}</span>}</span>
            <span className="shrink-0 font-semibold tabular-nums">{formatMoney(line.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-2.5 text-sm"><span className="font-semibold">Subtotal before GST</span><span className="font-bold tabular-nums">{formatMoney(estimate.base)}</span></div>
        <div className="flex justify-between gap-4 py-2.5 text-sm"><span>GST ({estimate.gstRate}%)</span><span className="font-semibold tabular-nums">{formatMoney(gst)}</span></div>
        <div className="flex justify-between gap-4 pt-3 text-base"><span className="font-extrabold">Estimated total</span><span className="font-extrabold text-primary tabular-nums">{formatMoney(estimate.base + gst)}</span></div>
      </div>
    </section>
  );
}

function CalculatorCard({ title, description, children, gstRate, setGstRate, onCalculate, estimate }: {
  title: string;
  description: string;
  children: ReactNode;
  gstRate: string;
  setGstRate: (value: string) => void;
  onCalculate: (event: FormEvent<HTMLFormElement>) => void;
  estimate: Estimate | null;
}) {
  return (
    <section className="glass-card space-y-5 rounded-2xl border border-border p-4 sm:p-6">
      <header className="space-y-1.5">
        <h2 className="text-lg font-extrabold sm:text-xl">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </header>
      <form onSubmit={onCalculate} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <NumberField label="GST rate" value={gstRate} onChange={setGstRate} suffix="%" min={0} step="0.01" required />
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90">
            <Calculator className="h-4 w-4" /> Calculate estimate
          </button>
        </div>
      </form>
      {estimate && <EstimateResult estimate={estimate} />}
    </section>
  );
}

function CivilCalculator() {
  const [mode, setMode] = useState("Concrete (PCC / RCC)");
  const [kind, setKind] = useState("PCC");
  const [grade, setGrade] = useState("M10");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [concreteRate, setConcreteRate] = useState("");
  const [steelQuantity, setSteelQuantity] = useState("");
  const [steelRate, setSteelRate] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("m³");
  const [rate, setRate] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const gst = parseAmount(gstRate);
    if (mode === "Concrete (PCC / RCC)") {
      const volume = parseAmount(length) * parseAmount(width) * parseAmount(depth);
      const concreteAmount = volume * parseAmount(concreteRate);
      const steelAmount = kind === "RCC" ? parseAmount(steelQuantity) * parseAmount(steelRate) : 0;
      setEstimate({
        base: concreteAmount + steelAmount,
        gstRate: gst,
        lines: [
          { label: `${kind} ${grade} concrete`, amount: concreteAmount, note: `${volume.toFixed(3)} m³ × ${formatMoney(parseAmount(concreteRate))}/m³` },
          ...(kind === "RCC" && steelAmount > 0 ? [{ label: "Reinforcement steel", amount: steelAmount, note: `${parseAmount(steelQuantity).toLocaleString("en-IN")} kg × ${formatMoney(parseAmount(steelRate))}/kg` }] : []),
        ],
      });
      return;
    }
    const base = parseAmount(quantity) * parseAmount(rate);
    setEstimate({ base, gstRate: gst, lines: [{ label: item.trim() || "Civil BOQ item", amount: base, note: `${parseAmount(quantity).toLocaleString("en-IN")} ${unit} × ${formatMoney(parseAmount(rate))}/${unit}` }] });
  };

  return (
    <CalculatorCard title="Civil works calculator" description="Estimate PCC, RCC, or another civil BOQ item using measured quantities and your entered rates." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
      <SelectField label="Calculation type" value={mode} onChange={(value) => { setMode(value); setEstimate(null); }} options={["Concrete (PCC / RCC)", "Other civil BOQ item"]} />
      {mode === "Concrete (PCC / RCC)" ? <>
        <SelectField label="Concrete item" value={kind} onChange={(value) => { setKind(value); setGrade(value === "PCC" ? "M10" : "M20"); }} options={["PCC", "RCC"]} />
        <SelectField label="Concrete grade" value={grade} onChange={setGrade} options={kind === "PCC" ? ["M5", "M7.5", "M10", "M15"] : ["M15", "M20", "M25", "M30", "M35", "M40", "M45", "M50"]} />
        <NumberField label="Length" value={length} onChange={setLength} suffix="m" required />
        <NumberField label="Width" value={width} onChange={setWidth} suffix="m" required />
        <NumberField label="Depth / thickness" value={depth} onChange={setDepth} suffix="m" required />
        <NumberField label="Concrete rate" value={concreteRate} onChange={setConcreteRate} suffix="₹/m³" required />
        {kind === "RCC" && <>
          <NumberField label="Reinforcement quantity (optional)" value={steelQuantity} onChange={setSteelQuantity} suffix="kg" />
          <NumberField label="Reinforcement rate (optional)" value={steelRate} onChange={setSteelRate} suffix="₹/kg" />
        </>}
      </> : <>
        <TextField label="BOQ item description" value={item} onChange={setItem} placeholder="e.g. Brick masonry in CM 1:6" />
        <NumberField label="Measured quantity" value={quantity} onChange={setQuantity} suffix={unit} required />
        <SelectField label="Unit" value={unit} onChange={setUnit} options={["m³", "m²", "m", "No.", "L.S."]} />
        <NumberField label="Rate per unit" value={rate} onChange={setRate} suffix={`₹/${unit}`} required />
      </>}
    </CalculatorCard>
  );
}

function MechanicalCalculator() {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplyRate, setSupplyRate] = useState("");
  const [installationRate, setInstallationRate] = useState("");
  const [testing, setTesting] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const qty = parseAmount(quantity);
    const supply = qty * parseAmount(supplyRate);
    const installation = qty * parseAmount(installationRate);
    const extras = parseAmount(testing);
    const equipmentName = description.trim() || "Equipment";
    setEstimate({ base: supply + installation + extras, gstRate: parseAmount(gstRate), lines: [
      { label: `${equipmentName} supply`, amount: supply, note: `${qty} units × ${formatMoney(parseAmount(supplyRate))}/unit` },
      { label: `${equipmentName} mechanical installation`, amount: installation, note: `${qty} units × ${formatMoney(parseAmount(installationRate))}/unit` },
      { label: "Testing, commissioning, and other costs", amount: extras },
    ] });
  };
  return <CalculatorCard title="Mechanical works calculator" description="Keep equipment supply, mechanical installation, and testing as separate cost inputs." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <TextField label="Equipment / work description" value={description} onChange={setDescription} placeholder="e.g. Pump set, piping, or vessel" />
    <NumberField label="Quantity" value={quantity} onChange={setQuantity} suffix="units" required />
    <NumberField label="Supply rate per unit" value={supplyRate} onChange={setSupplyRate} suffix="₹/unit" required />
    <NumberField label="Installation rate per unit" value={installationRate} onChange={setInstallationRate} suffix="₹/unit" />
    <NumberField label="Testing / commissioning / other" value={testing} onChange={setTesting} suffix="₹" />
  </CalculatorCard>;
}

function ErectionCalculator() {
  const [scope, setScope] = useState("");
  const [weight, setWeight] = useState("");
  const [rate, setRate] = useState("");
  const [crane, setCrane] = useState("");
  const [testing, setTesting] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const erection = parseAmount(weight) * parseAmount(rate);
    const mobilization = parseAmount(crane);
    const testingAmount = parseAmount(testing);
    const erectionScope = scope.trim() || "Erection work";
    setEstimate({ base: erection + mobilization + testingAmount, gstRate: parseAmount(gstRate), lines: [
      { label: erectionScope, amount: erection, note: `${parseAmount(weight).toLocaleString("en-IN")} MT × ${formatMoney(parseAmount(rate))}/MT` },
      { label: "Crane, rigging, and mobilization", amount: mobilization },
      { label: "Inspection and testing", amount: testingAmount },
    ] });
  };
  return <CalculatorCard title="Erection works calculator" description="Estimate erection against installed tonnage, with lifting / mobilization and inspection costs separate." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <TextField label="Erection scope" value={scope} onChange={setScope} placeholder="e.g. Structural steel or equipment erection" />
    <NumberField label="Installed weight" value={weight} onChange={setWeight} suffix="MT" required />
    <NumberField label="Erection rate" value={rate} onChange={setRate} suffix="₹/MT" required />
    <NumberField label="Crane / rigging / mobilization" value={crane} onChange={setCrane} suffix="₹" />
    <NumberField label="Inspection / testing" value={testing} onChange={setTesting} suffix="₹" />
  </CalculatorCard>;
}

function HvacCalculator() {
  const [scope, setScope] = useState("");
  const [capacity, setCapacity] = useState("");
  const [equipmentRate, setEquipmentRate] = useState("");
  const [installationRate, setInstallationRate] = useState("");
  const [ductArea, setDuctArea] = useState("");
  const [ductRate, setDuctRate] = useState("");
  const [testing, setTesting] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const equipment = parseAmount(capacity) * parseAmount(equipmentRate);
    const installation = parseAmount(capacity) * parseAmount(installationRate);
    const duct = parseAmount(ductArea) * parseAmount(ductRate);
    const extras = parseAmount(testing);
    const systemName = scope.trim() || "HVAC system";
    setEstimate({ base: equipment + installation + duct + extras, gstRate: parseAmount(gstRate), lines: [
      { label: `${systemName} equipment`, amount: equipment, note: `${parseAmount(capacity)} TR × ${formatMoney(parseAmount(equipmentRate))}/TR` },
      { label: "HVAC installation", amount: installation, note: `${parseAmount(capacity)} TR × ${formatMoney(parseAmount(installationRate))}/TR` },
      { label: "Ductwork", amount: duct, note: `${parseAmount(ductArea)} m² × ${formatMoney(parseAmount(ductRate))}/m²` },
      { label: "Controls, testing, and other costs", amount: extras },
    ] });
  };
  return <CalculatorCard title="HVAC calculator" description="Estimate capacity-based equipment and installation separately from duct area, controls, and commissioning." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <TextField label="System / work description" value={scope} onChange={setScope} placeholder="e.g. Chilled water HVAC system" />
    <NumberField label="Cooling capacity" value={capacity} onChange={setCapacity} suffix="TR" required />
    <NumberField label="Equipment rate" value={equipmentRate} onChange={setEquipmentRate} suffix="₹/TR" required />
    <NumberField label="Installation rate" value={installationRate} onChange={setInstallationRate} suffix="₹/TR" required />
    <NumberField label="Duct surface area" value={ductArea} onChange={setDuctArea} suffix="m²" />
    <NumberField label="Duct rate" value={ductRate} onChange={setDuctRate} suffix="₹/m²" />
    <NumberField label="Controls / testing / other" value={testing} onChange={setTesting} suffix="₹" />
  </CalculatorCard>;
}

function DesignCalculator() {
  const [scope, setScope] = useState("");
  const [drawings, setDrawings] = useState("");
  const [drawingRate, setDrawingRate] = useState("");
  const [models, setModels] = useState("");
  const [modelRate, setModelRate] = useState("");
  const [survey, setSurvey] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const drawingAmount = parseAmount(drawings) * parseAmount(drawingRate);
    const modelAmount = parseAmount(models) * parseAmount(modelRate);
    const surveyAmount = parseAmount(survey);
    const designScope = scope.trim() || "Design drawings / deliverables";
    setEstimate({ base: drawingAmount + modelAmount + surveyAmount, gstRate: parseAmount(gstRate), lines: [
      { label: designScope, amount: drawingAmount, note: `${parseAmount(drawings)} deliverables × ${formatMoney(parseAmount(drawingRate))}/deliverable` },
      { label: "Models / design packages", amount: modelAmount, note: `${parseAmount(models)} packages × ${formatMoney(parseAmount(modelRate))}/package` },
      { label: "Survey and external design costs", amount: surveyAmount },
    ] });
  };
  return <CalculatorCard title="Design services calculator" description="Estimate design output by drawing or package deliverables, with surveys and external design costs separate." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <TextField label="Design scope" value={scope} onChange={setScope} placeholder="e.g. Structural design and detailing" />
    <NumberField label="Drawing / design deliverables" value={drawings} onChange={setDrawings} suffix="items" required />
    <NumberField label="Rate per deliverable" value={drawingRate} onChange={setDrawingRate} suffix="₹/item" required />
    <NumberField label="3D models / packages" value={models} onChange={setModels} suffix="packages" />
    <NumberField label="Rate per model / package" value={modelRate} onChange={setModelRate} suffix="₹/package" />
    <NumberField label="Survey / third-party design costs" value={survey} onChange={setSurvey} suffix="₹" />
  </CalculatorCard>;
}

function EngineeringCalculator() {
  const [scope, setScope] = useState("");
  const [engineeringHours, setEngineeringHours] = useState("");
  const [engineeringRate, setEngineeringRate] = useState("");
  const [draftingHours, setDraftingHours] = useState("");
  const [draftingRate, setDraftingRate] = useState("");
  const [expenses, setExpenses] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const engineering = parseAmount(engineeringHours) * parseAmount(engineeringRate);
    const drafting = parseAmount(draftingHours) * parseAmount(draftingRate);
    const other = parseAmount(expenses);
    const engineeringScope = scope.trim() || "Engineering hours";
    setEstimate({ base: engineering + drafting + other, gstRate: parseAmount(gstRate), lines: [
      { label: engineeringScope, amount: engineering, note: `${parseAmount(engineeringHours)} hours × ${formatMoney(parseAmount(engineeringRate))}/hour` },
      { label: "Drafting / modelling hours", amount: drafting, note: `${parseAmount(draftingHours)} hours × ${formatMoney(parseAmount(draftingRate))}/hour` },
      { label: "Survey, software, and external expenses", amount: other },
    ] });
  };
  return <CalculatorCard title="Engineering services calculator" description="Estimate engineering and drafting effort by manhours, then add software or external engineering expenses." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <TextField label="Engineering discipline / scope" value={scope} onChange={setScope} placeholder="e.g. Process, piping, electrical, or civil engineering" />
    <NumberField label="Engineering hours" value={engineeringHours} onChange={setEngineeringHours} suffix="hours" required />
    <NumberField label="Engineering rate" value={engineeringRate} onChange={setEngineeringRate} suffix="₹/hour" required />
    <NumberField label="Drafting / modelling hours" value={draftingHours} onChange={setDraftingHours} suffix="hours" />
    <NumberField label="Drafting / modelling rate" value={draftingRate} onChange={setDraftingRate} suffix="₹/hour" />
    <NumberField label="Survey / software / external expenses" value={expenses} onChange={setExpenses} suffix="₹" />
  </CalculatorCard>;
}

function UtilitiesCalculator() {
  const [utility, setUtility] = useState("Water / process piping");
  const [scope, setScope] = useState("");
  const [length, setLength] = useState("");
  const [supplyInstallRate, setSupplyInstallRate] = useState("");
  const [equipment, setEquipment] = useState("");
  const [testing, setTesting] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const route = parseAmount(length) * parseAmount(supplyInstallRate);
    const equipmentAmount = parseAmount(equipment);
    const testingAmount = parseAmount(testing);
    const utilityScope = scope.trim() || utility;
    setEstimate({ base: route + equipmentAmount + testingAmount, gstRate: parseAmount(gstRate), lines: [
      { label: `${utilityScope} supply and installation`, amount: route, note: `${parseAmount(length)} m × ${formatMoney(parseAmount(supplyInstallRate))}/m` },
      { label: "Equipment and appurtenances", amount: equipmentAmount },
      { label: "Testing / commissioning", amount: testingAmount },
    ] });
  };
  return <CalculatorCard title="Utilities calculator" description="Estimate a selected utility route with a per-metre installed rate, equipment, and testing as distinct cost lines." gstRate={gstRate} setGstRate={setGstRate} onCalculate={calculate} estimate={estimate}>
    <SelectField label="Utility system" value={utility} onChange={setUtility} options={["Water / process piping", "Fire water", "Steam / condensate", "Fuel gas", "Electrical cabling", "Drainage / sewer", "Other utility"]} />
    <TextField label="Scope / service description" value={scope} onChange={setScope} placeholder="e.g. 150 mm CS line with supports" />
    <NumberField label="Installed route length" value={length} onChange={setLength} suffix="m" required />
    <NumberField label="Supply and installation rate" value={supplyInstallRate} onChange={setSupplyInstallRate} suffix="₹/m" required />
    <NumberField label="Equipment / valves / appurtenances" value={equipment} onChange={setEquipment} suffix="₹" />
    <NumberField label="Testing / commissioning" value={testing} onChange={setTesting} suffix="₹" />
  </CalculatorCard>;
}

const categories = [
  { id: "civil", name: "Civil", icon: Building2, description: "Concrete and civil BOQ" },
  { id: "mechanical", name: "Mechanical", icon: Cog, description: "Equipment and machinery" },
  { id: "erection", name: "Erection", icon: HardHat, description: "Installation by weight" },
  { id: "hvac", name: "HVAC", icon: Wind, description: "Capacity and ductwork" },
  { id: "design", name: "Design", icon: DraftingCompass, description: "Drawings and design packages" },
  { id: "engineering", name: "Engineering", icon: Ruler, description: "Manhour-based engineering" },
  { id: "utilities", name: "Utilities", icon: Workflow, description: "Networks and systems" },
] as const;

export function CostCalculator() {
  const [active, setActive] = useState<(typeof categories)[number]["id"]>("civil");
  const activeCategory = categories.find((category) => category.id === active);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-[2%] pb-10 pt-2">
      <header className="space-y-2 border-b border-border pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tender tools</p>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-4xl"><Calculator className="h-7 w-7 text-primary sm:h-9 sm:w-9" /> BOQ Cost Calculator</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">Choose a work discipline to estimate its BOQ using the relevant quantities and rates. GST is calculated separately on the subtotal.</p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="tablist" aria-label="Work discipline">
        {categories.map(({ id, name, icon: Icon, description }) => (
          <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setActive(id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active === id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/40"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold">{name}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span></span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={activeCategory?.name}>
        {active === "civil" && <CivilCalculator />}
        {active === "mechanical" && <MechanicalCalculator />}
        {active === "erection" && <ErectionCalculator />}
        {active === "hvac" && <HvacCalculator />}
        {active === "design" && <DesignCalculator />}
        {active === "engineering" && <EngineeringCalculator />}
        {active === "utilities" && <UtilitiesCalculator />}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">This is a basic estimate from the quantities, rates, and GST percentage you enter. Verify applicable GST treatment and tender-specific measurement rules before using it in a bid.</p>
    </div>
  );
}
