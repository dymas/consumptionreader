import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkDuplicateReading(
  customer_code: string,
  measure_type: string,
  measure_datetime: string
) {
  try {
    const measureDate = new Date(measure_datetime);
    const duplicateMeasurement = await prisma.measurement.findFirst({
      where: {
        customer_code: customer_code,
        measure_type: measure_type,
        measure_datetime: measureDate,
      },
    });

    return duplicateMeasurement !== null;
  } catch (error) {
    console.error("Erro ao verificar leitura duplicada:", error);
    throw new Error("Erro ao verificar leitura duplicada");
  }
}
