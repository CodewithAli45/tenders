"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Building2, Calculator, CheckCircle2, ExternalLink, FileText, Search } from "lucide-react";
import { calculateNhaiOrVii2008, calculateSailCivil2024, type CalculatorResult, type CalculatorValues } from "@/lib/price-variation-calculator";
import { organizationNames as referenceOrganizations, priceVariationReferences, type PriceVariationReference } from "@/lib/price-variation-data";

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const sectionClass = "scroll-mt-32 rounded-2xl border border-border bg-card p-5 sm:p-7";
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
const numberText = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 5 }).format(value);

export function PriceVariationReferencePage() {
  const [organization, setOrganization] = useState("Steel Authority of India Limited (SAIL)");
  const [query, setQuery] = useState("");
  const [organizations, setOrganizations] = useState<string[]>(referenceOrganizations);
  const [orgLoadFailed, setOrgLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState("sail-sbd-2024-civil");
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [calcError, setCalcError] = useState("");
  const [values, setValues] = useState<CalculatorValues>({ workValue: 0, base: {}, current: {} });
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [hasClause, setHasClause] = useState("");
  const [isSamePackage, setIsSamePackage] = useState("");
  const [withinSchedule, setWithinSchedule] = useState("");
  const [specificException, setSpecificException] = useState("");
  const [hasConflicts, setHasConflicts] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/public/organizations")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load organizations");
        const names: unknown = await response.json();
        if (Array.isArray(names)) setOrganizations([...new Set([...referenceOrganizations, ...names.filter((name): name is string => typeof name === "string")])].sort());
      })
      .catch(() => setOrgLoadFailed(true));
  }, []);

  const filteredReferences = priceVariationReferences.filter((reference) => {
    const text = `${reference.organization} ${reference.contractCategory} ${reference.contractName} ${reference.clause}`.toLowerCase();
    return (!organization || reference.organization === organization) && (!query.trim() || text.includes(query.trim().toLowerCase()));
  });
  const selectedReference = priceVariationReferences.find((reference) => reference.id === selectedId) ?? null;
  const durationMonths = Number(duration);
  const sailConditionsMet = selectedReference?.calculatorId === "sail-sbd-2024-civil"
    ? ((durationMonths > 12 && withinSchedule === "yes") || (durationMonths <= 12 && specificException === "yes"))
    : isSamePackage === "yes";
  const applicabilityIndicated = checked && !!selectedReference && category === selectedReference.contractCategory && durationMonths > 0 && hasClause === "yes" && sailConditionsMet && hasConflicts === "no" && organization === selectedReference.organization;

  function setIndex(key: string, side: "base" | "current", raw: string) {
    const number = raw === "" ? Number.NaN : Number(raw);
    setValues((previous) => ({ ...previous, [side]: { ...previous[side], [key]: number } }));
  }

  function runCalculation(reference: PriceVariationReference) {
    setCalcError("");
    setResult(null);
    try {
      setResult(reference.calculatorId === "sail-sbd-2024-civil"
        ? calculateSailCivil2024(reference, values)
        : calculateNhaiOrVii2008(reference, values));
    } catch (error) {
      setCalcError(error instanceof Error ? error.message : "Check the entered values.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-[2%]">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Contract reference &amp; calculation tool</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Price Variation Reference and Calculator</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Check the price adjustment terms written into a contract, follow the cited index sources, and calculate an adjustment only where a verified formula and its inputs are available.</p>
        <nav aria-label="Page sections" className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm font-semibold">
          {[ ["overview", "Overview"], ["references", "References"], ["calculator", "Calculator"], ["eligibility", "Applicability"], ["sources", "Sources"] ].map(([id, label]) => <a key={id} href={`#${id}`} className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">{label}</a>)}
        </nav>
      </header>

      <section id="overview" className={sectionClass}>
        <h2 className="text-xl font-bold">Price variation in a construction contract</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">Price variation, also called price adjustment, is available only when the contract includes a clause for it. The clause may adjust payment when the prices or price indices of materials used in the work change.</p>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">The contract sets a base date. Some contracts use a date around the financial bid opening, but check your agreement. In the SAIL SBD 2024 template, the base date is set in Contract Agreement Sub-Clause 2.3. For example, if the cement index is 1.25 on the base date and 1.36 while the work is underway, the change may be included in a price adjustment against the eligible billed work. The contract formula and its other terms decide the amount.</p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">This example only explains the idea. It does not promise payment. Check which work is covered, how the formula is applied, and what exclusions, limits, or amendments apply.</p>
      </section>

      <section id="references" className={sectionClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Source-based records</p><h2 className="mt-1 text-xl font-bold">Organisation-wise references</h2></div>
          <p className="text-sm text-muted-foreground">{filteredReferences.length} source reference{filteredReferences.length === 1 ? "" : "s"}</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Organisation
            <select className={inputClass} value={organization} onChange={(event) => { const nextOrganization = event.target.value; const nextReference = priceVariationReferences.find((reference) => reference.organization === nextOrganization); setOrganization(nextOrganization); setSelectedId(nextReference?.id ?? ""); setResult(null); setCalcError(""); }}>
              <option value="">All organisations</option>{organizations.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Search references
            <span className="relative mt-1.5 block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input className={`${inputClass} mt-0 pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Organisation, category, clause" /></span>
          </label>
        </div>
        {orgLoadFailed && <p className="mt-3 text-xs text-muted-foreground">The organisation directory could not be loaded. Showing organisations that have a source-verified PVC reference.</p>}
        {filteredReferences.length ? <div className="mt-4 space-y-3">{filteredReferences.map((reference) => <ReferenceSummary key={reference.id} reference={reference} onSelect={() => { setOrganization(reference.organization); setSelectedId(reference.id); setResult(null); setCalcError(""); document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" }); }} />)}</div> : <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center"><Building2 className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">No source-verified PVC reference found</p><p className="mt-1 text-xs text-muted-foreground">The organisation directory lists organisations, not their contract clauses. Add a source document to establish a reference.</p></div>}
      </section>

      <section id="calculator" className={sectionClass}>
        <div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-primary" /><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Formula-specific calculation</p><h2 className="text-xl font-bold">Price variation calculator</h2></div></div>
        {selectedReference ? <>
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-5"><strong>{selectedReference.contractName}</strong><p className="mt-1 text-xs text-muted-foreground">{selectedReference.calculatorId === "sail-sbd-2024-civil" ? "SAIL SBD 2024 Appendix 4, Sub-Clause 2.8 — for civil works only." : "This calculator is configured for this specific historic NHAI bid document. It is not an organisation-wide formula."}</p></div>
          {selectedReference.reviewFlags?.map((flag) => <div key={flag} className="mt-3 flex gap-2 rounded-xl border border-amber-600/30 bg-amber-600/5 p-4 text-sm leading-5"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><p><strong>Check source version:</strong> {flag}</p></div>)}
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 sm:p-6"><FormulaDisplay reference={selectedReference} /></div>
          <label className="mt-4 block max-w-md text-sm font-semibold">{selectedReference.calculatorId === "sail-sbd-2024-civil" ? "Original price P₀, excluding taxes and duties (₹)" : "Eligible work value for this period (₹)"}
            <input className={inputClass} type="number" min="0" step="0.01" value={values.workValue || ""} onChange={(event) => setValues((previous) => ({ ...previous, workValue: event.target.value === "" ? 0 : Number(event.target.value) }))} />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">{selectedReference.calculatorId === "sail-sbd-2024-civil" ? "Use the civil works amount P₀ shown in the contract price schedule, excluding taxes and duties." : "Exclude items listed in the contract clause. This tool does not determine the eligible certified amount."}</span>
          </label>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Base and current index inputs for each formula component</caption>
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-3 py-3">Component / source</th><th scope="col" className="px-3 py-3">Coefficient</th><th scope="col" className="px-3 py-3">Base value</th><th scope="col" className="px-3 py-3">Current value</th></tr></thead>
              <tbody className="divide-y divide-border">{selectedReference.components.map((component) => <tr key={component.key}><th scope="row" className="px-3 py-3 font-semibold">{component.label}<span className="mt-1 block max-w-xs text-xs font-normal text-muted-foreground">{component.source}</span></th><td className="px-3 py-3">{numberText(component.coefficient)}</td><td className="px-3 py-2"><label className="sr-only">Base {component.label}</label><input aria-label={`Base ${component.label}`} className="h-10 w-32 rounded-lg border border-border bg-background px-2" type="number" min="0.000001" step="any" value={Number.isFinite(values.base[component.key]) ? values.base[component.key] : ""} onChange={(event) => setIndex(component.key, "base", event.target.value)} /></td><td className="px-3 py-2"><label className="sr-only">Current {component.label}</label><input aria-label={`Current ${component.label}`} className="h-10 w-32 rounded-lg border border-border bg-background px-2" type="number" min="0" step="any" value={Number.isFinite(values.current[component.key]) ? values.current[component.key] : ""} onChange={(event) => setIndex(component.key, "current", event.target.value)} /></td></tr>)}</tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => runCalculation(selectedReference)} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:brightness-110">Calculate adjustment</button>{calcError && <p role="alert" className="text-sm font-medium text-red-600">{calcError}</p>}</div>
          {result && <div className="mt-5 rounded-xl border border-border p-4 sm:p-5" aria-live="polite"><p className="text-sm font-bold">Calculation steps</p><ol className="mt-3 space-y-2 text-sm text-muted-foreground"><li>Fixed component: {selectedReference.calculatorId === "sail-sbd-2024-civil" ? "0.35" : "A = 0.40"}</li>{result.components.map((component) => <li key={component.label}>{component.label}: {numberText(component.coefficient)} × ({numberText(component.current)} ÷ {numberText(component.base)}) = {numberText(component.contribution)}</li>)}<li className="border-t border-border pt-2 font-mono text-foreground">{selectedReference.calculatorId === "sail-sbd-2024-civil" ? "Weighted factor" : "Pn"} = {numberText(result.factor)}</li>{selectedReference.calculatorId === "sail-sbd-2024-civil" ? <><li className="font-mono text-foreground">P = {money(values.workValue)} × {numberText(result.factor)} = {money(values.workValue + result.adjustment)}</li><li className="font-mono text-foreground">Adjustment = P − P₀ = {money(values.workValue + result.adjustment)} − {money(values.workValue)} = {money(result.adjustment)}</li></> : <li className="font-mono text-foreground">Adjustment = ( {numberText(result.factor)} − 1 ) × {money(values.workValue)}</li>}</ol><div className={`mt-4 flex items-center gap-2 text-lg font-bold ${result.adjustment < 0 ? "text-amber-700" : "text-primary"}`}>{result.adjustment < 0 ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}{result.adjustment < 0 ? "Decrease" : result.adjustment > 0 ? "Increase" : "No change"}: {money(Math.abs(result.adjustment))}</div><p className="mt-2 text-xs text-muted-foreground">{selectedReference.calculatorId === "sail-sbd-2024-civil" ? "Calculated adjustment before applying any remaining cumulative contract ceiling or taxes. This is arithmetic only and does not decide contractual entitlement." : `Price adjustment factor Pn: ${numberText(result.factor)}. Result is arithmetic only and does not decide contractual entitlement.`}</p></div>}
        </> : <p className="mt-4 text-sm text-muted-foreground">Choose a record with a verified formula to calculate. No general or illustrative formula is used.</p>}
      </section>

      <section id="eligibility" className={sectionClass}>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Contract-specific checks</p><h2 className="mt-1 text-xl font-bold">Applicability checker</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">A project’s duration alone does not establish price variation eligibility. Check the signed contract, applicable category, amendments, and the actual PVC clause.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Organisation<select className={inputClass} value={organization} onChange={(event) => { const nextOrganization = event.target.value; const nextReference = priceVariationReferences.find((reference) => reference.organization === nextOrganization); setOrganization(nextOrganization); setSelectedId(nextReference?.id ?? ""); setCategory(""); setChecked(false); setResult(null); setCalcError(""); }}><option value="">Select organisation</option>{organizations.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
          <label className="text-sm font-semibold">Contract category<select className={inputClass} value={category} onChange={(event) => { setCategory(event.target.value); setChecked(false); }}><option value="">Select category</option>{[...new Set(priceVariationReferences.map((reference) => reference.contractCategory))].map((item) => <option key={item} value={item}>{item}</option>)}<option value="other">Other / not listed</option></select></label>
          <label className="text-sm font-semibold">Contract duration (months)<input className={inputClass} type="number" min="0.1" step="0.1" value={duration} onChange={(event) => { setDuration(event.target.value); setChecked(false); }} /></label>
          <YesNo label="Does the signed contract contain the cited PVC clause?" value={hasClause} onChange={(value) => { setHasClause(value); setChecked(false); }} />
          {selectedReference?.calculatorId === "sail-sbd-2024-civil" ? <>
            <YesNo label="Is the civil work within the scheduled completion period?" value={withinSchedule} onChange={(value) => { setWithinSchedule(value); setChecked(false); }} />
            {Number(duration) > 0 && Number(duration) <= 12 && <YesNo label="Does the signed contract specifically allow price variation for this contract term?" value={specificException} onChange={(value) => { setSpecificException(value); setChecked(false); }} />}
          </> : <YesNo label="Does it identify this same package and contract category?" value={isSamePackage} onChange={(value) => { setIsSamePackage(value); setChecked(false); }} />}
          <YesNo label="Are amendments and related clauses consistent?" value={hasConflicts} onChange={(value) => { setHasConflicts(value); setChecked(false); }} allowNo />
        </div>
        <button type="button" className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-bold hover:border-primary hover:text-primary" onClick={() => setChecked(true)}>Check applicability</button>
        {checked && <div role="status" className={`mt-4 flex gap-3 rounded-xl border p-4 ${applicabilityIndicated ? "border-emerald-600/30 bg-emerald-600/5" : "border-amber-600/30 bg-amber-600/5"}`}>{applicabilityIndicated ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />}<div><p className="font-bold">{applicabilityIndicated ? "Conditions may fit this reference — verify the executed contract" : "Eligibility not established"}</p><p className="mt-1 text-sm text-muted-foreground">{hasConflicts === "yes" ? "Conflicting clauses or amendments are reported. Review them before reaching a conclusion; this checker does not reconcile conflicts." : selectedReference?.calculatorId === "sail-sbd-2024-civil" ? "The SAIL standard clause refers to contracts over 12 months unless the contract specifically says otherwise. It also limits adjustment based on the scheduled completion period. Confirm the signed terms and any amendments." : "The provided details do not establish that this package-specific clause governs the contract. Duration alone is not an eligibility rule."}</p></div></div>}
      </section>

      <section id="sources" className={sectionClass}>
        <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Source documents and verification</h2></div>
        {selectedReference ? <div className="mt-4 space-y-2 text-sm"><p><strong>Record:</strong> {selectedReference.contractName}</p><p><strong>Clause:</strong> {selectedReference.clause}</p><p><strong>Verified:</strong> {new Date(`${selectedReference.verifiedOn}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "long" })}</p><p className="text-muted-foreground">{selectedReference.verificationNote}</p><a className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline" href={selectedReference.sourceUrl} target="_blank" rel="noreferrer">Open {selectedReference.organization} source document <ExternalLink className="h-4 w-4" /></a>{selectedReference.relatedSourceUrl && <p><a className="inline-flex items-center gap-2 font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline" href={selectedReference.relatedSourceUrl} target="_blank" rel="noreferrer">{selectedReference.relatedSourceLabel} <ExternalLink className="h-4 w-4" /></a></p>}</div> : <p className="mt-3 text-sm text-muted-foreground">Select a reference record to see its source.</p>}
        <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">These reference terms may be changed in a tender’s signed contract or amendments. Check the complete contract and current index publications before relying on a calculation.</p>
      </section>
    </div>
  );
}

function YesNo({ label, value, onChange, allowNo = false }: { label: string; value: string; onChange: (value: string) => void; allowNo?: boolean }) {
  return <label className="text-sm font-semibold">{label}<select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select</option><option value="yes">Yes</option><option value="no">{allowNo ? "No conflicts found" : "No"}</option><option value="unknown">Unknown</option></select></label>;
}

function FormulaDisplay({ reference }: { reference: PriceVariationReference }) {
  if (reference.calculatorId === "sail-sbd-2024-civil") {
    return <>
      <div role="math" aria-label={reference.formulaText} className="mx-auto flex min-w-max items-center justify-center gap-x-2 text-base sm:text-lg">
        <span>P = P₀ × [0.35 +</span><span>0.25 ×</span><Fraction numerator="RBIᵢ(cement)" denominator="RBI₀(cement)" /><span>+ 0.10 ×</span><Fraction numerator="RBIᵢ(steel)" denominator="RBI₀(steel)" /><span>+ 0.30 ×</span><Fraction numerator="LTR" denominator="LTO" /><span>]</span>
      </div>
      <p className="sr-only">{reference.formulaText}</p>
    </>;
  }

  return <>
    <div role="math" aria-label={reference.formulaText} className="mx-auto flex min-w-max items-center justify-center gap-x-2 text-base sm:text-lg">
      <span>pₙ = A +</span><span>b ×</span><Fraction numerator="Lₙ" denominator="L₀" /><span>+ c ×</span><Fraction numerator="Mₙ" denominator="M₀" /><span>+ d ×</span><Fraction numerator="Fₙ" denominator="F₀" /><span>+ e ×</span><Fraction numerator="Bₙ" denominator="B₀" />
    </div>
    <p className="sr-only">{reference.formulaText}</p>
  </>;
}

function Fraction({ numerator, denominator }: { numerator: string; denominator: string }) {
  return <span aria-hidden="true" className="inline-flex shrink-0 flex-col items-center text-center text-sm leading-5"><span className="px-1">{numerator}</span><span className="w-full border-t border-current px-1">{denominator}</span></span>;
}

function ReferenceSummary({ reference, onSelect }: { reference: PriceVariationReference; onSelect: () => void }) {
  return <article className="rounded-xl border border-border p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{reference.organization}</p><h3 className="mt-1 font-bold">{reference.contractName}</h3><p className="mt-1 text-sm text-muted-foreground">{reference.contractCategory}</p></div><button type="button" onClick={onSelect} className="shrink-0 self-start rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary">Open calculator</button></div>{reference.reviewFlags?.map((flag) => <p key={flag} className="mt-3 rounded-lg border border-amber-600/30 bg-amber-600/5 p-3 text-sm leading-5"><strong>Review:</strong> {flag}</p>)}<dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2"><div className="sm:col-span-2"><dt className="font-semibold">Formula</dt><dd className="mt-2 overflow-x-auto rounded-lg bg-muted/40 p-3"><FormulaDisplay reference={reference} /></dd></div><div><dt className="font-semibold">Clause and base date</dt><dd className="mt-1 text-muted-foreground">{reference.clause}<br />{reference.baseDateRule}</dd></div><div><dt className="font-semibold">Adjustment frequency</dt><dd className="mt-1 text-muted-foreground">{reference.adjustmentFrequency}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">Ceiling</dt><dd className="mt-1 text-muted-foreground">{reference.ceiling}</dd></div></dl><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold">Applicability, variable definitions, index sources, and exclusions</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{reference.applicability.map((item) => <li key={item}>{item}</li>)}{reference.variables?.map((item) => <li key={item.symbol}><strong>{item.symbol}:</strong> {item.definition}</li>)}{reference.components.map((component) => <li key={component.key}>{component.symbol}: {component.source}; coefficient {numberText(component.coefficient)}.</li>)}{reference.exclusions.map((item) => <li key={item}>Excluded / condition: {item}</li>)}</ul></details></article>;
}
