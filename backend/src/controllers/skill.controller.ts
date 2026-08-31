import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getSkills = async (req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
};