export const SPECIALITIES = [
  // TIER 1 — Most Common (Jamui/Deoghar market)
  { id: 1,  name: 'General Physician',   icon: '🩺', tier: 1 },
  { id: 2,  name: 'Pediatrician',        icon: '👶', tier: 1 },
  { id: 3,  name: 'Gynecologist',        icon: '🤱', tier: 1 },
  { id: 4,  name: 'Orthopedic',          icon: '🦴', tier: 1 },
  { id: 5,  name: 'Dentist',             icon: '🦷', tier: 1 },

  // TIER 2 — Regular
  { id: 6,  name: 'Dermatologist',       icon: '🔬', tier: 2 },
  { id: 7,  name: 'ENT Specialist',      icon: '👂', tier: 2 },
  { id: 8,  name: 'Ophthalmologist',     icon: '👁️', tier: 2 },
  { id: 9,  name: 'General Surgeon',     icon: '🏥', tier: 2 },
  { id: 10, name: 'Diabetologist',       icon: '💉', tier: 2 },

  // TIER 3 — Specialist
  { id: 11, name: 'Cardiologist',        icon: '❤️', tier: 3 },
  { id: 12, name: 'Neurologist',         icon: '🧠', tier: 3 },
  { id: 13, name: 'Gastroenterologist',  icon: '🫁', tier: 3 },
  { id: 14, name: 'Pulmonologist',       icon: '🫀', tier: 3 },
  { id: 15, name: 'Endocrinologist',     icon: '⚗️', tier: 3 },
  { id: 16, name: 'Urologist',           icon: '🧬', tier: 3 },
  { id: 17, name: 'Nephrologist',        icon: '💊', tier: 3 },
  { id: 18, name: 'Psychiatrist',        icon: '💭', tier: 3 },
  { id: 19, name: 'Physiotherapist',     icon: '🏃', tier: 3 },
  { id: 20, name: 'Radiologist',         icon: '📡', tier: 3 },
];

export function filterSpecialities(query: string) {
  if (!query) return SPECIALITIES;
  const q = query.toLowerCase();
  return SPECIALITIES.filter(s =>
    s.name.toLowerCase().includes(q)
  );
}
