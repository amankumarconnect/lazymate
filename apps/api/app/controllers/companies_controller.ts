import type { HttpContext } from "@adonisjs/core/http";
import prisma from "#services/prisma";

export default class CompaniesController {
  /**
   * Return a list of all companies
   */
  async index({}: HttpContext) {
    return prisma.company.findMany();
  }

  /**
   * Create a new company
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(["url", "name", "status"]);

    // Check if company exists to avoid duplicates (though @unique on url should handle this)
    const existing = await prisma.company.findUnique({
      where: { url: data.url },
    });

    if (existing) {
      return response
        .status(409)
        .send({ message: "Company already exists", data: existing });
    }

    const company = await prisma.company.create({
      data: {
        url: data.url,
        name: data.name,
        status: data.status || "visited",
      },
    });

    return response.status(201).send(company);
  }

  /**
   * Show a single company by ID or URL
   */
  async show({ params, response }: HttpContext) {
    const { id } = params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return response.status(404).send({ message: "Company not found" });
    }

    return company;
  }

  /**
   * Find company by URL
   */
  async findByUrl({ request, response }: HttpContext) {
    const qs = request.qs();
    const url = qs.url as string;

    if (!url) {
      return response.badRequest({ message: "Missing url query parameter" });
    }

    const company = await prisma.company.findUnique({
      where: { url },
    });

    if (!company) {
      return response.notFound({ message: "Company not found" });
    }

    return company;
  }
}
