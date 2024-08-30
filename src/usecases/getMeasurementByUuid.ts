import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMeasurementByUuid(measure_uuid: string) {
  try {
    const measurement = await prisma.measurement.findUnique({
      where: {
        measure_uuid: measure_uuid,
      },
    });

    if (!measurement) {
      return null;
    }

    return measurement;
  } catch (error) {
    console.error("Erro ao buscar medição:", error);
    throw new Error("Erro ao buscar medição");
  }
}
