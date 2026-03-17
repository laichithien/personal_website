export const portfolioConfig = {
  hero: {
    name: "Your Name",
    title: "AI Engineer @ Your Company",
    tagline:
      "Building Agentic AI systems that automate complex workflows. Bridging cutting-edge GenAI with robust production systems.",
    avatar: "/images/avatar.jpg",
    location: "Ho Chi Minh City, Vietnam",
  },

  about: {
    summary:
      "Machine Learning Engineer with strong expertise in building Agentic AI systems and automating complex workflows. Proficient in orchestrating LLMs, implementing Human-in-the-loop architectures, and enforcing software engineering standards.",
    highlights: [
      "Architected Agentic AI systems using Pydantic-AI and OpenRouter",
      "Implemented Human-in-the-loop (HITL) capabilities for secure tool usage",
      "Published research on Object Detection at IEEE RIVF 2022",
      "IELTS 7.0 | GPA 8.42/10 - Top 10 graduating students at UIT",
    ],
  },

  experience: [
    {
      company: "Your Company",
      role: "AI Engineer",
      period: "Jun 2025 - Present",
      highlights: [
        "Architected Agentic AI system using Pydantic-AI to automate Customer Experience workflows",
        "Engineered dynamic tool execution with Human-in-the-loop capabilities",
        "Integrated Ragflow into Chatwoot for context-aware RAG support",
        "Orchestrated end-to-end automation for Ticket Exchange flows",
      ],
    },
    {
      company: "VUCAR",
      role: "Machine Learning Engineer",
      period: "Jan 2025 - Apr 2025",
      highlights: [
        "Developed VuSEO - AI-Agent automation tool processing 40-50 articles/day",
        "Enhanced ML model for car pricing accuracy",
      ],
    },
    {
      company: "UIT-Together Research Group",
      role: "Research Assistant",
      period: "Sep 2020 - Aug 2024",
      highlights: [
        "Researched Object Detection, Stable Diffusion, and Face Recognition",
        "Developed real-time demos and optimized inference using ONNX Runtime",
        "Mentored new research assistants on coding and communication",
      ],
    },
  ],

  education: {
    school: "VNU-HCM University of Information Technology",
    degree: "BS in Computer Science",
    period: "2020 - 2024",
    gpa: "8.42/10",
    rank: "Top 10/32 graduating students",
    coursework: [
      "Deep Learning Techniques",
      "Advanced Computer Vision",
      "Probability and Statistics",
      "Python for ML",
      "Data Mining",
    ],
  },

  techStack: [
    { name: "Python", icon: "python", category: "language" as const },
    { name: "TypeScript", icon: "typescript", category: "language" as const },
    { name: "Pydantic-AI", icon: "python", category: "ai" as const },
    { name: "PyTorch", icon: "pytorch", category: "ai" as const },
    { name: "FastAPI", icon: "fastapi", category: "backend" as const },
    { name: "Next.js", icon: "nextjs", category: "frontend" as const },
    { name: "PostgreSQL", icon: "postgres", category: "database" as const },
    { name: "Docker", icon: "docker", category: "devops" as const },
    { name: "Kubernetes", icon: "k8s", category: "devops" as const },
    { name: "Ragflow", icon: "ai", category: "ai" as const },
  ],

  projects: [
    {
      id: "1",
      title: "Agentic AI System @ Your Company",
      description:
        "Production system automating Customer Experience workflows with Human-in-the-loop tool execution and RAG integration",
      tags: ["Pydantic-AI", "OpenRouter", "Ragflow", "HITL"],
    },
    {
      id: "2",
      title: "VuSEO Automation",
      description:
        "AI-Agent powered SEO automation processing 40-50 articles/day with Google Workspace integration",
      tags: ["Python", "Strapi", "Google API", "AI Agent"],
    },
    {
      id: "3",
      title: "Homelab Infrastructure",
      description:
        "Self-hosted services on Kubernetes with monitoring via k9s, Kibana, and Logfire",
      tags: ["Docker", "K8s", "Terraform", "Monitoring"],
    },
  ],

  publications: [
    {
      title:
        "Empirical Study of the Performance of Object Detection Methods on Road Marking Dataset",
      venue: "IEEE RIVF 2022",
      doi: "10.1109/RIVF55975.2022.10013909",
      year: 2022,
    },
  ],

  achievements: [
    {
      title: "Innovation Award",
      event: "AI Tempo Run Competition",
      organization: "UIT AI Club",
      year: 2021,
    },
  ],

  courses: [
    {
      title: "Machine Learning Engineer K3",
      year: 2024,
      focus: ["Containerization", "Model Deployment", "CI/CD", "Data Engineering"],
    },
  ],

  lifestyle: {
    music: {
      instruments: ["Guitar", "Piano"],
      currentlyPlaying: "Lo-fi Beats",
    },
    routines: [
      "Morning: Code & Coffee",
      "Afternoon: Deep Work",
      "Evening: Music & Reading",
    ],
  },

  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://www.linkedin.com/in/yourprofile/",
    email: "contact@yourdomain.com",
    phone: "+00 000 000 000",
  },
};

export type PortfolioConfig = typeof portfolioConfig;
