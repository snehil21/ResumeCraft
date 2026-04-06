import { create } from "zustand";
import {
  FormValues,
  ResumeInformation,
  Section,
} from "../types";
import { SECTIONS, SECTION_LABELS, SectionKey } from "../constants";

// Helper function to initialize resume information
const initializeResumeInformation = (): ResumeInformation => {
  return {
    [SECTIONS.basicInfo]: {
      id: SECTIONS.basicInfo,
      sectionTitle: SECTION_LABELS.basicInfo,
      detail: {},
    },
    [SECTIONS.workExp]: {
      id: SECTIONS.workExp,
      sectionTitle: SECTION_LABELS.workExp,
      details: [],
    },
    [SECTIONS.project]: {
      id: SECTIONS.project,
      sectionTitle: SECTION_LABELS.project,
      details: [],
    },
    [SECTIONS.education]: {
      id: SECTIONS.education,
      sectionTitle: SECTION_LABELS.education,
      details: [],
    },
    [SECTIONS.achievement]: {
      id: SECTIONS.achievement,
      sectionTitle: SECTION_LABELS.achievement,
      points: [],
    },
    [SECTIONS.summary]: {
      id: SECTIONS.summary,
      sectionTitle: SECTION_LABELS.summary,
      detail: "",
    },
    [SECTIONS.other]: {
      id: SECTIONS.other,
      sectionTitle: SECTION_LABELS.other,
      detail: "",
    },
  };
};

interface ResumeStore {
  // State
  resumeInformation: ResumeInformation;
  activeColor: string;
  activeSectionKey: SectionKey;
  activeDetailIndex: number;
  currentFormValues: FormValues;

  // Actions
  setResumeInformation: (information: ResumeInformation) => void;
  updateResumeSection: (
    sectionKey: string,
    section: Partial<Section>
  ) => void;
  setActiveColor: (color: string) => void;
  setActiveSectionKey: (key: SectionKey) => void;
  setActiveDetailIndex: (index: number) => void;
  setCurrentFormValues: (values: FormValues) => void;
  updateFormValues: (values: Partial<FormValues>) => void;
  addDetail: (sectionKey: string) => void;
  deleteDetail: (sectionKey: string, index: number) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  resumeInformation: initializeResumeInformation(),
  activeColor: "#239ce2",
  activeSectionKey: SECTIONS.basicInfo,
  activeDetailIndex: 0,
  currentFormValues: {},

  // Actions
  setResumeInformation: (information) =>
    set({ resumeInformation: information }),

  updateResumeSection: (sectionKey, sectionUpdate) =>
    set((state) => ({
      resumeInformation: {
        ...state.resumeInformation,
        [sectionKey]: {
          ...state.resumeInformation[sectionKey],
          ...sectionUpdate,
        },
      },
    })),

  setActiveColor: (color) => set({ activeColor: color }),

  setActiveSectionKey: (key) => set({ activeSectionKey: key }),

  setActiveDetailIndex: (index) => set({ activeDetailIndex: index }),

  setCurrentFormValues: (values) => set({ currentFormValues: values }),

  updateFormValues: (values) =>
    set((state) => ({
      currentFormValues: { ...state.currentFormValues, ...values },
    })),

  addDetail: (sectionKey) =>
    set((state) => {
      const section = state.resumeInformation[sectionKey];
      if (!section.details) return state;

      const lastDetail = section.details.slice(-1)[0];
      if (!Object.keys(lastDetail || {}).length) return state;

      return {
        resumeInformation: {
          ...state.resumeInformation,
          [sectionKey]: {
            ...section,
            details: [...section.details, {}],
          },
        },
        activeDetailIndex: section.details.length,
      };
    }),

  deleteDetail: (sectionKey, index) =>
    set((state) => {
      const section = state.resumeInformation[sectionKey];
      if (!section.details) return state;

      const newDetails = [...section.details];
      newDetails.splice(index, 1);

      return {
        resumeInformation: {
          ...state.resumeInformation,
          [sectionKey]: {
            ...section,
            details: newDetails,
          },
        },
        activeDetailIndex: state.activeDetailIndex === index ? 0 : state.activeDetailIndex - 1,
      };
    }),
}));
