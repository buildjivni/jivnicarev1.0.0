export interface SymptomMapping {
  symptoms: string[];
  speciality: string;
}

export const SYMPTOM_MAP: SymptomMapping[] = [
  {
    symptoms: ["heart", "dil", "bp", "blood pressure", "chest pain", "seena dard", "hart", "chest tightness", "palpitations"],
    speciality: "Cardiologist",
  },
  {
    symptoms: ["fever", "bukhar", "cold", "zukam", "cough", "khansi", "weakness", "thakaan", "body pain", "jism dard", "flu", "sardi"],
    speciality: "General Physician",
  },
  {
    symptoms: ["stomach", "pet dard", "acidity", "loose motion", "liver", "piliya", "jaundice", "gas", "vomiting", "constipation", "kabz"],
    speciality: "Gastroenterologist",
  },
  {
    symptoms: ["bone", "haddi", "joint pain", "kamar dard", "knee", "ghutna", "fracture", "arthritis", "moch", "backache"],
    speciality: "Orthopedic",
  },
  {
    symptoms: ["skin", "twacha", "rash", "allergy", "daane", "acne", "khujli", "itching", "pimples", "chakti", "skin allergy"],
    speciality: "Dermatologist",
  },
  {
    symptoms: ["child", "bachcha", "baby", "vaccination", "bal rog", "kids doctor", "infant", "sishu"],
    speciality: "Pediatrician",
  },
  {
    symptoms: ["eye", "aankh", "vision", "chasma", "aankhon ka doctor", "cataract", "motiyabind", "dry eyes", "chashma"],
    speciality: "Ophthalmologist",
  },
  {
    symptoms: ["teeth", "dant", "toothache", "cavity", "dant dard", "gums", "dentistry", "masuda"],
    speciality: "Dentist",
  },
  {
    symptoms: ["breathing", "sans", "asthma", "lungs", "tb", "phephde", "wheezing", "coughing blood"],
    speciality: "Pulmonologist",
  },
  {
    symptoms: ["headache", "sir dard", "migraine", "chakkar", "paralysis", "laqwa", "fits", "mirgi", "epilepsy"],
    speciality: "Neurologist",
  },
  {
    symptoms: ["diabetes", "sugar", "thyroid", "blood sugar", "madhumeh", "hormones", "goiter"],
    speciality: "Endocrinologist",
  },
  {
    symptoms: ["women", "mahila", "pregnancy", "period", "delivery", "ladies doctor", "menses", "gynec", "abortion"],
    speciality: "Gynecologist",
  },
  {
    symptoms: ["depression", "anxiety", "stress", "mental", "neend nahi", "sadness", "phobia", "bipolar"],
    speciality: "Psychiatrist",
  },
  {
    symptoms: ["kidney", "stone", "pathri", "peshab", "dialysis", "urine infection", "utr"],
    speciality: "Urologist",
  },
  {
    symptoms: ["ear", "kaan", "nose", "naak", "throat", "gala", "tonsil", "sinus", "hearing"],
    speciality: "ENT Specialist",
  },
];

export const TYPO_CORRECTIONS: Record<string, string> = {
  "dacter": "doctor",
  "docter": "doctor",
  "hart": "heart",
  "kidny": "kidney",
  "dibitiis": "diabetes",
  "suger": "sugar",
  "pediatric": "pediatrician",
  "ortho": "orthopedic",
};

export function mapSymptomToSpeciality(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Apply direct typo corrections first
  let correctedQuery = normalizedQuery;
  for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
    if (normalizedQuery.includes(typo)) {
      correctedQuery = normalizedQuery.replace(typo, correction);
    }
  }

  // Search in symptom map
  for (const mapping of SYMPTOM_MAP) {
    if (mapping.symptoms.some(symptom => correctedQuery.includes(symptom))) {
      return mapping.speciality;
    }
  }

  return null;
}
