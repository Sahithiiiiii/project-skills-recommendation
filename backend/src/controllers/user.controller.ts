import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        skills: {
          include: { skill: true },
        },
        interests: {
          include: { interest: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.email,
      skills: user.skills.map(({ skill, confidence }) => ({
        id: skill.id,
        name: skill.name,
        confidence,
      })),
      interests: user.interests.map(({ interest }) => ({
        id: interest.id,
        name: interest.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

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

export const addUserInterests = async (req: Request, res: Response) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array",
      });
    }

    if (
      !interests.every(
        (interest): interest is string => typeof interest === "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Each interest must be a name",
      });
    }

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const interestNames = [
      ...new Set(interests.map((interest) => interest.trim())),
    ];

    if (interestNames.some((interest) => interest.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Interest names cannot be empty",
      });
    }

    const matchingInterests = await prisma.interest.findMany({
      where: {
        name: {
          in: interestNames,
        },
      },
    });

    const matchingInterestNames = new Set(
      matchingInterests.map((interest) => interest.name)
    );
    const invalidInterestNames = interestNames.filter(
      (interestName) => !matchingInterestNames.has(interestName)
    );

    if (invalidInterestNames.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more interests were not found",
        invalidInterests: invalidInterestNames,
      });
    }

    await prisma.userInterest.createMany({
      data: matchingInterests.map((interest) => ({
        userId,
        interestId: interest.id,
      })),
      skipDuplicates: true,
    });

    const selectedInterests = await prisma.userInterest.findMany({
      where: { userId },
      include: { interest: true },
    });

    return res.status(201).json({
      success: true,
      interests: selectedInterests.map(({ interest }) => ({
        id: interest.id,
        name: interest.name,
      })),
    });
  } catch (error) {
    console.error("Error adding user interests:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add user interests",
    });
  }
};

export const updateUserSkills = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

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

    const skillNames = [...new Set(skills.map((skill) => skill.trim()))];

    if (skillNames.some((skill) => skill.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Skill names cannot be empty",
      });
    }

    const matchingSkills = await prisma.skill.findMany({
      where: { name: { in: skillNames } },
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

    const selectedSkills = await prisma.$transaction(async (transaction) => {
      await transaction.userSkill.deleteMany({ where: { userId } });
      await transaction.userSkill.createMany({
        data: matchingSkills.map((skill) => ({
          userId,
          skillId: skill.id,
          confidence: 1,
        })),
      });

      return transaction.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
    });

    return res.status(200).json({
      success: true,
      skills: selectedSkills.map(({ skill, confidence }) => ({
        id: skill.id,
        name: skill.name,
        confidence,
      })),
    });
  } catch (error) {
    console.error("Error updating user skills:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user skills",
    });
  }
};

export const updateUserInterests = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array",
      });
    }

    if (
      !interests.every(
        (interest): interest is string => typeof interest === "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Each interest must be a name",
      });
    }

    const interestNames = [
      ...new Set(interests.map((interest) => interest.trim())),
    ];

    if (interestNames.some((interest) => interest.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Interest names cannot be empty",
      });
    }

    const matchingInterests = await prisma.interest.findMany({
      where: { name: { in: interestNames } },
    });
    const matchingInterestNames = new Set(
      matchingInterests.map((interest) => interest.name)
    );
    const invalidInterestNames = interestNames.filter(
      (interestName) => !matchingInterestNames.has(interestName)
    );

    if (invalidInterestNames.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more interests were not found",
        invalidInterests: invalidInterestNames,
      });
    }

    const selectedInterests = await prisma.$transaction(async (transaction) => {
      await transaction.userInterest.deleteMany({ where: { userId } });
      await transaction.userInterest.createMany({
        data: matchingInterests.map((interest) => ({
          userId,
          interestId: interest.id,
        })),
      });

      return transaction.userInterest.findMany({
        where: { userId },
        include: { interest: true },
      });
    });

    return res.status(200).json({
      success: true,
      interests: selectedInterests.map(({ interest }) => ({
        id: interest.id,
        name: interest.name,
      })),
    });
  } catch (error) {
    console.error("Error updating user interests:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user interests",
    });
  }
};