import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getRecommendations = async (
  req: Request,
  res: Response
) => {
  try {
    const { skills } = req.body;

    // Validate input
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of skills",
      });
    }

    // Fetch all careers with their required skills
    const careers = await prisma.career.findMany({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Normalize user skills
    const userSkills = skills.map((skill: string) =>
      skill.toLowerCase()
    );

    const recommendations = careers.map((career) => {
      const requiredSkills = career.skills;

      const matchedSkills = requiredSkills.filter((careerSkill) =>
        userSkills.includes(careerSkill.skill.name.toLowerCase())
      );

      const missingSkills = requiredSkills
        .filter(
          (careerSkill) =>
            !userSkills.includes(careerSkill.skill.name.toLowerCase())
        )
        .map((careerSkill) => ({
          name: careerSkill.skill.name,
          importance: careerSkill.importance,
        }));

      const totalImportance = requiredSkills.reduce(
  (total, careerSkill) => total + careerSkill.importance,
  0
);

const matchedImportance = matchedSkills.reduce(
  (total, careerSkill) => total + careerSkill.importance,
  0
);

const matchPercentage =
  totalImportance === 0
    ? 0
    : Math.round((matchedImportance / totalImportance) * 100);

      return {
        career: career.name,
        category: career.category,

        matchPercentage,

        matchedSkills: matchedSkills.map((careerSkill) => ({
          name: careerSkill.skill.name,
          importance: careerSkill.importance,
        })),

        missingSkills,
      };
    });

    // Best matches first
    recommendations.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
    });
  }
};