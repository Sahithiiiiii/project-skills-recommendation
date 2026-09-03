import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getRecommendations = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =========================
    // 1. FETCH USER SKILLS AND INTERESTS
    // =========================

    const [userSkillsData, userInterestsData] = await Promise.all([
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.userInterest.findMany({
        where: { userId },
        include: { interest: true },
      }),
    ]);

    const skills = userSkillsData.map((userSkill) => userSkill.skill.name);
    const interests = userInterestsData.map(
      (userInterest) => userInterest.interest.name
    );

    // =========================
    // 2. FETCH CAREERS
    //    WITH SKILLS + INTERESTS
    // =========================

    const careers = await prisma.career.findMany({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },

        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    // =========================
    // 3. NORMALIZE USER SKILLS AND INTERESTS
    // =========================

    const userSkills = skills.map((skill: string) =>
      skill.toLowerCase()
    );

    const userInterests = (interests || []).map(
      (interest: string) => interest.toLowerCase()
    );

    // =========================
    // 4. CALCULATE RECOMMENDATIONS
    // =========================

    const recommendations = careers.map((career) => {
      const requiredSkills = career.skills;
      const careerInterests = career.interests;

      // =========================
      // SKILL MATCHING
      // =========================

      const matchedSkills = requiredSkills.filter((careerSkill) =>
        userSkills.includes(
          careerSkill.skill.name.toLowerCase()
        )
      );

      const missingSkills = requiredSkills
        .filter(
          (careerSkill) =>
            !userSkills.includes(
              careerSkill.skill.name.toLowerCase()
            )
        )
        .map((careerSkill) => ({
          name: careerSkill.skill.name,
          importance: careerSkill.importance,
        }));

      const totalImportance = requiredSkills.reduce(
        (total, careerSkill) =>
          total + careerSkill.importance,
        0
      );

      const matchedImportance = matchedSkills.reduce(
        (total, careerSkill) =>
          total + careerSkill.importance,
        0
      );

      const skillMatchPercentage =
        totalImportance === 0
          ? 0
          : Math.round(
              (matchedImportance / totalImportance) * 100
            );

      // =========================
      // INTEREST MATCHING
      // =========================

      const matchedInterests = careerInterests.filter(
        (careerInterest) =>
          userInterests.includes(
            careerInterest.interest.name.toLowerCase()
          )
      );

      const totalInterestImportance = careerInterests.reduce(
        (total, careerInterest) =>
          total + careerInterest.importance,
        0
      );

      const matchedInterestImportance =
        matchedInterests.reduce(
          (total, careerInterest) =>
            total + careerInterest.importance,
          0
        );

      const interestMatchPercentage =
        totalInterestImportance === 0
          ? 0
          : Math.round(
              (matchedInterestImportance /
                totalInterestImportance) *
                100
            );

      // =========================
      // FINAL SCORE
      // =========================

      const finalScore =
        interests && interests.length > 0
          ? Math.round(
              skillMatchPercentage * 0.7 +
                interestMatchPercentage * 0.3
            )
          : skillMatchPercentage;

      // =========================
      // RETURN RESULT
      // =========================

      return {
        career: career.name,
        category: career.category,

        skillMatchPercentage,
        interestMatchPercentage,
        finalScore,

        matchedSkills: matchedSkills.map(
          (careerSkill) => ({
            name: careerSkill.skill.name,
            importance: careerSkill.importance,
          })
        ),

        missingSkills,

        matchedInterests: matchedInterests.map(
          (careerInterest) => ({
            name: careerInterest.interest.name,
            importance: careerInterest.importance,
          })
        ),
      };
    });

    // =========================
    // 5. SORT BEST MATCHES
    // =========================

    recommendations.sort(
      (a, b) => b.finalScore - a.finalScore
    );

    // =========================
    // 6. SEND RESPONSE
    // =========================

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