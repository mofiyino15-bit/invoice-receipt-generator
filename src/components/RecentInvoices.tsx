import { Eye, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Invoice, Client, formatCurrencyConverted } from "../types";
import { useState, useEffect } from "react";

interface RecentInvoicesProps {
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  activeCurrency?: string;
}

export default function RecentInvoices({
  invoices,
  clients,
  onNavigate,
  onUpdateInvoiceStatus,
  activeCurrency = "original"
}: RecentInvoicesProps) {
  // Real filter states
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<string>("All");

  // Actions menu state
  const [openMenuInvoiceId, setOpenMenuInvoiceId] = useState<string | null>(null);

  // Close menus on click outside immediately
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('[id^="btn-recent-actions-"]') && !target.closest('[id^="menu-actions-"]')) {
        setOpenMenuInvoiceId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helpers
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown Client";
  };

  const getClientCurrency = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.currency || "USD";
  };

  const getStatusBadgeStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-600";
      case "Overdue":
        return "bg-red-100 text-red-600";
      case "Due Today":
        return "bg-amber-100 text-amber-600";
      case "Upcoming":
        return "bg-blue-100 text-blue-600";
      case "Draft":
        return "bg-grey-100 text-grey-600";
      default:
        return "bg-grey-100 text-grey-700";
    }
  };

  // Date check logic
  const isWithinDateFilter = (dateStr: string, range: string) => {
    if (range === "All") return true;
    try {
      const invDate = new Date(dateStr);
      const today = new Date("2026-05-23");
      
      switch (range) {
        case "This Week": {
          const diffTime = Math.abs(today.getTime() - invDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }
        case "This Month": {
          return invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
        }
        case "Last 30 Days": {
          const diffTime = today.getTime() - invDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        }
        default:
          return true;
      }
    } catch {
      return true;
    }
  };

  // Filter and sort invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    const matchesClient = clientFilter === "All" || inv.clientId === clientFilter;
    const matchesTime = isWithinDateFilter(inv.dueDate, timeFilter);
    return matchesStatus && matchesClient && matchesTime;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);

  return (
    <div className="bg-white rounded-xl border-[0.5px] border-grey-200/60 p-6 flex flex-col overflow-visible" id="recent-invoices-workspace">
      {/* Table Title and Working Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-grey-900 tracking-tight">Recent Invoices</h2>
          <p className="text-xs text-grey-400 mt-0.5 font-secondary">Latest billing activity and follow-up ledger</p>
        </div>

        {/* Real working interactive filters with identical style, no shadows */}
        <div className="flex items-center gap-2 text-xs flex-wrap" id="decorative-filters">
          <span className="text-xs font-bold uppercase text-grey-400 tracking-wider flex items-center gap-1.5 select-none font-sans">
            <SlidersHorizontal className="w-3.5 h-3.5 text-grey-300" /> Filters:
          </span>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 rounded-full border border-grey-200 text-grey-600 bg-white hover:bg-grey-25 hover:border-grey-300 focus:outline-none focus:border-blue-500 font-secondary text-xs cursor-pointer appearance-none pr-6 [background-position:right_8px_center] [background-repeat:no-repeat] [background-size:10px]"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")` }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Due Today">Due Today</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="relative">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-1 rounded-full border border-grey-200 text-grey-600 bg-white hover:bg-grey-25 hover:border-grey-300 focus:outline-none focus:border-blue-500 font-secondary text-xs cursor-pointer max-w-[120px] appearance-none pr-6 [background-position:right_8px_center] [background-repeat:no-repeat] [background-size:10px]"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")` }}
            >
              <option value="All">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Time/Date Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1 rounded-full border border-grey-200 text-grey-600 bg-white hover:bg-grey-25 hover:border-grey-300 focus:outline-none focus:border-blue-500 font-secondary text-xs cursor-pointer appearance-none pr-6 [background-position:right_8px_center] [background-repeat:no-repeat] [background-size:10px]"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")` }}
            >
              <option value="All">All Time</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* State Reset Action Trigger */}
          {(statusFilter !== "All" || clientFilter !== "All" || timeFilter !== "All") && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setClientFilter("All");
                setTimeFilter("All");
              }}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 cursor-pointer uppercase tracking-wider pl-1 font-sans"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Interface */}
      <div className="overflow-x-auto lg:overflow-visible" id="recent-invoices-table-container">
        {sortedInvoices.length === 0 ? (
          <div className="text-center py-12 text-grey-400 text-sm font-secondary border border-dashed border-grey-100 rounded-xl">
            No invoices matching the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse" id="recent-invoices-table">
            <thead>
              <tr className="border-b border-grey-100 bg-grey-50">
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Invoice ID
                </th>
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Client Name
                </th>
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Amount
                </th>
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Due Date
                </th>
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Status
                </th>
                <th className="text-xs font-semibold text-grey-600 px-6 py-2.5 uppercase tracking-wider font-sans whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {sortedInvoices.map((inv, index) => {
                const clientName = getClientName(inv.clientId);
                const currency = getClientCurrency(inv.clientId);
                const badgeStyle = getStatusBadgeStyle(inv.status);

                return (
                  <tr
                    key={inv.id}
                    id={`recent-row-${inv.id}`}
                    onClick={() => onNavigate("invoice-detail", { invoiceId: inv.id })}
                    className={`group hover:bg-grey-25/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-grey-25/10"
                    } ${openMenuInvoiceId === inv.id ? "relative z-50 bg-grey-50" : "relative z-10"}`}
                  >
                    {/* ID - normal weight, brand color on hover, clean monospaced layout to keep hierarchy tidy */}
                    <td className="px-6 py-2.5 text-sm font-medium text-grey-500 font-mono group-hover:text-blue-500 transition-colors align-middle whitespace-nowrap">
                      {inv.id}
                    </td>
                    
                    {/* Client */}
                    <td className="px-6 py-2.5 text-sm font-semibold text-grey-800 align-middle whitespace-nowrap truncate max-w-[150px]" title={clientName}>
                      {clientName}
                    </td>

                    {/* Amount with semibold weight for balanced visual hierarchy */}
                    <td className="px-6 py-2.5 text-sm font-semibold text-grey-900 align-middle whitespace-nowrap">
                      {formatCurrencyConverted(inv.amount, currency, activeCurrency)}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-2.5 text-sm text-grey-500 font-secondary align-middle whitespace-nowrap">
                      {inv.dueDate}
                    </td>

                    {/* Status Badges */}
                    <td className="px-6 py-2.5 text-sm align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle} whitespace-nowrap`}>
                        {inv.status}
                      </span>
                    </td>

                    {/* Fully Functional dropdown menu left-aligned under left-aligned Actions header */}
                    <td className="px-6 py-2.5 text-sm text-left font-sans align-middle" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-start">
                        <div className="relative">
                          <button
                            id={`btn-recent-actions-${inv.id}`}
                            onClick={() => setOpenMenuInvoiceId(openMenuInvoiceId === inv.id ? null : inv.id)}
                            className="h-8 px-3 border border-grey-200 bg-white hover:bg-grey-50 text-grey-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Actions</span>
                            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-grey-400" />
                          </button>
                          
                          {openMenuInvoiceId === inv.id && (
                            <div
                              id={`menu-actions-${inv.id}`}
                              className="absolute left-0 mt-1 bg-white border border-grey-200 rounded-xl py-1.5 w-48 z-50 text-xs text-left shadow-xl"
                            >
                              <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-b border-grey-100 mb-1">
                                Actions
                              </p>
                              <button
                                onClick={() => {
                                  onNavigate("invoice-detail", { invoiceId: inv.id });
                                  setOpenMenuInvoiceId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-grey-25 text-grey-700 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-grey-405" />
                                <span>View Details</span>
                              </button>
                              
                              <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-t border-b border-grey-100 my-1">
                                Change Status
                              </p>
                              
                              {inv.status !== "Paid" && (
                                <button
                                  onClick={() => {
                                    onUpdateInvoiceStatus(inv.id, "Paid");
                                    setOpenMenuInvoiceId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 flex items-center gap-2 cursor-pointer transition-colors text-grey-700 font-medium"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  <span>Mark Paid</span>
                                </button>
                              )}

                              {inv.status !== "Overdue" && (
                                <button
                                  onClick={() => {
                                    onUpdateInvoiceStatus(inv.id, "Overdue");
                                    setOpenMenuInvoiceId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 flex items-center gap-2 cursor-pointer transition-colors text-grey-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  <span>Mark Overdue</span>
                                </button>
                              )}

                              {inv.status !== "Due Today" && (
                                <button
                                  onClick={() => {
                                    onUpdateInvoiceStatus(inv.id, "Due Today");
                                    setOpenMenuInvoiceId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 flex items-center gap-2 cursor-pointer transition-colors text-grey-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  <span>Mark Due Today</span>
                                </button>
                              )}

                              {inv.status !== "Upcoming" && (
                                <button
                                  onClick={() => {
                                    onUpdateInvoiceStatus(inv.id, "Upcoming");
                                    setOpenMenuInvoiceId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 flex items-center gap-2 cursor-pointer transition-colors text-grey-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  <span>Mark Upcoming</span>
                                </button>
                              )}

                              {inv.status !== "Draft" && (
                                <button
                                  onClick={() => {
                                    onUpdateInvoiceStatus(inv.id, "Draft");
                                    setOpenMenuInvoiceId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 flex items-center gap-2 cursor-pointer transition-colors text-grey-600"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-grey-450"></span>
                                  <span>Mark Draft</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
