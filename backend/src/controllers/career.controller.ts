import { Request, Response } from "express";
import prisma from "../config/prisma.js";

const roundToTwoDecimals = (value: number) =>
  Math.round(value * 100) / 100;

const isValidCareerId = (careerId: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    careerId
  );

export const getCareers = async (req: Request, res: Response) => {
  try {
    const careers = await prisma.career.findMany({
      orderBy: {
        name: "asc",
      },

      include: {
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            importance: "desc",
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: careers.length,
      data: careers,
    });
  } catch (error) {
    console.error("Error fetching careers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch careers",
    });
  }
};

export const getCareerDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const careerIdParam = req.params.careerId;
    const careerId = Array.isArray(careerIdParam)
      ? undefined
      : careerIdParam;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!careerId || !isValidCareerId(careerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid career ID is required",
      });
    }

    const [career, user] = await Promise.all([
      prisma.career.findUnique({
        where: { id: careerId },
        include: {
          skills: {
            include: { skill: true },
            orderBy: { importance: "desc" },
          },
          interests: {
            include: { interest: true },
            orderBy: { importance: "desc" },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          skills: {
            select: {
              confidence: true,
              skill: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          interests: {
            select: {
              interest: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Career not found",
      });
    }

    const requiredSkills = career.skills.map(({ skill, importance }) => ({
      id: skill.id,
      name: skill.name,
      importance,
    }));
    const userSkills = user?.skills.map(({ skill, confidence }) => ({
      id: skill.id,
      name: skill.name,
      confidence,
    })) ?? [];
    const requiredInterests = career.interests.map(
      ({ interest, importance }) => ({
        id: interest.id,
        name: interest.name,
        importance,
      })
    );
    const userInterests =
      user?.interests.map(({ interest }) => ({
        id: interest.id,
        name: interest.name,
      })) ?? [];

    const userSkillNames = new Set(userSkills.map((skill) => skill.name));
    const userInterestNames = new Set(
      userInterests.map((interest) => interest.name)
    );
    const matchingSkills = requiredSkills.filter((skill) =>
      userSkillNames.has(skill.name)
    );
    const missingSkills = requiredSkills.filter(
      (skill) => !userSkillNames.has(skill.name)
    );
    const matchingInterests = requiredInterests.filter((interest) =>
      userInterestNames.has(interest.name)
    );
    const missingInterests = requiredInterests.filter(
      (interest) => !userInterestNames.has(interest.name)
    );

    const skillMatchPercentage = roundToTwoDecimals(
      requiredSkills.length === 0
        ? 100
        : (matchingSkills.length / requiredSkills.length) * 100
    );
    const interestMatchPercentage = roundToTwoDecimals(
      requiredInterests.length === 0
        ? 100
        : (matchingInterests.length / requiredInterests.length) * 100
    );
    const overallMatchPercentage = roundToTwoDecimals(
      requiredSkills.length > 0 && requiredInterests.length > 0
        ? skillMatchPercentage * 0.7 + interestMatchPercentage * 0.3
        : requiredSkills.length > 0
          ? skillMatchPercentage
          : requiredInterests.length > 0
            ? interestMatchPercentage
            : 100
    );
    const learningPriority =
      overallMatchPercentage >= 80
        ? "Low"
        : overallMatchPercentage >= 50
          ? "Medium"
          : "High";

    return res.status(200).json({
      success: true,
      career: {
        id: career.id,
        name: career.name,
        description: career.description,
      },
      analysis: {
        requiredSkills,
        userSkills,
        matchingSkills,
        missingSkills,
        skillMatchPercentage,
        requiredInterests,
        userInterests,
        matchingInterests,
        missingInterests,
        interestMatchPercentage,
        overallMatchPercentage,
        learningPriority,
      },
    });
  } catch (error) {
    console.error("Error fetching career details:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch career details",
    });
  }
};

export const getCareerProjects = async (req: Request, res: Response) => {
  try {
    const careerIdParam = req.params.careerId;
    const careerId = Array.isArray(careerIdParam) ? undefined : careerIdParam;

    if (!careerId || !isValidCareerId(careerId)) {
      return res.status(400).json({ success: false, message: "A valid career ID is required" });
    }

    const career = await prisma.career.findUnique({
      where: { id: careerId },
      select: { id: true },
    });

    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }

    const projects = await prisma.careerProject.findMany({
      where: { careerId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        learningOutcome: true,
        careerId: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error("Error fetching career projects:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch career projects" });
  }
};

export const getCareerRoadmap = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const careerIdParam = req.params.careerId;
    const careerId = Array.isArray(careerIdParam)
      ? undefined
      : careerIdParam;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!careerId || !isValidCareerId(careerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid career ID is required",
      });
    }

    const [career, user] = await Promise.all([
      prisma.career.findUnique({
        where: { id: careerId },
        select: {
          id: true,
          name: true,
          skills: {
            include: { skill: true },
            orderBy: { importance: "desc" },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          skills: {
            select: {
              skill: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: "Career not found",
      });
    }

    const userSkillNames = new Set(
      user?.skills.map(({ skill }) => skill.name) ?? []
    );
    const missingSkills = career.skills
      .filter(({ skill }) => !userSkillNames.has(skill.name))
      .map(({ skill, importance }) => ({
        id: skill.id,
        name: skill.name,
        importance,
      }));
    const roadmap = missingSkills.map((skill, index) => ({
      step: index + 1,
      skillId: skill.id,
      skillName: skill.name,
      learningObjective: `Build foundational knowledge in ${skill.name}.`,
    }));

    return res.status(200).json({
      success: true,
      careerId: career.id,
      careerName: career.name,
      missingSkills,
      roadmap,
      message:
        missingSkills.length === 0
          ? "You already have all required skills for this career."
          : "Complete the roadmap steps in order to build the missing skills.",
    });
  } catch (error) {
    console.error("Error generating career roadmap:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate career roadmap",
    });
  }
};