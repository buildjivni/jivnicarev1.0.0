import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const districts = [
  { name: 'Jamui', state: 'Bihar' },
  { name: 'Deoghar', state: 'Jharkhand' },
];

const specialities = [
  { name: 'General Physician', icon: '🩺', tier: 1, sortOrder: 1 },
  { name: 'Pediatrician', icon: '👶', tier: 1, sortOrder: 2 },
  { name: 'Gynecologist', icon: '🤱', tier: 1, sortOrder: 3 },
  { name: 'Orthopedic', icon: '🦴', tier: 1, sortOrder: 4 },
  { name: 'Dentist', icon: '🦷', tier: 1, sortOrder: 5 },
  { name: 'Dermatologist', icon: '🔬', tier: 2, sortOrder: 6 },
  { name: 'ENT Specialist', icon: '👂', tier: 2, sortOrder: 7 },
  { name: 'Ophthalmologist', icon: '👁️', tier: 2, sortOrder: 8 },
  { name: 'General Surgeon', icon: '🏥', tier: 2, sortOrder: 9 },
  { name: 'Diabetologist', icon: '💉', tier: 2, sortOrder: 10 },
  { name: 'Cardiologist', icon: '❤️', tier: 3, sortOrder: 11 },
  { name: 'Neurologist', icon: '🧠', tier: 3, sortOrder: 12 },
  { name: 'Gastroenterologist', icon: '🫁', tier: 3, sortOrder: 13 },
  { name: 'Pulmonologist', icon: '🫀', tier: 3, sortOrder: 14 },
  { name: 'Endocrinologist', icon: '⚗️', tier: 3, sortOrder: 15 },
  { name: 'Urologist', icon: '🧬', tier: 3, sortOrder: 16 },
  { name: 'Nephrologist', icon: '💊', tier: 3, sortOrder: 17 },
  { name: 'Psychiatrist', icon: '💭', tier: 3, sortOrder: 18 },
  { name: 'Physiotherapist', icon: '🏃', tier: 3, sortOrder: 19 },
  { name: 'Radiologist', icon: '📡', tier: 3, sortOrder: 20 },
];

async function main() {
  for (const district of districts) {
    await prisma.district.upsert({
      where: { name: district.name },
      update: {},
      create: district,
    });
  }

  for (const speciality of specialities) {
    await prisma.speciality.upsert({
      where: { name: speciality.name },
      update: {},
      create: speciality,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
