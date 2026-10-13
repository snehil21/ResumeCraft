import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_RESUME_THEME,
  DESIGN_LIMITS,
  DESIGN_PRESETS,
  SECTIONS,
  SECTION_LABELS,
} from "../constants";
import {
  DesignPreset,
  FormValues,
  LayoutMode,
  PageSettings,
  ResumeColumns,
  ResumeDocument,
  ResumeInformation,
  ResumeTheme,
  Section,
  TemplateId,
} from "../types";
import {
  isResumeDocument,
  RESUME_STORAGE_KEY,
} from "../utils/resumeDocument";

const DEFAULT_COLUMNS: ResumeColumns = [
  [SECTIONS.summary, SECTIONS.project, SECTIONS.education, SECTIONS.skills, SECTIONS.languages],
  [SECTIONS.workExp, SECTIONS.achievement, SECTIONS.certifications, SECTIONS.volunteering, SECTIONS.publications, SECTIONS.courses, SECTIONS.other],
];

const DEFAULT_SECTION_ORDER = [
  SECTIONS.summary,
  SECTIONS.workExp,
  SECTIONS.education,
  SECTIONS.project,
  SECTIONS.achievement,
  SECTIONS.other,
  SECTIONS.skills,
  SECTIONS.certifications,
  SECTIONS.languages,
  SECTIONS.awards,
  SECTIONS.volunteering,
  SECTIONS.publications,
  SECTIONS.courses,
];

const createId = (prefix: string): string => {
  const randomId = globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
};

const withVisibility = (section: Omit<Section, "visible">): Section => ({
  ...section,
  visible: true,
});

const createListSection = (id: string, sectionTitle: string): Section => ({
  id,
  sectionTitle,
  visible: false,
  kind: "list",
  points: [],
});

const createOptionalSections = (): ResumeInformation => ({
  [SECTIONS.skills]: createListSection(SECTIONS.skills, SECTION_LABELS.skills),
  [SECTIONS.certifications]: createListSection(SECTIONS.certifications, SECTION_LABELS.certifications),
  [SECTIONS.languages]: createListSection(SECTIONS.languages, SECTION_LABELS.languages),
  [SECTIONS.awards]: createListSection(SECTIONS.awards, SECTION_LABELS.awards),
  [SECTIONS.volunteering]: createListSection(SECTIONS.volunteering, SECTION_LABELS.volunteering),
  [SECTIONS.publications]: createListSection(SECTIONS.publications, SECTION_LABELS.publications),
  [SECTIONS.courses]: createListSection(SECTIONS.courses, SECTION_LABELS.courses),
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clampTheme = (current: ResumeTheme, update: Partial<ResumeTheme>): ResumeTheme => {
  const dateFormat = update.dateFormat ?? current.dateFormat;
  return {
    ...current,
    ...update,
    dateFormat: dateFormat === "MM/YYYY" || dateFormat === "YYYY" ? dateFormat : "MMM YYYY",
    baseFontSize: clamp(update.baseFontSize ?? current.baseFontSize, DESIGN_LIMITS.baseFontSize.min, DESIGN_LIMITS.baseFontSize.max),
    nameFontSize: clamp(update.nameFontSize ?? current.nameFontSize, DESIGN_LIMITS.nameFontSize.min, DESIGN_LIMITS.nameFontSize.max),
    headingFontSize: clamp(update.headingFontSize ?? current.headingFontSize, DESIGN_LIMITS.headingFontSize.min, DESIGN_LIMITS.headingFontSize.max),
    lineHeight: clamp(update.lineHeight ?? current.lineHeight, DESIGN_LIMITS.lineHeight.min, DESIGN_LIMITS.lineHeight.max),
    sectionGap: clamp(update.sectionGap ?? current.sectionGap, DESIGN_LIMITS.sectionGap.min, DESIGN_LIMITS.sectionGap.max),
    itemGap: clamp(update.itemGap ?? current.itemGap, DESIGN_LIMITS.itemGap.min, DESIGN_LIMITS.itemGap.max),
  };
};

const createSampleResumeInformation = (): ResumeInformation => ({
  [SECTIONS.basicInfo]: withVisibility({
    id: SECTIONS.basicInfo,
    sectionTitle: SECTION_LABELS.basicInfo,
    detail: {
      name: "John Doe",
      title: "Full Stack Developer",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
    },
  }),
  [SECTIONS.workExp]: withVisibility({
    id: SECTIONS.workExp,
    sectionTitle: SECTION_LABELS.workExp,
    details: [
      {
        id: "sample-work-1",
        title: "Senior Full Stack Developer",
        companyName: "Tech Company Inc.",
        location: "San Francisco, CA",
        startDate: "2022-06-01",
        endDate: "2024-12-31",
        points: [
          "Led development of microservices architecture using Node.js and NestJS",
          "Optimized cloud infrastructure on AWS reducing costs by 35%",
          "Mentored 5+ junior developers and conducted code reviews",
          "Implemented CI/CD pipelines using GitLab and Docker",
        ],
      },
      {
        id: "sample-work-2",
        title: "Full Stack Developer",
        companyName: "Digital Solutions Ltd.",
        location: "New York, NY",
        startDate: "2020-03-15",
        endDate: "2022-05-31",
        points: [
          "Built responsive web applications using React.js and Next.js",
          "Designed and implemented RESTful APIs with Node.js and Express",
          "Managed databases using MySQL and MongoDB",
          "Deployed applications on AWS Lambda and API Gateway",
        ],
      },
      {
        id: "sample-work-3",
        title: "Junior Developer",
        companyName: "Software Innovations Corp.",
        location: "Boston, MA",
        startDate: "2019-07-01",
        endDate: "2020-02-28",
        points: [
          "Developed features using core web technologies: HTML, CSS, JavaScript",
          "Collaborated with team using Git and GitHub for version control",
          "Participated in agile development and sprint planning",
          "Fixed bugs and optimized code performance",
        ],
      },
    ],
  }),
  [SECTIONS.project]: withVisibility({
    id: SECTIONS.project,
    sectionTitle: SECTION_LABELS.project,
    details: [
      {
        id: "sample-project-1",
        title: "Resume Builder Application",
        overview: "A modern resume builder with live preview",
        link: "https://resumecraft.netlify.app",
        github: "https://github.com/snehil21/ResumeCraft",
        points: [
          "Built with React 19 and TypeScript for type-safe development",
          "Implemented state management with Zustand for efficient data flow",
          "Drag and drop functionality for section rearrangement",
          "PDF export feature using react-to-print library",
          "Responsive design with CSS Modules for styling",
        ],
      },
      {
        id: "sample-project-2",
        title: "E-Commerce Platform",
        overview: "Full-stack e-commerce solution with payment integration",
        link: "https://ecommerce-demo.vercel.app",
        github: "https://github.com/johndoe/ecommerce-platform",
        points: [
          "Frontend: Next.js with TypeScript and React",
          "Backend: Node.js with NestJS and MongoDB",
          "Integrated Stripe for payment processing",
          "Implemented JWT authentication and authorization",
          "Deployed on AWS Lambda and RDS for database",
        ],
      },
      {
        id: "sample-project-3",
        title: "Real-time Chat Application",
        overview: "Scalable chat application with WebSocket support",
        link: "https://chat-app-demo.herokuapp.com",
        github: "https://github.com/johndoe/chat-application",
        points: [
          "Real-time messaging using Socket.io and Node.js",
          "React frontend with state management using Zustand",
          "MySQL database for persistent storage",
          "Docker containerization for easy deployment",
          "CI/CD pipeline using GitLab for automated testing",
        ],
      },
    ],
  }),
  [SECTIONS.education]: withVisibility({
    id: SECTIONS.education,
    sectionTitle: SECTION_LABELS.education,
    details: [
      {
        id: "sample-education-1",
        title: "Bachelor of Science in Computer Science",
        college: "University of Technology",
        startDate: "2018-09-01",
        endDate: "2022-05-31",
      },
    ],
  }),
  [SECTIONS.achievement]: withVisibility({
    id: SECTIONS.achievement,
    sectionTitle: SECTION_LABELS.achievement,
    points: [
      "AWS Certified Solutions Architect",
      "Published 5+ technical articles on Medium",
      "Open source contributor",
    ],
  }),
  [SECTIONS.summary]: withVisibility({
    id: SECTIONS.summary,
    sectionTitle: SECTION_LABELS.summary,
    detail:
      "Experienced full stack developer with 5+ years of expertise in building scalable web applications. Passionate about clean code and modern development practices.",
  }),
  [SECTIONS.other]: withVisibility({
    id: SECTIONS.other,
    sectionTitle: SECTION_LABELS.other,
    detail:
      "Languages: C, C++, Java, JavaScript(TypeScript), SQL | Developer Tools: VS Code, Eclipse, NetBeans, Git, GitHub, MySQL, MongoDB, Zustand | Web Technologies/Frameworks: HTML, CSS, JavaScript, React Js, Next Js, Node Js, Nest Js | Cloud/Infra: AWS(Lambda, SQS, SNS, Cloudwatch, API Gateway), Terraform, Docker, Gitlab(CI/CD)",
  }),
  ...createOptionalSections(),
});

const createBlankResumeInformation = (): ResumeInformation => ({
  [SECTIONS.basicInfo]: withVisibility({
    id: SECTIONS.basicInfo,
    sectionTitle: SECTION_LABELS.basicInfo,
    detail: {},
  }),
  [SECTIONS.workExp]: withVisibility({
    id: SECTIONS.workExp,
    sectionTitle: SECTION_LABELS.workExp,
    details: [{ id: createId("work") }],
  }),
  [SECTIONS.project]: withVisibility({
    id: SECTIONS.project,
    sectionTitle: SECTION_LABELS.project,
    details: [{ id: createId("project") }],
  }),
  [SECTIONS.education]: withVisibility({
    id: SECTIONS.education,
    sectionTitle: SECTION_LABELS.education,
    details: [{ id: createId("education") }],
  }),
  [SECTIONS.achievement]: withVisibility({
    id: SECTIONS.achievement,
    sectionTitle: SECTION_LABELS.achievement,
    points: [],
  }),
  [SECTIONS.summary]: withVisibility({
    id: SECTIONS.summary,
    sectionTitle: SECTION_LABELS.summary,
    detail: "",
  }),
  [SECTIONS.other]: withVisibility({
    id: SECTIONS.other,
    sectionTitle: SECTION_LABELS.other,
    detail: "",
  }),
  ...createOptionalSections(),
});

const SECTION_KINDS: Record<string, Section["kind"]> = {
  [SECTIONS.basicInfo]: "basicInfo",
  [SECTIONS.workExp]: "workExp",
  [SECTIONS.project]: "project",
  [SECTIONS.education]: "education",
  [SECTIONS.summary]: "summary",
  [SECTIONS.achievement]: "list",
  [SECTIONS.other]: "text",
  [SECTIONS.skills]: "list",
  [SECTIONS.certifications]: "list",
  [SECTIONS.languages]: "list",
  [SECTIONS.awards]: "list",
  [SECTIONS.volunteering]: "list",
  [SECTIONS.publications]: "list",
  [SECTIONS.courses]: "list",
};

const normalizeResumeDocument = (document: ResumeDocument): ResumeDocument => {
  const optionalSections = createOptionalSections();
  const resumeInformation: ResumeInformation = { ...document.resumeInformation };

  Object.entries(optionalSections).forEach(([key, section]) => {
    if (!resumeInformation[key]) resumeInformation[key] = section;
  });

  Object.entries(resumeInformation).forEach(([key, section]) => {
    resumeInformation[key] = { ...section, kind: section.kind ?? SECTION_KINDS[key] ?? "text" };
  });

  const existingOrder = document.layout.sectionOrder.filter(
    (key) => resumeInformation[key] && !resumeInformation[key].deleted && key !== SECTIONS.basicInfo
  );
  const missingOrder = DEFAULT_SECTION_ORDER.filter(
    (key) => resumeInformation[key] && !resumeInformation[key].deleted && !existingOrder.includes(key)
  );
  const sectionOrder = [...existingOrder, ...missingOrder];
  const listedKeys = new Set(document.layout.columns.flat());
  const columns: ResumeColumns = [
    document.layout.columns[0].filter((key) => sectionOrder.includes(key)),
    document.layout.columns[1].filter((key) => sectionOrder.includes(key)),
  ];
  sectionOrder.forEach((key, index) => {
    if (!listedKeys.has(key)) columns[index % 2].push(key);
  });

  return {
    ...document,
    resumeInformation,
    theme: clampTheme(DEFAULT_RESUME_THEME, document.theme),
    page: {
      ...document.page,
      margin: clamp(document.page.margin, DESIGN_LIMITS.pageMargin.min, DESIGN_LIMITS.pageMargin.max),
    },
    layout: {
      sectionOrder,
      columns,
      mode: document.layout.mode === "one" || document.layout.mode === "two"
        ? document.layout.mode
        : document.template === "classic" ? "two" : "one",
      columnRatio: clamp(document.layout.columnRatio ?? 55, DESIGN_LIMITS.columnRatio.min, DESIGN_LIMITS.columnRatio.max),
    },
  };
};

const createResumeDocument = (kind: "blank" | "sample"): ResumeDocument => {
  const timestamp = new Date().toISOString();

  return normalizeResumeDocument({
    schemaVersion: 1,
    id: createId("resume"),
    title: kind === "blank" ? "Untitled resume" : "Sample resume",
    resumeInformation:
      kind === "blank"
        ? createBlankResumeInformation()
        : createSampleResumeInformation(),
    template: "classic",
    theme: { ...DEFAULT_RESUME_THEME },
    page: { size: "A4", margin: 24 },
    layout: {
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      columns: DEFAULT_COLUMNS.map((column) => [...column]) as ResumeColumns,
      mode: "two",
      columnRatio: 55,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

const touchDocument = (
  document: ResumeDocument,
  update: Partial<ResumeDocument>
): ResumeDocument => ({
  ...document,
  ...update,
  updatedAt: new Date().toISOString(),
});

const hasDetailContent = (detail: object | undefined): boolean =>
  Object.entries(detail ?? {}).some(
    ([key, value]) => key !== "id" && value !== undefined && value !== ""
  );

interface ResumeStore {
  document: ResumeDocument;
  pastDocuments: ResumeDocument[];
  futureDocuments: ResumeDocument[];
  activeSectionKey: string;
  activeDetailIndex: number;
  currentFormValues: FormValues;
  updateResumeSection: (sectionKey: string, section: Partial<Section>) => void;
  setAccentColor: (color: string) => void;
  updateTheme: (theme: Partial<ResumeTheme>) => void;
  updatePageSettings: (page: Partial<PageSettings>) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setColumnRatio: (ratio: number) => void;
  applyDesignPreset: (preset: DesignPreset) => void;
  resetTemplateDefaults: () => void;
  setTemplate: (template: TemplateId) => void;
  setSectionColumns: (columns: ResumeColumns) => void;
  setSectionVisibility: (sectionKey: string, visible: boolean) => void;
  setActiveSectionKey: (key: string) => void;
  setActiveDetailIndex: (index: number) => void;
  setCurrentFormValues: (values: FormValues) => void;
  updateFormValues: (values: Partial<FormValues>) => void;
  addDetail: (sectionKey: string) => void;
  deleteDetail: (sectionKey: string, index: number) => void;
  startBlankResume: () => void;
  loadSampleResume: () => void;
  resetResume: () => void;
  importResumeDocument: (document: ResumeDocument) => void;
  ensureDocumentSaved: () => void;
  undo: () => void;
  redo: () => void;
  moveSection: (sectionKey: string, direction: -1 | 1) => void;
  duplicateSection: (sectionKey: string) => void;
  deleteSection: (sectionKey: string) => void;
  restoreSection: (sectionKey: string) => void;
  addCustomSection: (kind: "text" | "list", title: string) => void;
  moveDetail: (sectionKey: string, index: number, direction: -1 | 1) => void;
  duplicateDetail: (sectionKey: string, index: number) => void;
  addPoint: (sectionKey: string) => void;
  updatePoint: (sectionKey: string, index: number, value: string) => void;
  movePoint: (sectionKey: string, index: number, direction: -1 | 1) => void;
  duplicatePoint: (sectionKey: string, index: number) => void;
  deletePoint: (sectionKey: string, index: number) => void;
}

const HISTORY_LIMIT = 50;

const withDocumentHistory = (
  state: ResumeStore,
  document: ResumeDocument
): Pick<ResumeStore, "document" | "pastDocuments" | "futureDocuments"> => ({
  document,
  pastDocuments: [...state.pastDocuments, state.document].slice(-HISTORY_LIMIT),
  futureDocuments: [],
});

const columnsFromOrder = (sectionOrder: string[]): ResumeColumns => [
  sectionOrder.filter((_, index) => index % 2 === 0),
  sectionOrder.filter((_, index) => index % 2 === 1),
];

export const useResumeStore = create<ResumeStore>()(persist((set) => ({
  document: createResumeDocument("blank"),
  pastDocuments: [],
  futureDocuments: [],
  activeSectionKey: SECTIONS.basicInfo,
  activeDetailIndex: 0,
  currentFormValues: {},

  updateResumeSection: (sectionKey, sectionUpdate) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: {
            ...state.document.resumeInformation[sectionKey],
            ...sectionUpdate,
          },
        },
      }))),

  setAccentColor: (color) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
        theme: { ...state.document.theme, accentColor: color },
      }))),

  updateTheme: (themeUpdate) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
      theme: clampTheme(state.document.theme, themeUpdate),
    }))),

  updatePageSettings: (pageUpdate) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
      page: {
        ...state.document.page,
        ...pageUpdate,
        margin: clamp(pageUpdate.margin ?? state.document.page.margin, DESIGN_LIMITS.pageMargin.min, DESIGN_LIMITS.pageMargin.max),
      },
    }))),

  setLayoutMode: (mode) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
      layout: { ...state.document.layout, mode },
    }))),

  setColumnRatio: (ratio) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
      layout: {
        ...state.document.layout,
        columnRatio: clamp(ratio, DESIGN_LIMITS.columnRatio.min, DESIGN_LIMITS.columnRatio.max),
      },
    }))),

  applyDesignPreset: (preset) =>
    set((state) => {
      const { pageMargin, ...themeUpdate } = DESIGN_PRESETS[preset];
      return withDocumentHistory(state, touchDocument(state.document, {
        theme: clampTheme(state.document.theme, themeUpdate),
        page: { ...state.document.page, margin: pageMargin },
      }));
    }),

  resetTemplateDefaults: () =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
      theme: { ...DEFAULT_RESUME_THEME },
      page: { size: "A4", margin: 24 },
      layout: {
        ...state.document.layout,
        mode: state.document.template === "classic" ? "two" : "one",
        columnRatio: 55,
      },
    }))),

  setTemplate: (template) =>
    set((state) => withDocumentHistory(
      state,
      touchDocument(state.document, { template })
    )),

  setSectionColumns: (columns) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
        layout: {
          ...state.document.layout,
          columns,
          sectionOrder: columns.flat(),
        },
      }))),

  setSectionVisibility: (sectionKey, visible) =>
    set((state) => withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: {
            ...state.document.resumeInformation[sectionKey],
            visible,
          },
        },
      }))),

  setActiveSectionKey: (key) =>
    set({ activeSectionKey: key, activeDetailIndex: 0 }),
  setActiveDetailIndex: (index) => set({ activeDetailIndex: index }),
  setCurrentFormValues: (values) => set({ currentFormValues: values }),
  updateFormValues: (values) =>
    set((state) => ({
      currentFormValues: { ...state.currentFormValues, ...values },
    })),

  startBlankResume: () =>
    set((state) => ({
      ...withDocumentHistory(state, createResumeDocument("blank")),
      activeSectionKey: SECTIONS.basicInfo,
      activeDetailIndex: 0,
      currentFormValues: {},
    })),

  loadSampleResume: () =>
    set((state) => ({
      ...withDocumentHistory(state, createResumeDocument("sample")),
      activeSectionKey: SECTIONS.basicInfo,
      activeDetailIndex: 0,
      currentFormValues: {},
    })),

  resetResume: () =>
    set((state) => {
      const blankDocument = createResumeDocument("blank");

      return {
        ...withDocumentHistory(state, {
          ...blankDocument,
          id: state.document.id,
          title: state.document.title,
          createdAt: state.document.createdAt,
        }),
        activeSectionKey: SECTIONS.basicInfo,
        activeDetailIndex: 0,
        currentFormValues: {},
      };
    }),

  importResumeDocument: (document) =>
    set((state) => ({
      ...withDocumentHistory(state, normalizeResumeDocument({
        ...document,
        updatedAt: new Date().toISOString(),
      })),
      activeSectionKey: SECTIONS.basicInfo,
      activeDetailIndex: 0,
      currentFormValues: {},
    })),

  ensureDocumentSaved: () =>
    set((state) => ({ document: state.document })),

  undo: () =>
    set((state) => {
      const previousDocument = state.pastDocuments[state.pastDocuments.length - 1];
      if (!previousDocument) return state;

      return {
        document: previousDocument,
        pastDocuments: state.pastDocuments.slice(0, -1),
        futureDocuments: [state.document, ...state.futureDocuments].slice(0, HISTORY_LIMIT),
      };
    }),

  redo: () =>
    set((state) => {
      const nextDocument = state.futureDocuments[0];
      if (!nextDocument) return state;

      return {
        document: nextDocument,
        pastDocuments: [...state.pastDocuments, state.document].slice(-HISTORY_LIMIT),
        futureDocuments: state.futureDocuments.slice(1),
      };
    }),

  moveSection: (sectionKey, direction) =>
    set((state) => {
      const sectionOrder = [...state.document.layout.sectionOrder];
      const currentIndex = sectionOrder.indexOf(sectionKey);
      const targetIndex = currentIndex + direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sectionOrder.length) return state;
      [sectionOrder[currentIndex], sectionOrder[targetIndex]] = [
        sectionOrder[targetIndex],
        sectionOrder[currentIndex],
      ];

      return withDocumentHistory(state, touchDocument(state.document, {
        layout: { ...state.document.layout, sectionOrder, columns: columnsFromOrder(sectionOrder) },
      }));
    }),

  duplicateSection: (sectionKey) =>
    set((state) => {
      const source = state.document.resumeInformation[sectionKey];
      if (!source || sectionKey === SECTIONS.basicInfo) return state;
      const duplicateKey = createId("section");
      const duplicate: Section = {
        ...source,
        id: duplicateKey,
        sectionTitle: `${source.sectionTitle} copy`,
        custom: true,
        deleted: false,
        details: source.details?.map((detail) => ({ ...detail, id: createId("entry") })) as Section["details"],
        points: "points" in source && source.points ? [...source.points] : undefined,
      };
      const sectionOrder = [...state.document.layout.sectionOrder];
      const sourceIndex = sectionOrder.indexOf(sectionKey);
      sectionOrder.splice(sourceIndex + 1, 0, duplicateKey);

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [duplicateKey]: duplicate,
          },
          layout: { ...state.document.layout, sectionOrder, columns: columnsFromOrder(sectionOrder) },
        })),
        activeSectionKey: duplicateKey,
        activeDetailIndex: 0,
      };
    }),

  deleteSection: (sectionKey) =>
    set((state) => {
      if (sectionKey === SECTIONS.basicInfo) return state;
      const section = state.document.resumeInformation[sectionKey];
      if (!section) return state;
      const sectionOrder = state.document.layout.sectionOrder.filter((key) => key !== sectionKey);

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, visible: false, deleted: true },
          },
          layout: { ...state.document.layout, sectionOrder, columns: columnsFromOrder(sectionOrder) },
        })),
        activeSectionKey: SECTIONS.basicInfo,
        activeDetailIndex: 0,
      };
    }),

  restoreSection: (sectionKey) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section) return state;
      const sectionOrder = state.document.layout.sectionOrder.includes(sectionKey)
        ? state.document.layout.sectionOrder
        : [...state.document.layout.sectionOrder, sectionKey];

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, visible: true, deleted: false },
          },
          layout: { ...state.document.layout, sectionOrder, columns: columnsFromOrder(sectionOrder) },
        })),
        activeSectionKey: sectionKey,
        activeDetailIndex: 0,
      };
    }),

  addCustomSection: (kind, title) =>
    set((state) => {
      const sectionKey = createId("custom");
      const section: Section = {
        id: sectionKey,
        sectionTitle: title.trim() || (kind === "list" ? "Custom list" : "Custom section"),
        visible: true,
        kind,
        custom: true,
        ...(kind === "list" ? { points: [""] } : { detail: "" }),
      };
      const sectionOrder = [...state.document.layout.sectionOrder, sectionKey];

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: { ...state.document.resumeInformation, [sectionKey]: section },
          layout: { ...state.document.layout, sectionOrder, columns: columnsFromOrder(sectionOrder) },
        })),
        activeSectionKey: sectionKey,
        activeDetailIndex: 0,
      };
    }),

  moveDetail: (sectionKey, index, direction) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section?.details) return state;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= section.details.length) return state;
      const details = [...section.details] as NonNullable<Section["details"]>;
      [details[index], details[targetIndex]] = [details[targetIndex], details[index]];

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details },
          },
        })),
        activeDetailIndex: targetIndex,
      };
    }),

  duplicateDetail: (sectionKey, index) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      const source = section?.details?.[index];
      if (!section?.details || !source) return state;
      const details = [...section.details] as NonNullable<Section["details"]>;
      details.splice(index + 1, 0, {
        ...source,
        id: createId("entry"),
        points: "points" in source && source.points ? [...source.points] : undefined,
      } as any);

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details },
          },
        })),
        activeDetailIndex: index + 1,
      };
    }),

  addPoint: (sectionKey) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section) return state;
      return withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: { ...section, points: [...(section.points ?? []), ""] },
        },
      }));
    }),

  updatePoint: (sectionKey, index, value) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section) return state;
      const points = [...(section.points ?? [])];
      points[index] = value;
      return withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: { ...section, points },
        },
      }));
    }),

  movePoint: (sectionKey, index, direction) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section?.points) return state;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= section.points.length) return state;
      const points = [...section.points];
      [points[index], points[targetIndex]] = [points[targetIndex], points[index]];
      return withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: { ...section, points },
        },
      }));
    }),

  duplicatePoint: (sectionKey, index) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section?.points?.[index] && section?.points?.[index] !== "") return state;
      const points = [...section.points];
      points.splice(index + 1, 0, points[index]);
      return withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: { ...section, points },
        },
      }));
    }),

  deletePoint: (sectionKey, index) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section?.points) return state;
      const points = section.points.filter((_, pointIndex) => pointIndex !== index);
      return withDocumentHistory(state, touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: { ...section, points },
        },
      }));
    }),

  addDetail: (sectionKey) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section.details) return state;

      const lastDetail = section.details.slice(-1)[0];
      if (lastDetail && !hasDetailContent(lastDetail)) return state;

      const details = [
        ...section.details,
        { id: createId(sectionKey) },
      ] as Section["details"];

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details },
          },
        })),
        activeDetailIndex: section.details.length,
      };
    }),

  deleteDetail: (sectionKey, index) =>
    set((state) => {
      const section = state.document.resumeInformation[sectionKey];
      if (!section.details) return state;

      const details = section.details.filter((_, itemIndex) => itemIndex !== index);
      const nextDetails = details.length
        ? details
        : ([{ id: createId(sectionKey) }] as Section["details"]);

      return {
        ...withDocumentHistory(state, touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details: nextDetails },
          },
        })),
        activeDetailIndex: Math.max(
          0,
          Math.min(state.activeDetailIndex, nextDetails.length - 1)
        ),
      };
    }),
}), {
  name: RESUME_STORAGE_KEY,
  version: 1,
  storage: createJSONStorage(() => ({
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // The builder verifies the persisted copy and exposes a failure state.
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // Storage may be unavailable in privacy-restricted browser contexts.
      }
    },
  })),
  partialize: (state) => ({ document: state.document }),
  merge: (persistedState, currentState) => {
    const persistedDocument = (persistedState as Partial<ResumeStore>)?.document;
    return isResumeDocument(persistedDocument)
      ? { ...currentState, document: normalizeResumeDocument(persistedDocument) }
      : currentState;
  },
}));
