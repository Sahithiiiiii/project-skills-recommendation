import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // =========================
  // 1. SEED SKILLS
  // =========================

  const skills = [
    {
      name: "Python",
      category: "Programming Language",
      description:
        "A versatile programming language used in web development, automation, data science, and AI.",
    },
    {
      name: "JavaScript",
      category: "Programming Language",
      description:
        "A programming language primarily used for web development.",
    },
    {
      name: "TypeScript",
      category: "Programming Language",
      description:
        "A typed superset of JavaScript used for building scalable applications.",
    },
    {
      name: "SQL",
      category: "Database",
      description:
        "A language used to query and manage relational databases.",
    },
    {
      name: "Node.js",
      category: "Backend",
      description:
        "A JavaScript runtime used to build backend applications and APIs.",
    },
    {
      name: "React",
      category: "Frontend",
      description:
        "A library for building user interfaces and frontend applications.",
    },
    {
      name: "REST APIs",
      category: "Backend",
      description:
        "A way for applications to communicate using HTTP.",
    },
    {
      name: "PostgreSQL",
      category: "Database",
      description:
        "A relational database used for storing structured application data.",
    },
    {
      name: "Docker",
      category: "DevOps",
      description:
        "A platform for packaging applications into containers.",
    },
    {
      name: "Git",
      category: "Development Tools",
      description:
        "A version control system used to track and manage code changes.",
    },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: {
        name: skill.name,
      },
      update: {
        category: skill.category,
        description: skill.description,
      },
      create: skill,
    });
  }

  // =========================
  // 2. SEED CAREERS
  // =========================

  const careers = [
    {
      name: "Backend Developer",
      description:
        "Builds server-side applications, APIs, databases, and application logic.",
      category: "Software Development",
    },
    {
      name: "Frontend Developer",
      description:
        "Builds user interfaces and interactive web applications.",
      category: "Software Development",
    },
    {
      name: "Full Stack Developer",
      description:
        "Works on both frontend and backend parts of web applications.",
      category: "Software Development",
    },
    {
      name: "AI/ML Engineer",
      description:
        "Builds applications and systems using machine learning and artificial intelligence.",
      category: "Artificial Intelligence",
    },
  ];

  for (const career of careers) {
    await prisma.career.upsert({
      where: {
        name: career.name,
      },
      update: {
        description: career.description,
        category: career.category,
      },
      create: career,
    });
  }

  // =========================
  // 3. SEED CAREER PROJECTS
  // =========================

  const careerProjects: Record<
    string,
    Array<{
      title: string;
      description: string;
      difficulty: string;
      learningOutcome: string;
    }>
  > = {
    "Backend Developer": [
      { title: "Task Management API", description: "Build a REST API for teams to create, assign, and track tasks.", difficulty: "Beginner", learningOutcome: "Practice API design, authentication, validation, and PostgreSQL persistence." },
      { title: "URL Shortener Service", description: "Create a service that generates short links and tracks redirect activity.", difficulty: "Intermediate", learningOutcome: "Learn database indexing, analytics endpoints, and reliable error handling." },
      { title: "Real-Time Support Chat", description: "Develop a customer support backend with agent queues and live conversations.", difficulty: "Advanced", learningOutcome: "Understand WebSockets, message persistence, and scalable backend architecture." },
    ],
    "Frontend Developer": [
      { title: "Accessible Design System", description: "Build a reusable component library for a small product dashboard.", difficulty: "Beginner", learningOutcome: "Practice component composition, responsive styling, and accessible interactions." },
      { title: "Interactive Data Dashboard", description: "Turn a dataset into a filterable dashboard with charts and responsive views.", difficulty: "Intermediate", learningOutcome: "Learn state management, data visualization, loading states, and performance basics." },
      { title: "Collaborative Whiteboard", description: "Create a browser-based canvas where users can draw, annotate, and organize ideas.", difficulty: "Advanced", learningOutcome: "Explore canvas interactions, keyboard accessibility, and complex client-side state." },
    ],
    "Full Stack Developer": [
      { title: "Event Planning Platform", description: "Build a platform for creating events, managing guests, and publishing schedules.", difficulty: "Intermediate", learningOutcome: "Connect a React interface to a secure API and relational data model." },
      { title: "Subscription Billing Portal", description: "Create an account portal that shows plans, invoices, and subscription status.", difficulty: "Advanced", learningOutcome: "Practice authorization, transactional workflows, and dependable integration boundaries." },
      { title: "Community Knowledge Base", description: "Develop a searchable space where users publish, edit, and discuss technical articles.", difficulty: "Advanced", learningOutcome: "Learn full-stack search, moderation workflows, and optimistic user experiences." },
    ],
    "AI/ML Engineer": [
      { title: "Customer Churn Predictor", description: "Train a model that identifies customers who may cancel a service subscription.", difficulty: "Intermediate", learningOutcome: "Practice feature engineering, model evaluation, and communicating model limitations." },
      { title: "Document Classification API", description: "Build a service that classifies uploaded documents into configurable categories.", difficulty: "Intermediate", learningOutcome: "Learn text preprocessing, model serving, and integrating inference into an API." },
      { title: "Personalized Recommendation Engine", description: "Create a recommendation pipeline that suggests content from user interaction history.", difficulty: "Advanced", learningOutcome: "Understand ranking approaches, offline evaluation, and production data pipelines." },
    ],
  };

  for (const [careerName, projects] of Object.entries(careerProjects)) {
    const career = await prisma.career.findUnique({ where: { name: careerName } });
    if (!career) continue;

    for (const project of projects) {
      await prisma.careerProject.upsert({
        where: { careerId_title: { careerId: career.id, title: project.title } },
        update: project,
        create: { ...project, careerId: career.id },
      });
    }
  }

  // =========================
  // 4. CONNECT CAREERS
  //    WITH REQUIRED SKILLS
  // =========================

  const careerSkills: Record<string, [string, number][]> = {
    "Backend Developer": [
      ["Node.js", 5],
      ["SQL", 5],
      ["PostgreSQL", 4],
      ["REST APIs", 5],
      ["Git", 3],
      ["Docker", 3],
    ],

    "Frontend Developer": [
      ["JavaScript", 5],
      ["TypeScript", 4],
      ["React", 5],
      ["Git", 3],
    ],

    "Full Stack Developer": [
      ["JavaScript", 5],
      ["TypeScript", 4],
      ["React", 5],
      ["Node.js", 5],
      ["SQL", 4],
      ["PostgreSQL", 4],
      ["REST APIs", 4],
      ["Git", 3],
    ],

    "AI/ML Engineer": [
      ["Python", 5],
      ["SQL", 4],
      ["Git", 3],
    ],
  };

  for (const [careerName, requiredSkills] of Object.entries(
    careerSkills
  )) {
    const career = await prisma.career.findUnique({
      where: {
        name: careerName,
      },
    });

    if (!career) continue;

    for (const [skillName, importance] of requiredSkills) {
      const skill = await prisma.skill.findUnique({
        where: {
          name: skillName,
        },
      });

      if (!skill) continue;

      await prisma.careerSkill.upsert({
        where: {
          careerId_skillId: {
            careerId: career.id,
            skillId: skill.id,
          },
        },
        update: {
          importance,
        },
        create: {
          careerId: career.id,
          skillId: skill.id,
          importance,
        },
      });
    }
  }

  // =========================
  // 5. SEED INTERESTS
  // =========================

  const interests = [
    {
      name: "Web Development",
      description:
        "Building websites, web applications, and internet-based software.",
    },
    {
      name: "Backend Development",
      description:
        "Building servers, APIs, databases, and application logic.",
    },
    {
      name: "Frontend Development",
      description:
        "Building user interfaces and interactive web experiences.",
    },
    {
      name: "Artificial Intelligence",
      description:
        "Building intelligent systems using machine learning and AI.",
    },
    {
      name: "Data Science",
      description:
        "Analyzing data to discover insights and build data-driven solutions.",
    },
    {
      name: "Problem Solving",
      description:
        "Solving logical and computational problems using algorithms.",
    },
  ];

  for (const interest of interests) {
    await prisma.interest.upsert({
      where: {
        name: interest.name,
      },
      update: {
        description: interest.description,
      },
      create: interest,
    });
  }

  // =========================
  // 6. CONNECT CAREERS
  //    WITH INTERESTS
  // =========================

  const careerInterests = [
    {
      career: "AI/ML Engineer",
      interest: "Artificial Intelligence",
      importance: 5,
    },
    {
      career: "AI/ML Engineer",
      interest: "Data Science",
      importance: 4,
    },
    {
      career: "Backend Developer",
      interest: "Backend Development",
      importance: 5,
    },
    {
      career: "Backend Developer",
      interest: "Web Development",
      importance: 3,
    },
    {
      career: "Frontend Developer",
      interest: "Frontend Development",
      importance: 5,
    },
    {
      career: "Frontend Developer",
      interest: "Web Development",
      importance: 5,
    },
    {
      career: "Full Stack Developer",
      interest: "Web Development",
      importance: 5,
    },
    {
      career: "Full Stack Developer",
      interest: "Frontend Development",
      importance: 4,
    },
    {
      career: "Full Stack Developer",
      interest: "Backend Development",
      importance: 4,
    },
  ];

  for (const item of careerInterests) {
    const career = await prisma.career.findUnique({
      where: {
        name: item.career,
      },
    });

    const interest = await prisma.interest.findUnique({
      where: {
        name: item.interest,
      },
    });

    if (!career || !interest) continue;

    await prisma.careerInterest.upsert({
      where: {
        careerId_interestId: {
          careerId: career.id,
          interestId: interest.id,
        },
      },
      update: {
        importance: item.importance,
      },
      create: {
        careerId: career.id,
        interestId: interest.id,
        importance: item.importance,
      },
    });
  }

  // =========================
  // SUCCESS LOGS
  // =========================

  console.log("Skills seeded successfully 🚀");
  console.log("Careers seeded successfully 🚀");
  console.log("Career projects seeded successfully 🚀");
  console.log("Career-skill relationships seeded successfully 🚀");
  console.log("Interests seeded successfully 🚀");
  console.log("Career interests seeded successfully 🚀");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });