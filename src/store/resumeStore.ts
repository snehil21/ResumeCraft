import { create } from "zustand";
import { SECTIONS, SECTION_LABELS, SectionKey } from "../constants";
import {
  FormValues,
  ResumeColumns,
  ResumeDocument,
  ResumeInformation,
  Section,
  TemplateId,
} from "../types";

const DEFAULT_COLUMNS: ResumeColumns = [
  [SECTIONS.project, SECTIONS.education, SECTIONS.summary],
  [SECTIONS.workExp, SECTIONS.achievement, SECTIONS.other],
];

const DEFAULT_SECTION_ORDER = [
  SECTIONS.summary,
  SECTIONS.workExp,
  SECTIONS.education,
  SECTIONS.project,
  SECTIONS.achievement,
  SECTIONS.other,
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
});

const createResumeDocument = (kind: "blank" | "sample"): ResumeDocument => {
  const timestamp = new Date().toISOString();

  return {
    schemaVersion: 1,
    id: createId("resume"),
    title: kind === "blank" ? "Untitled resume" : "Sample resume",
    resumeInformation:
      kind === "blank"
        ? createBlankResumeInformation()
        : createSampleResumeInformation(),
    template: "classic",
    theme: {
      accentColor: "#239ce2",
      fontFamily: "Inter, Arial, sans-serif",
      baseFontSize: 14,
      lineHeight: 1.4,
      headingScale: 1,
      textColor: "#1f2937",
      sectionGap: 16,
      itemGap: 12,
    },
    page: { size: "A4", margin: 24 },
    layout: {
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      columns: DEFAULT_COLUMNS.map((column) => [...column]) as ResumeColumns,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
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
  activeSectionKey: SectionKey;
  activeDetailIndex: number;
  currentFormValues: FormValues;
  updateResumeSection: (sectionKey: string, section: Partial<Section>) => void;
  setAccentColor: (color: string) => void;
  setTemplate: (template: TemplateId) => void;
  setSectionColumns: (columns: ResumeColumns) => void;
  setSectionVisibility: (sectionKey: string, visible: boolean) => void;
  setActiveSectionKey: (key: SectionKey) => void;
  setActiveDetailIndex: (index: number) => void;
  setCurrentFormValues: (values: FormValues) => void;
  updateFormValues: (values: Partial<FormValues>) => void;
  addDetail: (sectionKey: string) => void;
  deleteDetail: (sectionKey: string, index: number) => void;
  startBlankResume: () => void;
  loadSampleResume: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  document: createResumeDocument("sample"),
  activeSectionKey: SECTIONS.basicInfo,
  activeDetailIndex: 0,
  currentFormValues: {},

  updateResumeSection: (sectionKey, sectionUpdate) =>
    set((state) => ({
      document: touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: {
            ...state.document.resumeInformation[sectionKey],
            ...sectionUpdate,
          },
        },
      }),
    })),

  setAccentColor: (color) =>
    set((state) => ({
      document: touchDocument(state.document, {
        theme: { ...state.document.theme, accentColor: color },
      }),
    })),

  setTemplate: (template) =>
    set((state) => ({
      document: touchDocument(state.document, { template }),
    })),

  setSectionColumns: (columns) =>
    set((state) => ({
      document: touchDocument(state.document, {
        layout: {
          ...state.document.layout,
          columns,
          sectionOrder: columns.flat(),
        },
      }),
    })),

  setSectionVisibility: (sectionKey, visible) =>
    set((state) => ({
      document: touchDocument(state.document, {
        resumeInformation: {
          ...state.document.resumeInformation,
          [sectionKey]: {
            ...state.document.resumeInformation[sectionKey],
            visible,
          },
        },
      }),
    })),

  setActiveSectionKey: (key) =>
    set({ activeSectionKey: key, activeDetailIndex: 0 }),
  setActiveDetailIndex: (index) => set({ activeDetailIndex: index }),
  setCurrentFormValues: (values) => set({ currentFormValues: values }),
  updateFormValues: (values) =>
    set((state) => ({
      currentFormValues: { ...state.currentFormValues, ...values },
    })),

  startBlankResume: () =>
    set({
      document: createResumeDocument("blank"),
      activeSectionKey: SECTIONS.basicInfo,
      activeDetailIndex: 0,
      currentFormValues: {},
    }),

  loadSampleResume: () =>
    set({
      document: createResumeDocument("sample"),
      activeSectionKey: SECTIONS.basicInfo,
      activeDetailIndex: 0,
      currentFormValues: {},
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
        document: touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details },
          },
        }),
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
        document: touchDocument(state.document, {
          resumeInformation: {
            ...state.document.resumeInformation,
            [sectionKey]: { ...section, details: nextDetails },
          },
        }),
        activeDetailIndex: Math.max(
          0,
          Math.min(state.activeDetailIndex, nextDetails.length - 1)
        ),
      };
    }),
}));
