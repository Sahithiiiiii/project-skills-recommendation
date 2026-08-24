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
  // 3. CONNECT CAREERS
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

  for (const [careerName, requiredSkills] of Object.entries(careerSkills)) {
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
// 4. SEED INTERESTS
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
  console.log("Skills seeded successfully 🚀");
  console.log("Careers seeded successfully 🚀");
  console.log("Career-skill relationships seeded successfully 🚀");
  console.log("Interests seeded successfully 🚀");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });