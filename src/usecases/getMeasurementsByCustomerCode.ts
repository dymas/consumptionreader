import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMeasurementsByCustomerCode(
  customer_code: string,
  measure_type?: string
) {
  try {
    const whereClause: any = {
      customer_code: customer_code,
    };

    if (measure_type) {
      whereClause.measure_type = measure_type.toUpperCase();
    }

    const measurements = await prisma.measurement.findMany({
      where: whereClause,
    });

    if (measurements.length === 0) {
      return null;
    }

    return measurements;
  } catch (error) {
    console.error("Erro ao buscar medições:", error);
    throw new Error("Erro ao buscar medições");
  }
}
