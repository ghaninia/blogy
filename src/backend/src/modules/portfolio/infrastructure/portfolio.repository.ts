import { prisma } from '../../../db/index.js';

export class PortfolioRepository {
  private defaultInclude() {
    return { coverMedia: true };
  }

  findBySlug(slug: string) {
    return prisma.portfolio.findUnique({
      where: { slug },
      include: this.defaultInclude(),
    });
  }

  findById(id: string) {
    return prisma.portfolio.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  create(data: Parameters<typeof prisma.portfolio.create>[0]['data']) {
    return prisma.portfolio.create({
      data,
      include: this.defaultInclude(),
    });
  }

  update(id: string, data: Parameters<typeof prisma.portfolio.update>[0]['data']) {
    return prisma.portfolio.update({
      where: { id },
      data,
      include: this.defaultInclude(),
    });
  }

  delete(id: string) {
    return prisma.portfolio.delete({ where: { id } });
  }

  findMany(publicOnly: boolean) {
    return prisma.portfolio.findMany({
      where: publicOnly ? { isPublished: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: this.defaultInclude(),
    });
  }
}

export const portfolioRepository = new PortfolioRepository();
