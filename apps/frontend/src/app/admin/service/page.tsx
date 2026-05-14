"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  LayoutGrid,
  AlertTriangle,
  X,
  Save,
  Image as ImageIcon,
  Upload,
  Zap,
  Hammer,
  Scissors,
  Droplets,
  Paintbrush,
  Home,
  Calendar,
  Clock,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAdminGuard } from "@/lib/use-admin-guard";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils";

interface ServiceCategory {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  isActive: boolean;
  imageKey?: string;
  createdAt: string;
}

const CATEGORY_EXAMPLES = [
  { name: "Coiffure", icon: Scissors, desc: "Services liés aux cheveux et soins capillaires" },
  { name: "Plomberie", icon: Droplets, desc: "Réparations, installations et dépannages sanitaires" },
  { name: "Électricité", icon: Zap, desc: "Installation et maintenance électrique" },
  { name: "Peinture", icon: Paintbrush, desc: "Peinture intérieure, extérieure et décoration" },
  { name: "Ménage", icon: Home, desc: "Nettoyage professionnel et entretien" },
  { name: "BTP / Construction", icon: Hammer, desc: "Travaux de bâtiment et rénovation" }
];

export default function AdminServicesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
  const [selectedCategoryForSchedule, setSelectedCategoryForSchedule] = useState<ServiceCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Général",
    description: "",
    price: 0,
    currency: "USD",
    workingHoursStart: "06:00",
    workingHoursEnd: "18:00",
    isActive: true,
    imageKey: ""
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/services");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Impossible de charger les catégories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const handleOpenModal = (cat?: ServiceCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        category: cat.category || "Général",
        description: cat.description || "",
        price: cat.price || 0,
        currency: cat.currency || "USD",
        workingHoursStart: cat.workingHoursStart || "06:00",
        workingHoursEnd: cat.workingHoursEnd || "18:00",
        isActive: cat.isActive,
        imageKey: cat.imageKey || ""
      });
      setPreviewUrl(cat.imageKey ? getMediaUrl(`/uploads/services/${cat.imageKey}`) : null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        category: "Général",
        description: "",
        price: 0,
        currency: "USD",
        workingHoursStart: "06:00",
        workingHoursEnd: "18:00",
        isActive: true,
        imageKey: ""
      });
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
  };

  const applyExample = (example: typeof CATEGORY_EXAMPLES[0]) => {
    setFormData({
      ...formData,
      name: example.name,
      description: example.desc
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await api.post("/uploads/service", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData({ ...formData, imageKey: res.data.filename });
      setPreviewUrl(getMediaUrl(res.data.url));
      toast.success("Image uploadée !");
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCategory) {
        await api.patch(`/admin/services/${editingCategory.id}`, formData);
        toast.success("Catégorie mise à jour !");
      } else {
        await api.post("/admin/services", formData);
        toast.success("Nouvelle catégorie créée !");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteModal = (cat: ServiceCategory) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setFormLoading(true);
    try {
      await api.delete(`/admin/services/${categoryToDelete.id}`);
      toast.success("Catégorie supprimée.");
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedCategoryForSchedule) return;
    setFormLoading(true);
    try {
      await api.patch(`/admin/services/${selectedCategoryForSchedule.id}`, {
        workingHoursStart: formData.workingHoursStart,
        workingHoursEnd: formData.workingHoursEnd
      });
      toast.success("Horaires mis à jour !");
      setIsScheduleModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des horaires.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 w-full min-w-0 pb-20">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none">
            Types de Services<span className="text-[#BC9C6C]">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#321B13]/40 mt-3">
            Définir les domaines d'expertise disponibles
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-[#BC9C6C]" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 py-3.5 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all min-w-[120px]"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#321B13] text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#BC9C6C] transition-all shadow-xl shadow-[#321B13]/5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Catégorie
          </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Catégories", value: categories.length, icon: LayoutGrid, color: "bg-gray-50 text-gray-400" },
          { label: "Actives", value: categories.filter(c => c.isActive).length, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "Inactives", value: categories.filter(c => !c.isActive).length, icon: XCircle, color: "bg-red-50 text-red-500" },
          { label: "Nouveau (Mois)", value: 0, icon: Plus, color: "bg-blue-50 text-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 border border-gray-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-h-[110px] md:min-h-0">
            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl shrink-0 ${stat.color}`}>
              <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-black text-[#321B13] truncate">{stat.value}</p>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-[#321B13]/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#BC9C6C]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#BC9C6C]/10 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                  {cat.imageKey ? (
                    <img
                      src={getMediaUrl(`/uploads/services/${cat.imageKey}`)}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LayoutGrid className="w-6 h-6 text-[#BC9C6C]" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#BC9C6C] transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleOpenDeleteModal(cat)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <h3 className="text-xl font-black text-[#321B13] uppercase tracking-tighter mb-2">{cat.name}</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-6">
                {cat.description || "Aucune description définie pour cette catégorie."}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-black text-[#321B13]">
                  {cat.price} {cat.currency === "USD" ? "$" : "FC"}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#BC9C6C] bg-[#BC9C6C]/10 px-2 py-0.5 rounded-full">
                  Base
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCategoryForSchedule(cat);
                  setFormData(prev => ({
                    ...prev,
                    workingHoursStart: cat.workingHoursStart || "06:00",
                    workingHoursEnd: cat.workingHoursEnd || "18:00"
                  }));
                  setIsScheduleModalOpen(true);
                }}
                className="w-full mb-6 py-3 bg-[#FCFBF7] border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#321B13] hover:bg-[#321B13] hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Calendar className="w-3.5 h-3.5 text-[#BC9C6C] group-hover/btn:text-white transition-colors" />
                Planifier
              </button>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${cat.isActive ? "text-green-600" : "text-red-500"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-green-600 animate-pulse" : "bg-red-500"}`} />
                  {cat.isActive ? "Actif" : "Inactif"}
                </div>
                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">ID: {cat.id.slice(0, 8)}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
            <AlertTriangle className="w-10 h-10 text-gray-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic">Aucune catégorie définie</p>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6"
          >
            <div className="absolute inset-0 bg-[#321B13]/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl relative overflow-hidden shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#321B13] uppercase tracking-tighter">
                      {editingCategory ? "Modifier Catégorie" : "Nouvelle Catégorie"}
                    </h2>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#BC9C6C] mt-1 md:mt-2">
                      Définir un nouveau type de service
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </button>
                </div>

                {!editingCategory && (
                  <div className="mb-8 md:mb-10 space-y-3 md:space-y-4">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">Suggestions rapides</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_EXAMPLES.map((ex) => (
                        <button
                          key={ex.name}
                          type="button"
                          onClick={() => applyExample(ex)}
                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-[#FCFBF7] border border-gray-100 rounded-xl text-[9px] md:text-[10px] font-bold text-[#321B13] hover:border-[#BC9C6C] hover:bg-white transition-all"
                        >
                          <ex.icon className="w-3 h-3 text-[#BC9C6C]" />
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="space-y-5 md:space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Nom de la catégorie</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 py-3 md:py-4 px-5 md:px-6 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                        placeholder="ex: Architecture d'intérieur"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Description (optionnel)</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 py-3 md:py-4 px-5 md:px-6 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all resize-none"
                        placeholder="Décrivez brièvement ce type de service..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Prix de base</label>
                        <input
                          type="number"
                          required
                          value={formData.price === 0 ? "" : formData.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, price: val === "" ? 0 : Number(val) });
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-gray-50 border border-gray-100 py-3 md:py-4 px-5 md:px-6 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Devise</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 py-3 md:py-4 px-5 md:px-6 rounded-xl md:rounded-2xl text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-all appearance-none cursor-pointer"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="CDF">CDF (FC)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Image illustrative</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 md:p-6 bg-gray-50/50 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-dashed border-gray-100 rounded-2xl md:rounded-3xl flex items-center justify-center overflow-hidden group relative shrink-0">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-200" />
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-[#BC9C6C]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 md:space-y-3 text-center sm:text-left">
                          <label className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-6 py-2 md:py-3 bg-white border border-gray-100 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#321B13] cursor-pointer hover:border-[#BC9C6C] transition-all shadow-sm">
                            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {uploading ? "Upload..." : "Choisir une icône"}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                          </label>
                          <p className="text-[7px] md:text-[8px] text-gray-400 font-bold uppercase tracking-widest">Formats: JPG, PNG, WebP. Max 5MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 py-4 md:py-5 px-5 md:px-6 bg-[#FCFBF7] rounded-xl md:rounded-2xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 md:w-6 md:h-6 accent-[#BC9C6C] rounded-md"
                      />
                      <label htmlFor="isActive" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#321B13] cursor-pointer">Activer cette catégorie immédiatement</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-[#321B13] text-white py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 hover:bg-[#BC9C6C] transition-all shadow-xl shadow-[#321B13]/10"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Save className="w-4 h-4 md:w-5 md:h-5" />}
                    {editingCategory ? "Mettre à jour" : "Créer la catégorie"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Deletion Confirmation */}
      <AnimatePresence>
        {isDeleteModalOpen && categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[#321B13]/60 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 w-full max-w-md relative overflow-hidden shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-[#321B13] uppercase tracking-tighter mb-4">Supprimer ?</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                Êtes-vous sûr de vouloir supprimer <span className="text-[#321B13]">"{categoryToDelete.name}"</span> ? <br />
                Cette action est irréversible et affectera les futurs prestataires.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="w-full bg-red-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full bg-gray-50 text-gray-400 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Scheduling/Hours Details */}
      <AnimatePresence>
        {isScheduleModalOpen && selectedCategoryForSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[#321B13]/60 backdrop-blur-md" onClick={() => setIsScheduleModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg relative overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FCFBF7] rounded-2xl flex items-center justify-center border border-gray-100">
                      <Clock className="w-6 h-6 text-[#BC9C6C]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#321B13] uppercase tracking-tighter">Horaires & Détails</h2>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#BC9C6C] mt-1">{selectedCategoryForSchedule.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsScheduleModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#FCFBF7] border border-gray-100 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                        <Clock className="w-4 h-4 text-[#BC9C6C]" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#321B13]">Disponibilité Standard</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Ouverture</label>
                        <input
                          type="time"
                          value={formData.workingHoursStart}
                          onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                          className="w-full bg-white border border-gray-100 py-3 px-4 rounded-xl text-lg font-black text-[#321B13] focus:outline-none focus:border-[#BC9C6C]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Fermeture</label>
                        <input
                          type="time"
                          value={formData.workingHoursEnd}
                          onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                          className="w-full bg-white border border-gray-100 py-3 px-4 rounded-xl text-lg font-black text-[#321B13] focus:outline-none focus:border-[#BC9C6C]"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Heures d'intervention garanties pour cette catégorie
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">À propos de ce service</h4>
                    <p className="text-sm text-[#321B13]/70 leading-relaxed font-medium">
                      {selectedCategoryForSchedule.description || "Aucun détail supplémentaire pour ce service."}
                    </p>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tarif de base</span>
                      <span className="text-lg font-black text-[#321B13]">{selectedCategoryForSchedule.price} {selectedCategoryForSchedule.currency === "USD" ? "$" : "FC"}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateSchedule}
                  disabled={formLoading}
                  className="w-full mt-10 bg-[#321B13] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#BC9C6C] transition-all shadow-xl shadow-[#321B13]/10 flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Mise a jour les horaires
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
