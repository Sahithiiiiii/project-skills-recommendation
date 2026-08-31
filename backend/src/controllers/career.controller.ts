import { Request, Response } from "express";
import prisma from "../config/prisma.js";

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