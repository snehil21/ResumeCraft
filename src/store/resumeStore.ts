import { create } from "zustand";
import {
  FormValues,
  ResumeInformation,
  Section,
} from "../types";
import { SECTIONS, SECTION_LABELS, SectionKey } from "../constants";

// Helper function to initialize resume information with dummy data
const initializeResumeInformation = (): ResumeInformation => {
  return {
    [SECTIONS.basicInfo]: {
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
    },
    [SECTIONS.workExp]: {
      id: SECTIONS.workExp,
      sectionTitle: SECTION_LABELS.workExp,
      details: [
        {
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
    },
    [SECTIONS.project]: {
      id: SECTIONS.project,
      sectionTitle: SECTION_LABELS.project,
      details: [
        {
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
    },
    [SECTIONS.education]: {
      id: SECTIONS.education,
      sectionTitle: SECTION_LABELS.education,
      details: [
        {
          title: "Bachelor of Science in Computer Science",
          college: "University of Technology",
          startDate: "2018-09-01",
          endDate: "2022-05-31",
        },
      ],
    },
    [SECTIONS.achievement]: {
      id: SECTIONS.achievement,
      sectionTitle: SECTION_LABELS.achievement,
      points: [
        "AWS Certified Solutions Architect",
        "Published 5+ technical articles on Medium",
        "Open source contributor",
      ],
    },
    [SECTIONS.summary]: {
      id: SECTIONS.summary,
      sectionTitle: SECTION_LABELS.summary,
      detail: "Experienced full stack developer with 5+ years of expertise in building scalable web applications. Passionate about clean code and modern development practices.",
    },
    [SECTIONS.other]: {
      id: SECTIONS.other,
      sectionTitle: SECTION_LABELS.other,
      detail: "Languages: C, C++, Java, JavaScript(TypeScript), SQL | Developer Tools: VS Code, Eclipse, NetBeans, Git, GitHub, MySQL, MongoDB, Zustand | Web Technologies/Frameworks: HTML, CSS, JavaScript, React Js, Next Js, Node Js, Nest Js | Cloud/Infra: AWS(Lambda, SQS, SNS, Cloudwatch, API Gateway), Terraform, Docker, Gitlab(CI/CD)",
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
  activeTemplate: "classic" | "vertical";

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
  setActiveTemplate: (template: "classic" | "vertical") => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  resumeInformation: initializeResumeInformation(),
  activeColor: "#239ce2",
  activeSectionKey: SECTIONS.basicInfo,
  activeDetailIndex: 0,
  currentFormValues: {},
  activeTemplate: "classic",

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

  setActiveTemplate: (template) => set({ activeTemplate: template }),

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
