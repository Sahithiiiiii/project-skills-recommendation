import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const addUserSkills = async (req: Request, res: Response) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    if (!skills.every((skill): skill is string => typeof skill === "string")) {
      return res.status(400).json({
        success: false,
        message: "Each skill must be a name",
      });
    }

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const skillNames = [...new Set(skills.map((skill) => skill.trim()))];

    if (skillNames.some((skill) => skill.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Skill names cannot be empty",
      });
    }

    const matchingSkills = await prisma.skill.findMany({
      where: {
        name: {
          in: skillNames,
        },
      },
    });

    const matchingSkillNames = new Set(
      matchingSkills.map((skill) => skill.name)
    );
    const invalidSkillNames = skillNames.filter(
      (skillName) => !matchingSkillNames.has(skillName)
    );

    if (invalidSkillNames.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more skills were not found",
        invalidSkills: invalidSkillNames,
      });
    }

    await prisma.userSkill.createMany({
      data: matchingSkills.map((skill) => ({
        userId,
        skillId: skill.id,
        confidence: 1,
      })),
      skipDuplicates: true,
    });

    const selectedSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return res.status(201).json({
      success: true,
      skills: selectedSkills.map(({ skill, confidence }) => ({
        id: skill.id,
        name: skill.name,
        confidence,
      })),
    });
  } catch (error) {
    console.error("Error adding user skills:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add user skills",
    });
  }
};