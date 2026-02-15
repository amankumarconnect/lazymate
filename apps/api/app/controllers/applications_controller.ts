import type { HttpContext } from "@adonisjs/core/http";
import prisma from "#services/prisma";

export default class ApplicationsController {
  /**
   * Return a list of all applications
   */
  async index({}: HttpContext) {
    return prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
    });
  }

  /**
   * Create a new application
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      "jobTitle",
      "companyName",
      "jobUrl",
      "coverLetter",
      "status",
      "matchScore",
    ]);

    const existing = await prisma.application.findUnique({
      where: { jobUrl: data.jobUrl },
    });

    if (existing) {
      return response
        .status(409)
        .send({ message: "Application already exists", data: existing });
    }

    const application = await prisma.application.create({
      data: {
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobUrl: data.jobUrl,
        coverLetter: data.coverLetter,
        status: data.status || "submitted",
        matchScore: data.matchScore,
      },
    });

    return response.status(201).send(application);
  }

  /**
   * Find application by Job URL
   */
  async findByJobUrl({ request, response }: HttpContext) {
    const qs = request.qs();
    const jobUrl = qs.jobUrl as string;

    if (!jobUrl) {
      return response.badRequest({ message: "Missing jobUrl query parameter" });
    }

    const application = await prisma.application.findUnique({
      where: { jobUrl },
    });

    if (!application) {
      return response.notFound({ message: "Application not found" });
    }

    return application;
  }
}
