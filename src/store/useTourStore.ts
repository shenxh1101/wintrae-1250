import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Show,
  Personnel,
  Equipment,
  MaterialItem,
  Communication,
  Issue,
  VenuePhoto,
  Settlement,
  ReminderItem,
  HandoverTemplate,
  HandoverConfirmation,
} from '../types';
import {
  mockShows,
  mockPersonnel,
  mockEquipment,
  mockMaterials,
  mockCommunications,
  mockIssues,
  mockVenuePhotos,
  mockSettlements,
  mockReminders,
} from '../data/mockData';

interface TourState {
  shows: Show[];
  personnel: Personnel[];
  equipment: Equipment[];
  materials: MaterialItem[];
  communications: Communication[];
  issues: Issue[];
  venuePhotos: VenuePhoto[];
  settlements: Settlement[];
  reminders: ReminderItem[];
  handoverTemplates: HandoverTemplate[];
  handoverConfirmations: HandoverConfirmation[];
  currentShowId: string | null;

  setCurrentShowId: (id: string | null) => void;

  addShow: (show: Omit<Show, 'id'>) => void;
  updateShow: (id: string, updates: Partial<Show>) => void;
  deleteShow: (id: string) => void;
  duplicateShow: (sourceId: string, newDate?: string) => string;

  addPersonnel: (personnel: Omit<Personnel, 'id'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;

  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  updateMaterialStatus: (id: string, status: MaterialItem['status']) => void;
  addMaterial: (material: Omit<MaterialItem, 'id' | 'updatedAt'>) => void;
  updateMaterial: (id: string, updates: Partial<MaterialItem>) => void;

  addCommunication: (comm: Omit<Communication, 'id'>) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'createdAt'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;

  addVenuePhoto: (photo: Omit<VenuePhoto, 'id'>) => void;
  deleteVenuePhoto: (id: string) => void;

  updateSettlement: (showId: string, updates: Partial<Settlement>) => void;
  archiveShow: (showId: string) => void;

  addHandoverTemplate: (template: Omit<HandoverTemplate, 'id' | 'createdAt'>) => void;
  updateHandoverTemplate: (id: string, updates: Partial<HandoverTemplate>) => void;
  deleteHandoverTemplate: (id: string) => void;

  addHandoverConfirmation: (confirmation: Omit<HandoverConfirmation, 'id'>) => void;
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      shows: mockShows,
      personnel: mockPersonnel,
      equipment: mockEquipment,
      materials: mockMaterials,
      communications: mockCommunications,
      issues: mockIssues,
      venuePhotos: mockVenuePhotos,
      settlements: mockSettlements,
      reminders: mockReminders,
      handoverTemplates: [],
      handoverConfirmations: [],
      currentShowId: null,

      setCurrentShowId: (id) => set({ currentShowId: id }),

      addShow: (show) => {
        const newShowId = generateId('show');
        const newShow = { ...show, id: newShowId };
        const newSettlement: Settlement = {
          id: generateId('s'),
          showId: newShowId,
          actualBoxOffice: 0,
          guaranteeFee: 0,
          shareRatio: 50,
          isArchived: false,
          ticketSoldVip: 0,
          ticketSoldStandard: 0,
          expenses: 0,
        };
        set((state) => ({
          shows: [...state.shows, newShow],
          settlements: [...state.settlements, newSettlement],
        }));
      },

      updateShow: (id, updates) =>
        set((state) => ({
          shows: state.shows.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteShow: (id) =>
        set((state) => ({
          shows: state.shows.filter((s) => s.id !== id),
          personnel: state.personnel.filter((p) => p.showId !== id),
          equipment: state.equipment.filter((e) => e.showId !== id),
          materials: state.materials.filter((m) => m.showId !== id),
          communications: state.communications.filter((c) => c.showId !== id),
          issues: state.issues.filter((i) => i.showId !== id),
          venuePhotos: state.venuePhotos.filter((v) => v.showId !== id),
          settlements: state.settlements.filter((s) => s.showId !== id),
        })),

      duplicateShow: (sourceId, newDate) => {
        const state = get();
        const sourceShow = state.shows.find((s) => s.id === sourceId);
        if (!sourceShow) return '';

        const newShowId = generateId('show');
        const newShow: Show = {
          ...sourceShow,
          id: newShowId,
          date: newDate || sourceShow.date,
          status: 'pending',
        };

        const newPersonnel = state.personnel
          .filter((p) => p.showId === sourceId)
          .map((p) => ({ ...p, id: generateId('p'), showId: newShowId }));

        const newEquipment = state.equipment
          .filter((e) => e.showId === sourceId)
          .map((e) => ({ ...e, id: generateId('e'), showId: newShowId }));

        const newMaterials = state.materials
          .filter((m) => m.showId === sourceId)
          .map((m) => ({
            ...m,
            id: generateId('m'),
            showId: newShowId,
            status: 'not_started' as const,
            trackingNumber: undefined,
            shippedDate: undefined,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          }));

        const newIssues = state.issues
          .filter((i) => i.showId === sourceId && !i.isKeyReminder)
          .map((i) => ({
            ...i,
            id: generateId('i'),
            showId: newShowId,
            status: 'open' as const,
            createdAt: new Date().toISOString().slice(0, 10),
          }));

        const newSettlement: Settlement = {
          id: generateId('s'),
          showId: newShowId,
          actualBoxOffice: 0,
          guaranteeFee: sourceShow.ticketTotal * 100,
          shareRatio: 60,
          isArchived: false,
          ticketSoldVip: 0,
          ticketSoldStandard: 0,
          expenses: 0,
        };

        set((state) => ({
          shows: [...state.shows, newShow],
          personnel: [...state.personnel, ...newPersonnel],
          equipment: [...state.equipment, ...newEquipment],
          materials: [...state.materials, ...newMaterials],
          issues: [...state.issues, ...newIssues],
          settlements: [...state.settlements, newSettlement],
        }));

        return newShowId;
      },

      addPersonnel: (personnel) =>
        set((state) => ({
          personnel: [
            ...state.personnel,
            { ...personnel, id: generateId('p') },
          ],
        })),

      updatePersonnel: (id, updates) =>
        set((state) => ({
          personnel: state.personnel.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePersonnel: (id) =>
        set((state) => ({
          personnel: state.personnel.filter((p) => p.id !== id),
        })),

      addEquipment: (equipment) =>
        set((state) => ({
          equipment: [
            ...state.equipment,
            { ...equipment, id: generateId('e') },
          ],
        })),

      updateEquipment: (id, updates) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        })),

      updateMaterialStatus: (id, status) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  updatedAt: new Date()
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' '),
                }
              : m
          ),
        })),

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            {
              ...material,
              id: generateId('m'),
              updatedAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace('T', ' '),
            },
          ],
        })),

      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id
              ? {
                  ...m,
                  ...updates,
                  updatedAt: new Date()
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' '),
                }
              : m
          ),
        })),

      addCommunication: (comm) =>
        set((state) => ({
          communications: [
            ...state.communications,
            { ...comm, id: generateId('c') },
          ],
        })),

      addIssue: (issue) =>
        set((state) => ({
          issues: [
            ...state.issues,
            {
              ...issue,
              id: generateId('i'),
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      addVenuePhoto: (photo) =>
        set((state) => ({
          venuePhotos: [
            ...state.venuePhotos,
            { ...photo, id: generateId('v') },
          ],
        })),

      deleteVenuePhoto: (id) =>
        set((state) => ({
          venuePhotos: state.venuePhotos.filter((v) => v.id !== id),
        })),

      updateSettlement: (showId, updates) =>
        set((state) => {
          const existing = state.settlements.find((s) => s.showId === showId);
          if (existing) {
            return {
              settlements: state.settlements.map((s) =>
                s.showId === showId ? { ...s, ...updates } : s
              ),
            };
          }
          return {
            settlements: [
              ...state.settlements,
              {
                id: generateId('s'),
                showId,
                actualBoxOffice: 0,
                guaranteeFee: 0,
                shareRatio: 50,
                isArchived: false,
                ...updates,
              },
            ],
          };
        }),

      archiveShow: (showId) =>
        set((state) => ({
          shows: state.shows.map((s) =>
            s.id === showId ? { ...s, status: 'archived' } : s
          ),
          settlements: state.settlements.map((s) =>
            s.showId === showId ? { ...s, isArchived: true } : s
          ),
        })),

      addHandoverTemplate: (template) =>
        set((state) => ({
          handoverTemplates: [
            ...state.handoverTemplates,
            {
              ...template,
              id: generateId('tpl'),
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            },
          ],
        })),

      updateHandoverTemplate: (id, updates) =>
        set((state) => ({
          handoverTemplates: state.handoverTemplates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteHandoverTemplate: (id) =>
        set((state) => ({
          handoverTemplates: state.handoverTemplates.filter((t) => t.id !== id),
        })),

      addHandoverConfirmation: (confirmation) =>
        set((state) => ({
          handoverConfirmations: [
            ...state.handoverConfirmations,
            { ...confirmation, id: generateId('conf') },
          ],
        })),
    }),
    {
      name: 'tour-management-storage',
    }
  )
);
