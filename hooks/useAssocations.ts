import { useState, useEffect } from 'react';
import { useDebounce } from "@/hooks/use-debounce";
import { getAssociations, getCategories } from "@/lib/actions/association.actions";
import { Association } from "@/types/types";

interface UseAssociationsOptions {
  debounceDelay?: number;
  initialLimit?: number;
}

interface UseAssociationsReturn {
  // Data
  allAssociations: Association[];
  filteredAssociations: Association[];
  categories: string[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Modal
  selectedAssociation: Association | null;
  setSelectedAssociation: (association: Association | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  
  // Utils
  gradients: string[];
  
  // Actions
  refreshAssociations: () => void;
}

export const useAssociations = (
  options: UseAssociationsOptions = {}
): UseAssociationsReturn => {
  const { debounceDelay = 300, initialLimit = 100 } = options;
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAssociations, setAllAssociations] = useState<Association[]>([]);
  const [filteredAssociations, setFilteredAssociations] = useState<Association[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Modal State
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Gradients constants
  const gradients = [
    "from-blue-400 to-purple-500",
    "from-green-400 to-blue-500",
    "from-purple-400 to-pink-500",
    "from-yellow-400 to-red-500",
    "from-indigo-400 to-purple-500",
    "from-pink-400 to-red-500",
    "from-teal-400 to-blue-500",
    "from-orange-400 to-pink-500"
  ];
  
  // Load associations
  const loadAllAssociations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAssociations({ limit: initialLimit });
      
      if (!result.success) {
        setError(result.error || "Une erreur est survenue lors du chargement");
        setAllAssociations([]);
      } else {
        const associations = result.data || [];
        setAllAssociations(associations);
        setFilteredAssociations(associations);
      }
    } catch (err) {
      setError("Une erreur est survenue lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load categories
  const loadCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories", err);
    }
  };
  
  // Client-side filtering
  const filterAssociations = () => {
    let filtered = allAssociations;
    
    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(association =>
        association.name.toLowerCase().includes(searchLower) ||
        association.description?.toLowerCase().includes(searchLower) ||
        association.city?.toLowerCase().includes(searchLower) ||
        association.address?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(association => association.category === selectedCategory);
    }
    
    setFilteredAssociations(filtered);
  };
  
  // Effects
  useEffect(() => {
    filterAssociations();
  }, [debouncedSearchTerm, selectedCategory, allAssociations]);
  
  useEffect(() => {
    loadAllAssociations();
    loadCategories();
  }, []);
  
  return {
    // Data
    allAssociations,
    filteredAssociations,
    categories,
    
    // UI State
    loading,
    error,
    
    // Search & Filter
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    
    // Modal
    selectedAssociation,
    setSelectedAssociation,
    isModalOpen,
    setIsModalOpen,
    
    // Utils
    gradients,
    
    // Actions
    refreshAssociations: loadAllAssociations,
  };
};