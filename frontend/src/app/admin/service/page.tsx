"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Briefcase,
  AlertTriangle,
  X,
  Save,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAdminGuard } from "@/lib/use-admin-guard";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
  imageKey?: string;
  createdAt: string;
}

export default function AdminServicesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAdminGuard();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    currency: "FC",
    isActive: true,
    imageKey: ""
  });

  const fetchServices = async () => {
    try {
      const res = await api.get("/admin/services");
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Impossible de charger les services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated]);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        description: service.description || "",
        price: service.price,
        currency: service.currency || "FC",
        isActive: service.isActive,
        imageKey: service.imageKey || ""
      });
      setPreviewUrl(service.imageKey ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/uploads/services/${service.imageKey}` : null);
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        price: 0,
        currency: "FC",
        isActive: true,
        imageKey: ""
      });
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
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
      setPreviewUrl(res.data.url);
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
      if (editingService) {
        await api.patch(`/admin/services/${editingService.id}`, formData);
        toast.success("Service mis à jour !");
      } else {
        await api.post("/admin/services", formData);
        toast.success("Service créé avec succès !");
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      toast.success("Service supprimé.");
      fetchServices();
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#BC9C6C]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 w-full min-w-0">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-black text-[#321B13] tracking-tighter uppercase leading-none break-words">
            Catalogue Services<span className="text-[#BC9C6C]">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#321B13]/40 mt-3">
            Gestion de l'offre Kaskade
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-[#BC9C6C]" />
            <input
              type="text"
              placeholder="Rechercher..."
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
            Nouveau Service
          </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Services", value: services.length, icon: Briefcase, color: "bg-gray-50 text-gray-400" },
          { label: "Actifs", value: services.filter(s => s.isActive).length, icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "Inactifs", value: services.filter(s => !s.isActive).length, icon: XCircle, color: "bg-red-50 text-red-500" },
          { label: "Catégories", value: new Set(services.map(s => s.category)).size, icon: ImageIcon, color: "bg-blue-50 text-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 border border-gray-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-h-[120px] md:min-h-0">
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

      {/* Services Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden w-full">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[700px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Service</th>
                  <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Catégorie</th>
                  <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Prix Moyen</th>
                  <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Statut</th>
                  <th className="px-4 md:px-8 py-4 md:py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-4 md:px-8 py-4 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#BC9C6C]/10 group-hover:text-[#BC9C6C] transition-all overflow-hidden">
                          {service.imageKey ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/uploads/services/${service.imageKey}`}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#321B13] uppercase tracking-tight truncate max-w-[150px] md:max-w-[200px]">{service.name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px] md:max-w-[200px]">{service.description || "Aucune description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6">
                      <span className="text-[10px] font-black bg-gray-100 px-2 md:px-3 py-1.5 rounded-full uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6">
                      <p className="text-sm font-black text-[#321B13] whitespace-nowrap">{service.price.toLocaleString()} {service.currency || 'FC'}</p>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${service.isActive ? "text-green-600" : "text-red-500"} whitespace-nowrap`}>
                        <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${service.isActive ? "bg-green-600 animate-pulse" : "bg-red-500"}`} />
                        {service.isActive ? "Actif" : "Désactivé"}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#BC9C6C] hover:border-[#BC9C6C]/20 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredServices.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-gray-100" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic">Aucun service trouvé dans le catalogue</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[#321B13]/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl relative overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-[#321B13] uppercase tracking-tighter">
                      {editingService ? "Modifier Service" : "Nouveau Service"}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#BC9C6C] mt-1">
                      Configuration du catalogue
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nom du service</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 py-3.5 px-5 rounded-2xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all"
                        placeholder="ex: Plomberie d'urgence"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Catégorie</label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 py-3.5 px-5 rounded-2xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all"
                        placeholder="ex: Maison"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prix Indicatif</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                          className="flex-1 bg-gray-50 border border-gray-100 py-3.5 px-5 rounded-2xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all"
                          placeholder="0"
                        />
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-24 bg-gray-50 border border-gray-100 py-3.5 px-3 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#BC9C6C] transition-all"
                        >
                          <option value="FC">FC</option>
                          <option value="USD">$</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 py-3.5 px-5 rounded-2xl text-sm focus:outline-none focus:border-[#BC9C6C] transition-all resize-none"
                        placeholder="Décrivez brièvement le service..."
                      />
                    </div>

                    <div className="col-span-2 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Image du service</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center overflow-hidden group relative">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-200" />
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-[#BC9C6C]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#321B13] cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                            <Upload className="w-4 h-4" />
                            {uploading ? "Upload..." : "Choisir une image"}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                          </label>
                          <p className="text-[9px] text-gray-400 font-medium">JPG, PNG ou WebP. Max 5MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 accent-[#BC9C6C]"
                      />
                      <label htmlFor="isActive" className="text-xs font-black uppercase tracking-widest text-[#321B13]">Rendre ce service actif immédiatement</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-[#321B13] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#BC9C6C] transition-all shadow-xl shadow-[#321B13]/10"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingService ? "Sauvegarder les modifications" : "Créer le service"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
