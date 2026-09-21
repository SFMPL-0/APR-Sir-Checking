import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Info,
  Layers,
  Percent,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Sliders,
  TrendingDown,
  TrendingUp,
  Truck,
} from 'lucide-react';
import {
  CalculationInput,
  CalculationResult,
  ExpenseItem,
  GeneralSettings,
  InterestTranche,
  MasterDataItem,
  MasterDataKind,
  TdsRefundSettings,
} from '../types';
import { formatCurrency, formatPercent } from '../services/calculationEngine';
import { SearchableSelect } from './SearchableSelect';

interface DashboardViewProps {
  input: CalculationInput;
  setInput: React.Dispatch<React.SetStateAction<CalculationInput>>;
  result: CalculationResult;
  expenses: ExpenseItem[];
  interestTranches: InterestTranche[];
  tdsSettings: TdsRefundSettings;
  generalSettings: GeneralSettings;
  onNavigateTab: (tab: string) => void;
  onSaveCalculation: () => void;
  onExportExcel: () => void;
  onPrintReport: (showFormulas?: boolean) => void;
  onExportPdf?: (showFormulas?: boolean) => void;
  clients: MasterDataItem[];
  truckTypes: MasterDataItem[];
  locations: MasterDataItem[];
  onAddMasterData: (
    kind: MasterDataKind,
    name: string
  ) => Promise<MasterDataItem | null>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  input,
  setInput,
  result,
  expenses,
  interestTranches,
  tdsSettings,
  generalSettings,
  onNavigateTab,
  onSaveCalculation,
  onExportExcel,
  onPrintReport,
  onExportPdf,
  clients,
  truckTypes,
  locations,
  onAddMasterData,
}) => {
  const [quickDays, setQuickDays] = useState<number>(input.customDays ?? 20);
  const [quickRate, setQuickRate] = useState<number>(
    input.customInterestRate ?? 1.0
  );
  // When off, printed/exported reports drop the "Formula / Basis" column
  // and show only the final amounts — a clean statement for handing to a
  // client without walking them through how the numbers were derived.
  const [showFormulas, setShowFormulas] = useState(true);

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setInput((prev) => ({ ...prev, sellingPrice: val }));
  };

  const handleBuyingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setInput((prev) => ({ ...prev, buyingPrice: val }));
  };

  const handleDaysSlider = (days: number) => {
    setQuickDays(days);
    setInput((prev) => ({ ...prev, customDays: days }));
  };

  const handleRateSlider = (rate: number) => {
    setQuickRate(rate);
    setInput((prev) => ({ ...prev, customInterestRate: rate }));
  };

  const resetQuickSliders = () => {
    setQuickDays(20);
    setQuickRate(1.0);
    setInput((prev) => {
      const copy = { ...prev };
      delete copy.customDays;
      delete copy.customInterestRate;
      return copy;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with Quick Actions */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Freight Profit Analysis • Financial Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
              {input.clientName ||
                (input.fromLocation && input.toLocation
                  ? `${input.fromLocation} → ${input.toLocation}`
                  : input.title) ||
                'Freight Profit & Tax Computation'}
            </h1>
            <p className="text-sm text-slate-400">
              Trip Ref: <span className="text-slate-200 font-mono font-medium">{input.tripNumber || 'TR-001'}</span>
              {input.fromLocation && input.toLocation && (
                <> • Route: <span className="text-slate-200 font-medium">{input.fromLocation} → {input.toLocation}</span></>
              )}
              {input.truckType && (
                <> • Truck: <span className="text-slate-200 font-medium">{input.truckType}</span></>
              )}
              {' '}• Currency: {generalSettings.currencyCode} ({generalSettings.currencySymbol})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showFormulas}
                onChange={(e) => setShowFormulas(e.target.checked)}
                className="accent-amber-500"
              />
              Show Formulas in Print/PDF
            </label>
            <button
              id="btn-save-calc"
              onClick={onSaveCalculation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Trip</span>
            </button>
            <button
              id="btn-export-pdf"
              onClick={() => (onExportPdf || onPrintReport)(showFormulas)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
              title="Export official PDF report to mobile storage"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Export</span>
            </button>
            <button
              id="btn-print-report"
              onClick={() => onPrintReport(showFormulas)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold shadow-md transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Warning Banners if any */}
        {result.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs space-y-1">
            {result.warnings.map((warn, i) => (
              <div key={i} className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Revenue Inputs & Quick Adjusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Input Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Core Trip Pricing</span>
            </h2>
            <span className="text-xs text-slate-400">Live Auto-calc</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Selling Price (Freight Charged to Client)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {generalSettings.currencySymbol}
                </span>
                <input
                  id="input-selling-price"
                  type="number"
                  step="100"
                  min="0"
                  value={input.sellingPrice || ''}
                  onChange={handleSellingPriceChange}
                  className="w-full bg-slate-900/90 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-8 pr-4 py-2.5 text-lg font-bold text-white tracking-wide"
                  placeholder="51500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Buying Price (Vehicle Hire / Lorry Payment)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {generalSettings.currencySymbol}
                </span>
                <input
                  id="input-buying-price"
                  type="number"
                  step="100"
                  min="0"
                  value={input.buyingPrice || ''}
                  onChange={handleBuyingPriceChange}
                  className="w-full bg-slate-900/90 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-8 pr-4 py-2.5 text-lg font-bold text-white tracking-wide"
                  placeholder="48000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Trip / LR No.
                </label>
                <input
                  type="text"
                  value={input.tripNumber || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, tripNumber: e.target.value }))
                  }
                  placeholder="TR-001"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <SearchableSelect
                label="Client Name"
                value={input.clientName || ''}
                onChange={(v) => setInput((p) => ({ ...p, clientName: v }))}
                options={clients}
                onAddNew={(name) => onAddMasterData('clients', name)}
                placeholder="Search or add client…"
              />
              <SearchableSelect
                label="From"
                value={input.fromLocation || ''}
                onChange={(v) => setInput((p) => ({ ...p, fromLocation: v }))}
                options={locations}
                onAddNew={(name) => onAddMasterData('locations', name)}
                placeholder="Origin"
              />
              <SearchableSelect
                label="To"
                value={input.toLocation || ''}
                onChange={(v) => setInput((p) => ({ ...p, toLocation: v }))}
                options={locations}
                onAddNew={(name) => onAddMasterData('locations', name)}
                placeholder="Destination"
              />
              <SearchableSelect
                label="Truck Type"
                value={input.truckType || ''}
                onChange={(v) => setInput((p) => ({ ...p, truckType: v }))}
                options={truckTypes}
                onAddNew={(name) => onAddMasterData('truck_types', name)}
                placeholder="Search or add truck type…"
              />
            </div>
          </div>
        </div>

        {/* Middle: Quick Sliders for Days & Interest */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Fast Fin-Adjusters</span>
            </h2>
            <button
              onClick={resetQuickSliders}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Payment Cycle / Days</span>
                <span className="text-amber-400 font-bold text-sm">
                  {quickDays} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                value={quickDays}
                onChange={(e) => handleDaysSlider(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span
                  onClick={() => handleDaysSlider(7)}
                  className="cursor-pointer hover:text-white"
                >
                  7d
                </span>
                <span
                  onClick={() => handleDaysSlider(15)}
                  className="cursor-pointer hover:text-white"
                >
                  15d
                </span>
                <span
                  onClick={() => handleDaysSlider(20)}
                  className="cursor-pointer text-amber-400 font-semibold"
                >
                  20d (Default)
                </span>
                <span
                  onClick={() => handleDaysSlider(45)}
                  className="cursor-pointer hover:text-white"
                >
                  45d
                </span>
                <span
                  onClick={() => handleDaysSlider(60)}
                  className="cursor-pointer hover:text-white"
                >
                  60d
                </span>
                <span
                  onClick={() => handleDaysSlider(90)}
                  className="cursor-pointer hover:text-white"
                >
                  90d
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Interest Rate (p.a.)</span>
                <span className="text-blue-400 font-bold text-sm">
                  {quickRate.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={quickRate}
                onChange={(e) => handleRateSlider(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span
                  onClick={() => handleRateSlider(0.5)}
                  className="cursor-pointer hover:text-white"
                >
                  0.5%
                </span>
                <span
                  onClick={() => handleRateSlider(1.0)}
                  className="cursor-pointer text-blue-400 font-semibold"
                >
                  1.0% (Default)
                </span>
                <span
                  onClick={() => handleRateSlider(1.5)}
                  className="cursor-pointer hover:text-white"
                >
                  1.5%
                </span>
                <span
                  onClick={() => handleRateSlider(2.0)}
                  className="cursor-pointer hover:text-white"
                >
                  2.0%
                </span>
                <span
                  onClick={() => handleRateSlider(3.0)}
                  className="cursor-pointer hover:text-white"
                >
                  3.0%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Margin Gauge / Health */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Profit Margin Pulse
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  result.profitAfterTax >= 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {result.profitAfterTax >= 0 ? 'Profitable' : 'Loss Trip'}
              </span>
            </div>
            <div className="text-3xl font-black text-white">
              {formatPercent(result.percentageOfSale, 2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              PAT as percentage of Selling Price.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Net Profit (with TDS):</span>
              <span className="font-bold text-amber-400 font-mono">
                {formatCurrency(result.tdsRefund.netProfitWithTdsSaving, generalSettings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">% Profit After TDS Saving:</span>
              <span className="font-black text-cyan-300 font-mono">
                {formatPercent(result.tdsRefund.percentageOfProfitAfterTdsSaving, 2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Gross Margin:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {formatPercent(result.grossProfitMargin, 2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tax Liability (27%):</span>
              <span className="font-semibold text-rose-300 font-mono">
                {formatCurrency(result.incomeTax, generalSettings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Dashboard Metric Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Key Financial Summary Cards</span>
          </h2>
          <button
            onClick={() => onNavigateTab('details')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <span>View Formula Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {/* 1. Selling Price */}
          <div
            id="card-selling-price"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>1. Selling Price</span>
              <span className="text-blue-400 text-[10px]">Client Rate</span>
            </div>
            <div className="text-lg md:text-xl font-black text-white mt-1 tracking-tight">
              {formatCurrency(result.sellingPrice, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Base revenue billing
            </div>
          </div>

          {/* 2. Buying Price */}
          <div
            id="card-buying-price"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>2. Buying Price</span>
              <span className="text-slate-400 text-[10px]">Lorry Hire</span>
            </div>
            <div className="text-lg md:text-xl font-black text-white mt-1 tracking-tight">
              {formatCurrency(result.buyingPrice, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Direct transport cost
            </div>
          </div>

          {/* 3. Gross Profit */}
          <div
            id="card-gross-profit"
            className={`border rounded-2xl p-4 transition shadow-sm ${
              result.grossProfit >= 0
                ? 'bg-slate-800/90 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-400'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>3. Gross Profit</span>
              <span className="text-xs font-bold text-emerald-400">
                {result.grossProfitMargin}%
              </span>
            </div>
            <div className="text-lg md:text-xl font-black text-white mt-1 tracking-tight">
              {formatCurrency(result.grossProfit, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Selling Price − Buying Price
            </div>
          </div>

          {/* 4. Total Expenses */}
          <div
            id="card-total-expenses"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>4. Total Expenses</span>
              <span className="text-amber-400 text-[10px]">
                Int: {formatCurrency(result.totalInterest, generalSettings.currencySymbol)}
              </span>
            </div>
            <div className="text-lg md:text-xl font-black text-amber-300 mt-1 tracking-tight">
              {formatCurrency(result.netTotalExpenses, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              TDS, Salaries, Mgmt, Commission & Interest
            </div>
          </div>

          {/* 5. Net Profit Before Tax */}
          <div
            id="card-npbt"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>5. Net Profit Before Tax</span>
              <span className="text-blue-400 text-[10px]">NPBT</span>
            </div>
            <div
              className={`text-lg md:text-xl font-black mt-1 tracking-tight ${
                result.netProfitBeforeTax >= 0
                  ? 'text-white'
                  : 'text-rose-400'
              }`}
            >
              {formatCurrency(result.netProfitBeforeTax, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Gross Profit − Net Total Expenses
            </div>
          </div>

          {/* 6. Income Tax */}
          <div
            id="card-income-tax"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>6. Income Tax</span>
              <span className="text-rose-400 text-[10px]">{result.incomeTaxRate}% Rate</span>
            </div>
            <div className="text-lg md:text-xl font-black text-rose-300 mt-1 tracking-tight">
              {formatCurrency(result.incomeTax, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {result.incomeTaxRate}% on NPBT
            </div>
          </div>

          {/* 7. Profit After Tax */}
          <div
            id="card-pat"
            className={`border rounded-2xl p-4 transition shadow-sm ${
              result.profitAfterTax >= 0
                ? 'bg-slate-800/90 border-emerald-500/50'
                : 'bg-rose-950/40 border-rose-500/50'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>7. Profit After Tax</span>
              <span className="text-emerald-400 text-[10px] font-bold">PAT</span>
            </div>
            <div
              className={`text-lg md:text-xl font-black mt-1 tracking-tight ${
                result.profitAfterTax >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(result.profitAfterTax, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              NPBT − Income Tax
            </div>
          </div>

          {/* 8. TDS Saving */}
          <div
            id="card-tds-saving"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>8. Net Saving in TDS</span>
              <span className="text-amber-400 text-[10px]">Refund Gain</span>
            </div>
            <div className="text-lg md:text-xl font-black text-amber-300 mt-1 tracking-tight">
              {formatCurrency(result.tdsRefund.netSavingInTds, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              TDS − Cost + IT Int − Tax
            </div>
          </div>

          {/* 9. Profit Percentage */}
          <div
            id="card-profit-percentage"
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 hover:border-slate-600 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>9. Percentage of Sale</span>
              <span className="text-cyan-400 text-[10px]">PAT / SP</span>
            </div>
            <div className="text-lg md:text-xl font-black text-cyan-300 mt-1 tracking-tight">
              {formatPercent(result.percentageOfSale, 2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              PAT ÷ Selling Price × 100
            </div>
          </div>

          {/* 10. Net Profit = Profit After Tax + Net Saving in TDS */}
          <div
            id="card-net-profit-tds"
            className="bg-emerald-950/20 border border-emerald-500/50 rounded-2xl p-4 hover:border-emerald-400 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span className="font-bold text-emerald-300">10. Net Profit</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                NPBT + TDS
              </span>
            </div>
            <div className="text-lg md:text-xl font-black text-emerald-300 mt-1 tracking-tight">
              {formatCurrency(result.tdsRefund.netProfitWithTdsSaving, generalSettings.currencySymbol)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Profit After Tax + Net Saving in TDS
            </div>
          </div>

          {/* 11. % of Profit After TDS Saving */}
          <div
            id="card-pct-profit-tds"
            className="bg-cyan-950/20 border border-cyan-500/50 rounded-2xl p-4 hover:border-cyan-400 transition shadow-sm"
          >
            <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span className="font-bold text-cyan-300">11. % Profit After TDS</span>
              <span className="text-cyan-400 text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
                NP / SP × 100
              </span>
            </div>
            <div className="text-lg md:text-xl font-black text-cyan-300 mt-1 tracking-tight">
              {formatPercent(result.tdsRefund.percentageOfProfitAfterTdsSaving, 2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Net Profit ÷ Selling Price × 100
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cost Distribution Visualizer */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-cyan-400" />
            <span>Selling Price Capital Split</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total SP = {formatCurrency(result.sellingPrice, generalSettings.currencySymbol)}
          </span>
        </div>

        {/* Stacked bar */}
        {result.sellingPrice > 0 && (
          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{
                width: `${Math.min(
                  100,
                  (result.buyingPrice / result.sellingPrice) * 100
                )}%`,
              }}
              className="bg-slate-500 h-full"
              title={`Buying Price: ${formatCurrency(result.buyingPrice, generalSettings.currencySymbol)}`}
            />
            <div
              style={{
                width: `${Math.min(
                  100,
                  (result.totalOperatingExpenses / result.sellingPrice) * 100
                )}%`,
              }}
              className="bg-amber-500 h-full"
              title={`Operating Expenses: ${formatCurrency(result.totalOperatingExpenses, generalSettings.currencySymbol)}`}
            />
            <div
              style={{
                width: `${Math.min(
                  100,
                  (result.totalInterest / result.sellingPrice) * 100
                )}%`,
              }}
              className="bg-indigo-500 h-full"
              title={`Interest Cost: ${formatCurrency(result.totalInterest, generalSettings.currencySymbol)}`}
            />
            <div
              style={{
                width: `${Math.min(
                  100,
                  (result.incomeTax / result.sellingPrice) * 100
                )}%`,
              }}
              className="bg-rose-500 h-full"
              title={`Income Tax: ${formatCurrency(result.incomeTax, generalSettings.currencySymbol)}`}
            />
            <div
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, (result.profitAfterTax / result.sellingPrice) * 100)
                )}%`,
              }}
              className="bg-emerald-500 h-full"
              title={`Profit After Tax: ${formatCurrency(result.profitAfterTax, generalSettings.currencySymbol)}`}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">
              Lorry Cost: {formatCurrency(result.buyingPrice, generalSettings.currencySymbol)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">
              Expenses: {formatCurrency(result.totalOperatingExpenses, generalSettings.currencySymbol)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-400">
              Interest: {formatCurrency(result.totalInterest, generalSettings.currencySymbol)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">
              Tax: {formatCurrency(result.incomeTax, generalSettings.currencySymbol)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-semibold">
              Net PAT: {formatCurrency(result.profitAfterTax, generalSettings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
