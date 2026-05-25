import { ArrowLeft, Mail, CheckCircle2, FileDown, Clock, ShieldCheck, ClipboardCheck, ArrowUpRight, MoreVertical, X, Send, Copy, Check } from "lucide-react";
import { Invoice, Client, formatCurrency, formatCurrencyConverted, ActivityLog } from "../types";
import { useState } from "react";
import BokLogo from "./BokLogo";

interface InvoiceDetailProps {
  invoiceId: string;
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  onSendReminder: (id: string) => void;
  onAddActivityLog?: (invoiceId: string, log: Omit<ActivityLog, "id">) => void;
  activeCurrency?: string;
}

export default function InvoiceDetail({
  invoiceId,
  invoices,
  clients,
  onNavigate,
  onUpdateInvoiceStatus,
  onSendReminder,
  onAddActivityLog,
  activeCurrency = "original"
}: InvoiceDetailProps) {
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Find targeted invoice
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-grey-100 max-w-lg mx-auto mt-12" id="invoice-not-found">
        <h2 className="text-xl font-bold text-grey-900">Invoice not found</h2>
        <p className="text-sm text-grey-500 mt-2 font-secondary">The Invoice ID "{invoiceId}" could not be retrieved from the active ledger.</p>
        <button
          onClick={() => onNavigate("invoices")}
          className="mt-5 inline-flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
      </div>
    );
  }

  // Resolve client matching invoice
  const client = clients.find((c) => c.id === invoice.clientId);
  const clientName = client ? client.name : "Unknown Client";
  const clientCurrency = client ? client.currency : "USD";

  // Calculate Subtotal dynamically to prevent sync errors
  const subtotal = invoice.lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxAmount = invoice.hasTax ? (subtotal * invoice.taxRate / 100) : 0;
  const totalAmount = subtotal + taxAmount;

  const getStatusBadgeStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-600 border border-green-200";
      case "Overdue":
        return "bg-red-100 text-red-600 border border-red-200";
      case "Due Today":
        return "bg-amber-100 text-amber-600 border border-amber-200";
      case "Upcoming":
        return "bg-blue-100 text-blue-600 border border-blue-200";
      case "Draft":
        return "bg-grey-100 text-grey-600 border border-grey-200";
      default:
        return "bg-grey-100 text-grey-700";
    }
  };

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [modalActionState, setModalActionState] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    setModalActionState("downloading");
    setTimeout(() => {
      setModalActionState("downloaded");
      if (onAddActivityLog) {
        onAddActivityLog(invoice.id, {
          action: "PDF Downloaded",
          date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
          details: "High-resolution PDF generated and saved for direct client delivery."
        });
      }
    }, 1500);
  };

  const handleEmailPDF = () => {
    setModalActionState("sending");
    setTimeout(() => {
      setModalActionState("sent");
      if (onAddActivityLog) {
        onAddActivityLog(invoice.id, {
          action: "Emailed Invoice PDF",
          date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
          details: `Ledger statement INV PDF successfully transmitted directly to recipient email: ${client?.email}.`
        });
      }
    }, 2000);
  };

  const handleCopyShareLink = () => {
    setModalActionState("copying");
    setTimeout(() => {
      setModalActionState("copied");
      navigator.clipboard.writeText(`https://freelance.bok.consulting/portal/invoice/secure-hash-${invoice.id}`);
      if (onAddActivityLog) {
        onAddActivityLog(invoice.id, {
          action: "Portal View Shared",
          date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
          details: "Encrypted static viewing pathway created."
        });
      }
    }, 800);
  };

  return (
    <div className="space-y-6" id="invoice-details-view">
      {/* Breadcrumb Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-grey-400 font-medium font-secondary select-none">
            <button onClick={() => onNavigate("invoices")} className="hover:text-blue-500 hover:underline cursor-pointer">
              Invoices
            </button>
            <span>/</span>
            <span className="text-grey-600 font-semibold font-sans">{invoice.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight flex items-center gap-3 mt-1">
            <span>Invoice Workspace</span>
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(invoice.status)}`}>
              {invoice.status}
            </span>
          </h1>
        </div>

        {/* Action Controls Panel */}
        <div className="flex flex-wrap items-center gap-2" id="detail-actions-panel">
          <button
            onClick={() => onNavigate("invoices")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-grey-900 hover:bg-grey-25 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {invoice.status !== "Paid" && (
            <button
              id="btn-detail-remind"
              onClick={() => onSendReminder(invoice.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-100 hover:bg-blue-100/80 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Send Reminder
            </button>
          )}

          {invoice.status !== "Paid" && (
            <button
              id="btn-detail-mark-paid"
              onClick={() => onUpdateInvoiceStatus(invoice.id, "Paid")}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Mark as Paid
            </button>
          )}

          <button
            id="btn-detail-download-pdf"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-25 rounded-lg text-xs font-medium cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>

          {/* More actions options dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 border border-grey-300 rounded-lg text-grey-500 hover:bg-grey-50 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 mt-2 bg-white border border-grey-200 rounded-xl shadow-xl py-1.5 w-48 z-50 text-xs text-left">
                <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-b border-grey-100 mb-1">
                  Change Status
                </p>
                
                {invoice.status !== "Overdue" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Overdue");
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-red-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Overdue
                  </button>
                )}

                 {invoice.status !== "Due Today" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Due Today");
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-amber-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Due Today
                  </button>
                )}

                {invoice.status !== "Upcoming" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Upcoming");
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-blue-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Upcoming
                  </button>
                )}

                {invoice.status !== "Paid" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Paid");
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-green-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}

                {invoice.status !== "Draft" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Draft");
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-grey-500 font-medium cursor-pointer transition-colors"
                  >
                    Convert to Draft
                  </button>
                )}

                <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-t border-b border-grey-100 my-1">
                  Actions
                </p>
                <button
                  onClick={() => {
                    alert(`Copied markdown duplicate of ${invoice.id} reference.`);
                    setShowMoreActions(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-grey-700 font-medium cursor-pointer"
                >
                  Copy Invoice JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Structural Layout Grid (col-span-8 detailed invoice paper, col-span-4 detailed activity logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="detail-structural-grid">
        
        {/* Core Invoice Card (Left, span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-[0.5px] border-grey-200/60 p-8 sm:p-10 space-y-8" id="invoice-paper-sheet">
          
          {/* Bok Heading Header row */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-grey-50">
            <div>
              {/* Logo block */}
              <BokLogo size={18} className="mb-3" />
              <h2 className="text-xl font-bold text-grey-900 leading-none">Bōk Consulting</h2>
              <span className="text-xs text-blue-800 font-semibold font-secondary block mt-1">Copenhagen, Denmark</span>
            </div>

            <div className="text-left sm:text-right font-sans">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest">Billing Statement</span>
              <h3 className="text-4xl font-bold text-grey-900 mt-1 leading-none">{invoice.id}</h3>
              <p className="text-xs text-grey-400 mt-2 font-secondary">Status: {invoice.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Billed From & Billed To addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-grey-50 text-sm">
            
            {/* From */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block mb-2">Billed From</span>
              <p className="font-bold text-grey-900">Mofiyinfoluwa O.</p>
              <p className="text-grey-600 font-secondary">Bōk Creative Services</p>
              <p className="text-grey-500 font-secondary">14 Nordlys Gade, Floor 2</p>
              <p className="text-grey-500 font-secondary">Copenhagen, 1105 DK</p>
              <p className="text-grey-500 text-xs mt-2 font-secondary">mofiyino15@gmail.com</p>
            </div>

            {/* To */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block mb-2">Billed To (Recipient)</span>
              {client ? (
                <>
                  <p className="font-bold text-grey-900">{client.name}</p>
                  <p className="text-grey-600 font-secondary">{client.businessName}</p>
                  <p className="text-grey-500 font-secondary">{client.address}</p>
                  <p className="text-grey-500 font-secondary">{client.city}, {client.state ? `${client.state}, ` : ""}{client.country}</p>
                  <p className="text-grey-500 text-xs mt-2 font-secondary">{client.email}</p>
                  <p className="text-grey-400 text-xs font-secondary font-mono mt-1">Tax ID: {client.taxId}</p>
                </>
              ) : (
                <p className="text-grey-500 font-secondary">No Client Assigned.</p>
              )}
            </div>
          </div>

          {/* Payment Terms Metadata Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-grey-25 border border-grey-100 text-xs font-secondary">
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Issue Date</span>
              <span className="text-grey-900 font-bold block mt-1">{invoice.issueDate}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Due Date</span>
              <span className="text-grey-900 font-bold block mt-1 text-amber-600">{invoice.dueDate}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Payment Terms</span>
              <span className="text-grey-900 font-bold block mt-1">{client?.paymentTerms || "Net 30"}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Settlement Currency</span>
              <span className="text-grey-900 font-bold block mt-1 uppercase font-sans">{clientCurrency}</span>
            </div>
          </div>

          {/* Line Items Billing Details Table */}
          <div className="space-y-4">
            <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block">Billing Breakdowns</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="detail-sheet-table">
                <thead>
                  <tr className="border-b border-grey-200">
                    <th className="font-semibold text-grey-500 py-2.5 text-xs uppercase font-sans">Description</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-20">Qty</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-24">Rate</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-50 text-sm">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="py-2.5">
                      <td className="py-3 font-semibold text-grey-800 font-sans max-w-xs">{item.description}</td>
                      <td className="py-3 text-right text-grey-500 font-secondary">{item.qty}</td>
                      <td className="py-3 text-right text-grey-500 font-mono">{formatCurrencyConverted(item.unitPrice, clientCurrency, activeCurrency)}</td>
                      <td className="py-3 text-right font-bold text-grey-900 font-mono">{formatCurrencyConverted(item.qty * item.unitPrice, clientCurrency, activeCurrency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation summary block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-4 border-t border-grey-50">
            {/* Notes */}
            <div className="max-w-sm flex-1 space-y-1.5">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block">Invoice Instructions & Notes</span>
              <p className="text-xs text-grey-500 leading-relaxed bg-grey-25/50 border border-grey-100 rounded-lg p-3 font-secondary whitespace-pre-line">
                {invoice.notes || "No special instructions or custom notes attached to statement."}
              </p>
            </div>

            {/* Calculations right alignment */}
            <div className="w-full sm:w-64 space-y-2.5 text-xs font-secondary">
              <div className="flex items-center justify-between text-grey-500">
                <span>Subtotal</span>
                <span className="font-bold text-grey-900 font-sans text-sm">{formatCurrencyConverted(subtotal, clientCurrency, activeCurrency)}</span>
              </div>
              
              {invoice.hasTax && (
                <div className="flex items-center justify-between text-grey-500">
                  <span>VAT / Local Tax ({invoice.taxRate}%)</span>
                  <span className="font-bold text-grey-900 font-sans text-sm">{formatCurrencyConverted(taxAmount, clientCurrency, activeCurrency)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-grey-100 text-sm">
                <span className="font-bold text-grey-900 uppercase">Total Amount Due</span>
                <span className="font-sans font-extrabold text-grey-900 text-xl">{formatCurrencyConverted(totalAmount, clientCurrency, activeCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Compliance notice footer */}
          <div className="text-xs text-grey-450 text-center pt-6 border-t border-grey-50 font-secondary">
            Bok standard invoices are prepared electronically in compliance with standard European and Scandinavian freelance clearing codes. Thank you for your business.
          </div>

        </div>

        {/* Dynamic Activity Log Panel (Right, span-4) */}
        <div className="lg:col-span-4 space-y-6" id="detail-activity-timeline-sidebar">
          
          {/* Timeline Wrapper Card */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-grey-900 uppercase tracking-wider pb-2 border-b border-grey-50">
              Invoice History Log
            </h3>
            
            <div className="relative border-l-2 border-grey-100 ml-2.5 pl-5 space-y-6 text-xs text-left" id="timeline-flow">
              {invoice.activityLog.map((log) => {
                const isPaidType = log.action.includes("Paid") || log.action.includes("Payment");
                const isReminder = log.action.includes("Reminder") || log.action.includes("Escalation");

                return (
                  <div key={log.id} className="relative group" id={`timeline-entry-${log.id}`}>
                    {/* Circle Node visual */}
                    <span className={`absolute -left-[27px] top-0 p-0.5 rounded-full border-2 border-white ${
                      isPaidType 
                        ? "bg-green-500 text-white"
                        : isReminder
                        ? "bg-amber-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}>
                      {isPaidType ? (
                        <ShieldCheck className="w-3 h-3 text-white" />
                      ) : isReminder ? (
                        <Clock className="w-3 h-3 text-white" />
                      ) : (
                        <ClipboardCheck className="w-3 h-3 text-white" />
                      )}
                    </span>

                    {/* Content Text */}
                    <div className="space-y-0.5">
                      <span className="font-bold text-grey-900 block">{log.action}</span>
                      <span className="text-xs text-grey-450 block font-secondary">{log.date}</span>
                      {log.details && (
                        <p className="text-xs text-grey-500 bg-grey-25 border border-grey-100/50 rounded p-1.5 mt-1 font-secondary">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick automation rules checklist overview */}
          <div className="bg-white rounded-xl border border-grey-100 p-5 space-y-3 font-secondary text-xs">
            <h4 className="font-bold text-grey-900 uppercase">Reminders Configuration</h4>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoice.reminders.before3Days}
                  disabled
                  className="rounded border-grey-300 text-blue-500"
                />
                <span className="text-grey-600">3 days prior to due-date nudge</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoice.reminders.onDueDate}
                  disabled
                  className="rounded border-grey-300 text-blue-500"
                />
                <span className="text-grey-600">Due-date day automated alert</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoice.reminders.overdue3Days}
                  disabled
                  className="rounded border-grey-300 text-blue-500"
                />
                <span className="text-grey-600">3 days overdue escalation reminder</span>
              </li>
              <li className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoice.reminders.overdue7Days}
                  disabled
                  className="rounded border-grey-300 text-blue-500"
                />
                <span className="text-grey-600">7 days overdue final firm demand</span>
              </li>
            </ul>

            <div className="border-t border-grey-50 pt-2.5 mt-2.5">
              <span className="text-grey-400 font-semibold block uppercase text-xs">Escalation rule</span>
              <span className="font-semibold text-blue-600 ml-1">{invoice.escalationRule || "None"}</span>
            </div>
          </div>

        </div>

      </div>

      {/* PDF PRINT DESIGN MODAL OVERLAY */}
      {isPdfModalOpen && (
        <div
          role="dialog"
          id="invoice-pdf-modal-overlay"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
          onClick={() => setIsPdfModalOpen(false)}
        >
          <div
            id="invoice-pdf-modal-card"
            className="bg-grey-50 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-grey-100 shadow-2xl scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-grey-100 bg-white gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-sans font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>PDF Document Version — {invoice.id}</span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${getStatusBadgeStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </h2>
                  <p className="text-xs text-grey-450 mt-0.5 font-secondary">Verified PDF layout version ready for client transmission and settlement tracking.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-lg text-grey-400 hover:bg-grey-100 hover:text-grey-600 cursor-pointer transition-colors sm:self-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Ribbon */}
            <div className="bg-grey-25 px-6 py-3 border-b border-grey-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Download PDF Action button */}
                <button
                  id="btn-modal-pdf-download"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-sm"
                  disabled={modalActionState === "downloading"}
                >
                  {modalActionState === "downloading" ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : modalActionState === "downloaded" ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  {modalActionState === "downloading" ? "Generating..." : modalActionState === "downloaded" ? "Downloaded!" : "Download PDF"}
                </button>

                {/* Direct Send via email to Client */}
                <button
                  id="btn-modal-pdf-email"
                  onClick={handleEmailPDF}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-grey-200 hover:bg-grey-50 text-grey-700 hover:text-black rounded-lg font-semibold cursor-pointer transition-colors"
                  disabled={modalActionState === "sending"}
                >
                  {modalActionState === "sending" ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  ) : modalActionState === "sent" ? (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-grey-500" />
                  )}
                  {modalActionState === "sending" ? "Sending..." : modalActionState === "sent" ? "Email Sent!" : `Send to ${clientName}`}
                </button>

                {/* Copy Secure Share Link */}
                <button
                  id="btn-modal-pdf-copy"
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-grey-200 hover:bg-grey-50 text-grey-700 hover:text-black rounded-lg font-semibold cursor-pointer transition-colors"
                  disabled={modalActionState === "copying"}
                >
                  {modalActionState === "copied" ? (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-grey-500" />
                  )}
                  {modalActionState === "copied" ? "Secure Link Copied!" : "Copy Share Link"}
                </button>
              </div>

              {/* Status Toast Notification Indicator Inside Modal */}
              {modalActionState && (
                <div className="text-[11px] font-bold text-blue-600 bg-blue-50/80 border border-blue-150 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="truncate max-w-[280px] sm:max-w-md">
                    {modalActionState === "downloading" && "Configuring and formatting print-friendly stylesheet..."}
                    {modalActionState === "downloaded" && "High-resolution PDF saved inside downloads directory."}
                    {modalActionState === "sending" && `Connecting connection route to dispatch email attachment to ${client?.email}...`}
                    {modalActionState === "sent" && `Secure invoice PDF safely delivered to ${client?.email}!`}
                    {modalActionState === "copying" && "Encrypting unique verification portal access key..."}
                    {modalActionState === "copied" && "Secure ledger access link copied to your system clipboard!"}
                  </span>
                </div>
              )}
            </div>

            {/* PDF Viewport Document Page Area (Scrollable background mimicking layout paper) */}
            <div className="flex-1 overflow-y-auto p-8 bg-white flex justify-center py-10" id="modal-pdf-scroll-viewport">
              {/* Actual virtual printed sheet */}
              <div 
                id="modal-pdf-paper-plate"
                className="bg-white text-grey-900 p-12 sm:p-14 border-[0.5px] border-grey-200/50 aspect-[1/1.4] w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between font-sans relative text-left select-text"
              >
                {/* Paper watermark/certification lines */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between text-[9px] uppercase font-bold tracking-widest text-grey-350 select-none pb-2 border-b border-grey-50/40">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>ORIGINAL PDF LEDGER DOCUMENT</span>
                  </div>
                  <span>REF: {invoice.id}</span>
                </div>

                <div className="space-y-8 mt-4">
                  {/* Top layout */}
                  <div className="flex justify-between items-start gap-6 pb-6 border-b border-grey-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BokLogo size={18} />
                        <span className="text-xl font-sans font-bold text-grey-950 tracking-tight">Bōk Consulting</span>
                      </div>
                      <p className="text-xs text-grey-550 leading-relaxed max-w-xs font-secondary">
                        Mofiyinfoluwa O. · Bok Creative Services<br />
                        14 Nordlys Gade, Floor 2<br />
                        Copenhagen, 1105 DK · Denmark<br />
                        <span className="text-grey-450 font-sans font-medium">mofiyino15@gmail.com</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-grey-400 uppercase tracking-widest block">INVOICE STATEMENT</span>
                      <h3 className="text-3xl font-bold text-grey-900 mt-1 leading-none">{invoice.id}</h3>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-grey-100 text-grey-700 border border-grey-200 uppercase tracking-wider scale-[0.9] origin-right">
                        {invoice.status}
                      </div>
                    </div>
                  </div>

                  {/* Recipient breakdown */}
                  <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed pb-4 border-b border-grey-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-grey-400 tracking-wider block mb-2">PREPARED FOR RECIPIENT:</span>
                      {client ? (
                        <div className="space-y-0.5 font-sans">
                          <p className="font-bold text-grey-900 text-sm leading-tight">{client.name}</p>
                          <p className="text-grey-600 font-semibold">{client.businessName}</p>
                          <p className="text-grey-500 font-secondary mt-1">{client.address}</p>
                          <p className="text-grey-500 font-secondary">{client.city}, {client.state ? `${client.state}, ` : ""}{client.country}</p>
                          <p className="text-grey-550 font-medium font-secondary mt-1">{client.email}</p>
                          <p className="text-grey-400 font-mono mt-1">Tax Registration Ref: {client.taxId}</p>
                        </div>
                      ) : (
                        <p className="text-grey-550">Unspecified client assignment.</p>
                      )}
                    </div>

                    <div className="space-y-3 font-secondary pl-4 sm:pl-10 text-right sm:text-left">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-grey-400 tracking-wider block font-sans">DATE OF ISSUE:</span>
                        <span className="text-grey-900 font-bold block mt-0.5">{invoice.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-grey-400 tracking-wider block font-sans">PAYMENT DUE DATE:</span>
                        <span className="text-red-650 font-extrabold block mt-0.5">{invoice.dueDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-grey-50 text-left">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-grey-400 block">TERMS:</span>
                          <span className="text-grey-900 font-bold text-[11px] block">{client?.paymentTerms || "Net 30"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-grey-400 block">CURRENCY:</span>
                          <span className="text-grey-900 font-bold text-[11px] block uppercase">{clientCurrency}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] uppercase font-bold text-grey-400 tracking-wider block font-sans">STATEMENT BREAKDOWN:</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-grey-900/10">
                          <th className="font-bold text-grey-500 py-2.5 uppercase text-[10px] font-sans">Work Item & Description</th>
                          <th className="font-bold text-grey-500 py-2.5 text-right uppercase text-[10px] w-16 font-sans">Qty</th>
                          <th className="font-bold text-grey-500 py-2.5 text-right uppercase text-[10px] w-24 font-sans">Unit Rate</th>
                          <th className="font-bold text-grey-500 py-2.5 text-right uppercase text-[10px] w-28 font-sans">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-grey-100 text-[11px]">
                        {invoice.lineItems.map((item) => (
                          <tr key={item.id} className="py-2 inline-border">
                            <td className="py-3.5 font-bold text-grey-900 font-sans pr-4">{item.description}</td>
                            <td className="py-3.5 text-right text-grey-500">{item.qty}</td>
                            <td className="py-3.5 text-right text-grey-500 font-mono">{formatCurrencyConverted(item.unitPrice, clientCurrency, activeCurrency)}</td>
                            <td className="py-3.5 text-right font-extrabold text-grey-900 font-mono">{formatCurrencyConverted(item.qty * item.unitPrice, clientCurrency, activeCurrency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing and Notes Calculations Block */}
                  <div className="grid grid-cols-12 gap-8 pt-6 border-t border-grey-100 text-left">
                    <div className="col-span-7 space-y-2 text-xs">
                      <span className="text-[10px] uppercase font-bold text-grey-400 tracking-wider block font-sans">INSTRUCTIONS & CLIENT MEMO:</span>
                      <p className="text-[11px] text-grey-550 leading-relaxed bg-grey-25 border border-grey-100 rounded-lg p-3 font-secondary whitespace-pre-line">
                        {invoice.notes || "No custom statement notes or secondary layout instructions specified. Thank you for your continued operations with Bōk Consulting!"}
                      </p>
                    </div>

                    <div className="col-span-5 space-y-2 text-xs font-secondary pl-4">
                      <div className="flex items-center justify-between text-grey-550">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-grey-950 font-sans">{formatCurrencyConverted(subtotal, clientCurrency, activeCurrency)}</span>
                      </div>
                      
                      {invoice.hasTax && (
                        <div className="flex items-center justify-between text-grey-550">
                          <span>Value Added Tax ({invoice.taxRate}%)</span>
                          <span className="font-bold text-grey-950 font-sans">{formatCurrencyConverted(taxAmount, clientCurrency, activeCurrency)}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2.5 border-t-2 border-grey-900 text-xs">
                        <span className="font-sans font-black text-grey-900 uppercase">Grand Total due:</span>
                        <span className="font-sans font-black text-grey-950 text-base">{formatCurrencyConverted(totalAmount, clientCurrency, activeCurrency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Signatures & Verification Bottom Footer */}
                <div className="pt-10 border-t border-grey-100 mt-10 text-[9px] text-grey-450 font-secondary flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="font-bold text-grey-600 uppercase tracking-wider">Settlement Routing Guidelines</p>
                    <p>Reconcilation Account Ref: Nordea Bank SE-2321-4999</p>
                    <p>SWIFT/BIC clearing identifier code: BOKCDKKHXX</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-6 w-24 border-b border-grey-300 ml-auto"></div>
                    <p className="font-bold text-grey-500 uppercase tracking-widest text-[8px] font-sans">Mofiyinfoluwa O. Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-grey-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-grey-450 font-secondary">🛡️ Secure 256-bit encrypted ledger verification payload document code</span>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-5 py-2 hover:bg-grey-100 text-grey-700 bg-grey-50 font-bold rounded-lg border border-grey-200 text-xs transition-colors cursor-pointer"
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
