"use client";

import React, { useEffect, useState } from "react";
import { Search, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, ChevronDown, Download, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminGuard } from "@/lib/use-admin-guard";
import api from "@/lib/api";

type TransactionItem = {
  id: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  method: string;
};

type StatItem = {
  label: string;
  value: string;
  trend: string;
  color: string;
};

export default function AdminFinancialsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [dataLoading, setDataLoading] = useState(true);

  const [stats, setStats] = useState<StatItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFinancials = async () => {
      try {
        const res = await api.get('/admin/financials');
        setStats(res.data.stats || []);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données financières. L'API Backend est-elle prête ?");
      } finally {
        setDataLoading(false);
      }
    };

    fetchFinancials();
  }, [isAuthenticated]);

  const filteredTransactions = transactions.filter(trx => 
    trx.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trx.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (isAuthenticated && dataLoading)) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-[#FF6B00]" /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
            Gestion des Finances<span className="text-[#BC9C6C]">.</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Gerer les finances de la plateforme</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-[#BC9C6C]" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 py-3.5 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all min-w-[120px]"
            />
          </div>
          <button className="flex-1 md:flex-none justify-center items-center gap-2 text-xs font-extrabold text-[#321B13] hover:bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl transition-all">
            <Download className="w-4 h-4" /> Exporter Rapport
          </button>
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 p-8 rounded-3xl text-center font-bold">
          {error}
        </div>
      ) : (
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-[#FF6B00] transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">{stat.trend} ↗</span>
                </div>
                <h4 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2 truncate">{stat.value}</h4>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
              <h3 className="text-2xl font-black">Historique des Transactions</h3>
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 text-xs font-bold text-slate-400 border border-slate-100 px-5 py-2.5 rounded-2xl">
                  Type <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 text-xs font-bold text-slate-400 border border-slate-100 px-5 py-2.5 rounded-2xl">
                  Statut <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <div className="space-y-3">
                  {filteredTransactions.map((trx, i) => (
                    <div key={i} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-[2rem] border border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer group gap-4 lg:gap-0">
                      <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${trx.type === 'PAIEMENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}>
                          {trx.type === 'PAIEMENT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-black text-[13px] tracking-tight truncate uppercase">{trx.method} <span className="text-slate-200 mx-1 hidden sm:inline">•</span> <span className="text-slate-300 font-bold hidden sm:inline">#{trx.id.substring(0, 8)}</span></h5>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest truncate mt-0.5">{trx.type} — {trx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4 sm:gap-8 lg:pl-0">
                        <div className="text-left lg:text-right">
                          <p className={`font-black text-sm ${trx.amount.startsWith('+') ? 'text-emerald-600' : 'text-[#321B13]'}`}>{trx.amount}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[8px] font-black border shrink-0 ${trx.status === 'RÉUSSI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          trx.status === 'EN ATTENTE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-500 border-rose-100'
                          }`}>
                          {trx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                Aucune transaction enregistrée
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
