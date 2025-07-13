import { useState, useEffect, useCallback } from "react";
import { Module, ModuleFormData } from "../types";
import { moduleAPI, mockModules } from "../services/api";

interface UseModulesReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
  refreshModules: () => Promise<void>;
  createModule: (data: ModuleFormData) => Promise<Module>;
  updateModule: (id: string, data: Partial<ModuleFormData>) => Promise<Module>;
  toggleModuleActive: (id: string, isActive: boolean) => Promise<Module>;
  getActiveModules: () => Module[];
}

export const useModules = (): UseModulesReturn => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use mock data for now - replace with actual API call when backend is ready
      // const response = await moduleAPI.getAll();
      // setModules(response.data);
      setModules(mockModules);
    } catch (err) {
      setError("Failed to load modules");
      console.error("Error loading modules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createModule = useCallback(
    async (data: ModuleFormData): Promise<Module> => {
      setLoading(true);
      setError(null);
      try {
        // Mock implementation - replace with actual API call
        const newModule: Module = {
          id: Date.now().toString(),
          name: data.name.trim(),
          description: data.description?.trim(),
          is_active: true,
          created_at: new Date().toISOString(),
        };

        setModules((prev) => [...prev, newModule]);
        return newModule;
      } catch (err) {
        setError("Failed to create module");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateModule = useCallback(
    async (id: string, data: Partial<ModuleFormData>): Promise<Module> => {
      setLoading(true);
      setError(null);
      try {
        // Mock implementation - replace with actual API call
        const updatedModule = modules.find((m) => m.id === id);
        if (!updatedModule) {
          throw new Error("Module not found");
        }

        const updated = {
          ...updatedModule,
          ...data,
          updated_at: new Date().toISOString(),
        };

        setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return updated;
      } catch (err) {
        setError("Failed to update module");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [modules],
  );

  const toggleModuleActive = useCallback(
    async (id: string, isActive: boolean): Promise<Module> => {
      setLoading(true);
      setError(null);
      try {
        // Mock implementation - replace with actual API call
        const module = modules.find((m) => m.id === id);
        if (!module) {
          throw new Error("Module not found");
        }

        const updated = {
          ...module,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        };

        setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return updated;
      } catch (err) {
        setError("Failed to toggle module status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [modules],
  );

  const getActiveModules = useCallback(() => {
    return modules.filter((m) => m.is_active);
  }, [modules]);

  useEffect(() => {
    refreshModules();
  }, [refreshModules]);

  return {
    modules,
    loading,
    error,
    refreshModules,
    createModule,
    updateModule,
    toggleModuleActive,
    getActiveModules,
  };
};
