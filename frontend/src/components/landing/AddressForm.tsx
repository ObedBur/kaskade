"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, ArrowRight, Info, Phone, Home } from "lucide-react";
import { toast } from "sonner";

interface AddressFormProps {
    onClose: () => void;
    onConfirm: (data: { address: string; description: string }) => void;
}

export default function AddressForm({ onClose, onConfirm }: AddressFormProps) {
    const [quartier, setQuartier] = useState("");
    const [repere, setRepere] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (!quartier.trim()) {
            toast.error("Le quartier est obligatoire.");
            return;
        }
        if (!repere.trim()) {
            toast.error("Veuillez donner un point de repère.");
            return;
        }
        if (!description.trim()) {
            toast.error("Dites-nous ce qu'il faut faire.");
            return;
        }

        // On combine les informations pour le champ 'address' du backend
        const fullAddress = `Quartier: ${quartier} | Repère: ${repere} | WhatsApp: ${whatsapp || 'Non fourni'}`;
        
        onConfirm({ 
            address: fullAddress, 
            description 
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-chocolat/90 backdrop-blur-md p-2 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
                {/* Header */}
                <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 flex items-start justify-between gap-4 border-b border-zinc-100">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-ocre/10 text-ocre px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-ocre/20">
                                Localisation Goma
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-chocolat uppercase tracking-tighter leading-tight">
                            Détails de <br /><span className="text-ocre italic font-serif lowercase">l'intervention.</span>
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all border border-zinc-100"
                    >
                        <X className="w-5 h-5 text-chocolat" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-10 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Quartier */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Votre Quartier
                            </p>
                        </div>
                        <select 
                            value={quartier}
                            onChange={(e) => setQuartier(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-ocre transition-all"
                        >
                            <option value="">Sélectionner un quartier</option>
                            <option value="Himbi">Himbi</option>
                            <option value="Kyeshero">Kyeshero</option>
                            <option value="Virunga">Virunga</option>
                            <option value="Karisimbi">Karisimbi</option>
                            <option value="Katindo">Katindo</option>
                            <option value="Mabanga">Mabanga</option>
                            <option value="Les Volcans">Les Volcans</option>
                            <option value="Autre">Autre quartier...</option>
                        </select>
                    </div>

                    {/* Point de Repère */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Point de repère précis
                            </p>
                        </div>
                        <input 
                            type="text"
                            placeholder="Ex: En face de la station essence, Porte verte..."
                            value={repere}
                            onChange={(e) => setRepere(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-ocre transition-all"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Numéro WhatsApp (optionnel)
                            </p>
                        </div>
                        <input 
                            type="text"
                            placeholder="Ex: +243 9..."
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-ocre transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-ocre" />
                            <p className="text-[10px] font-black text-chocolat/40 uppercase tracking-[0.2em]">
                                Quel est votre besoin ?
                            </p>
                        </div>
                        <textarea 
                            placeholder="Décrivez brièvement le problème..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-6 text-sm font-medium focus:outline-none focus:border-ocre transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-10 bg-[#FCFBF7] border-t border-zinc-100">
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-chocolat text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-ocre hover:text-chocolat transition-all flex items-center justify-center gap-4 shadow-2xl shadow-chocolat/20 group"
                    >
                        Confirmer & Payer
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
