import { CurriculumNode } from '@/types/curriculum';

interface FallbackTopicTemplate {
  title: string;
  description: string;
  lessons: { title: string; description: string }[];
}

interface FallbackModuleTemplate {
  title: string;
  description: string;
  topics: FallbackTopicTemplate[];
}

const NURSING_MODULE_TEMPLATES: FallbackModuleTemplate[] = [
  {
    title: 'Patient Admission, Assessment and Clinical Communication',
    description: 'Core competencies for welcoming patients, structured history taking (Anamnese), and clinical communication in German healthcare settings.',
    topics: [
      {
        title: 'Initial Patient Reception and Rapport Building',
        description: 'Professional communication protocols, welcoming patients and families, and establishing trust.',
        lessons: [
          {
            title: 'Standard Greeting Protocols and Formal Address',
            description: 'Mastering formal address (Sie) and introducing professional nursing roles clearly.',
          },
          {
            title: 'Identity Verification and Admission Registration',
            description: 'Confirming identity, admission consent, and insurance documentation safely.',
          },
        ],
      },
      {
        title: 'Structured Medical History Taking (Anamnese)',
        description: 'Eliciting current symptoms, chief complaints, and past medical history accurately.',
        lessons: [
          {
            title: 'Symptom Inquiries and Pain Characterization',
            description: 'Asking structured questions about pain location, severity, onset, and triggers.',
          },
          {
            title: 'Past Medical History and Allergy Documentation',
            description: 'Inquiring about previous surgeries, chronic diseases, and known drug allergies.',
          },
        ],
      },
      {
        title: 'Vital Signs Assessment and Immediate Observations',
        description: 'Performing and documenting vital parameters following German clinical guidelines.',
        lessons: [
          {
            title: 'Vital Signs Measurement and Clinical Descriptions',
            description: 'Recording blood pressure, pulse, temperature, oxygen saturation, and respiration.',
          },
          {
            title: 'Reporting Deteriorating Observations and Escalation',
            description: 'Communicating urgent clinical deviations concisely to the interprofessional care team.',
          },
        ],
      },
    ],
  },
  {
    title: 'Medication Safety, Administration and Patient Education',
    description: 'Safe handling, verification, and patient guidance regarding pharmaceutical therapies.',
    topics: [
      {
        title: 'The 6 Rights of Medication Administration',
        description: 'Applying standard verification rules to avoid adverse pharmaceutical events.',
        lessons: [
          {
            title: 'Interpreting Prescription Orders (Verordnungen)',
            description: 'Deciphering dosages, administration routes, dosage forms, and administration timing.',
          },
          {
            title: 'Double-Checking High-Risk Medications and Dosage Calculations',
            description: 'Ensuring correct dosage and safe preparation protocols prior to administration.',
          },
        ],
      },
      {
        title: 'Patient Guidance and Therapeutic Adherence',
        description: 'Explaining drug purpose, potential side effects, and scheduled regimens clearly.',
        lessons: [
          {
            title: 'Explaining Drug Purpose and Expected Effects',
            description: 'Communicating pharmacological benefits and mechanisms in empathetic, plain language.',
          },
          {
            title: 'Advising on Adverse Reactions and Precautions',
            description: 'Informing patients about warning signs, contraindications, and when to alert nursing staff.',
          },
        ],
      },
      {
        title: 'Medication Documentation and Narcotics Protocols',
        description: 'Legal documentation standards for administered pharmaceuticals and controlled substances.',
        lessons: [
          {
            title: 'Digital and Paper Administration Record Keeping',
            description: 'Accurately noting administration times, withheld doses, and patient reactions.',
          },
          {
            title: 'Controlled Substances Protocol and Inventory Logging',
            description: 'Adhering to German narcotics legislation (BtMG) documentation standards.',
          },
        ],
      },
    ],
  },
  {
    title: 'Clinical Documentation, Nursing Process and Shift Handover',
    description: 'Standardized nursing documentation, care planning, and interprofessional information exchange.',
    topics: [
      {
        title: 'Systematic Nursing Documentation (Pflegebericht)',
        description: 'Structured recording of daily patient status, interventions, and outcomes.',
        lessons: [
          {
            title: 'SOAP and Problem-Oriented Documentation Formats',
            description: 'Drafting concise subjective observations, objective clinical facts, assessments, and care plans.',
          },
          {
            title: 'Legally Compliant Documentation Language',
            description: 'Applying objective, factual, and timestamped German clinical formulations.',
          },
        ],
      },
      {
        title: 'Interprofessional Shift Handover (Übergabe)',
        description: 'Conducting structured oral and written clinical handovers between shifts.',
        lessons: [
          {
            title: 'ISBAR Handover Framework in German Healthcare',
            description: 'Organizing handovers using Identification, Situation, Background, Assessment, and Recommendation.',
          },
          {
            title: 'Bedside Handover and Active Patient Involvement',
            description: 'Collaborative shift changes with direct patient interaction and environment checks.',
          },
        ],
      },
      {
        title: 'Individualized Care Planning and Goal Setting',
        description: 'Formulating realistic nursing diagnoses, goals, and evidence-based interventions.',
        lessons: [
          {
            title: 'Defining Measurable Nursing Objectives',
            description: 'Formulating realistic short-term and long-term recovery and maintenance goals.',
          },
          {
            title: 'Evaluating Care Outcomes and Modifying Interventions',
            description: 'Reviewing intervention efficacy and updating clinical care plans dynamically.',
          },
        ],
      },
    ],
  },
  {
    title: 'Hygiene, Infection Prevention and Wound Care Management',
    description: 'Hospital hygiene standards, sterile techniques, aseptic procedures, and wound healing protocols.',
    topics: [
      {
        title: 'Standard Precautions and Hand Hygiene Protocols',
        description: 'Infection prevention according to Robert Koch Institute (RKI) clinical guidelines.',
        lessons: [
          {
            title: 'The 5 Moments of Hand Hygiene in Routine Care',
            description: 'Executing correct hygienic disinfection technique and clinical indications.',
          },
          {
            title: 'Personal Protective Equipment (PPE) Application',
            description: 'Safe donning, doffing, and disposal of isolation gloves, gowns, and masks.',
          },
        ],
      },
      {
        title: 'Aseptic Wound Care and Modern Dressing Techniques',
        description: 'Assessment, cleaning, and dressing of acute and chronic wounds.',
        lessons: [
          {
            title: 'Wound Assessment and Staging (Wunddokumentation)',
            description: 'Assessing wound bed appearance, exudate, signs of infection, and healing stages.',
          },
          {
            title: 'Sterile Dressing Changes and Moist Wound Healing',
            description: 'Applying aseptic non-touch technique (ANTT) and modern hydrocolloid or foam dressings.',
          },
        ],
      },
      {
        title: 'Barrier Nursing and Multiresistant Pathogen Management',
        description: 'Protocols for managing MRSA, VRE, and respiratory isolation cohorts.',
        lessons: [
          {
            title: 'Isolation Room Protocols and Cohorting Procedures',
            description: 'Maintaining infection barriers and environmental disinfection safely.',
          },
          {
            title: 'Patient and Family Education During Clinical Isolation',
            description: 'Empathetically explaining hygiene restrictions and psychological support during isolation.',
          },
        ],
      },
    ],
  },
];

export function createFallbackCurriculum(text: string, fileName?: string): CurriculumNode {
  const hasNursing = /pflege|nursing|patient|klinik|hospital|wund|medikament|doctor|arzt|station/i.test(text);
  const now = Date.now();

  const title = hasNursing
    ? 'Inferred Clinical German Nursing Curriculum'
    : 'Inferred Modular Curriculum';

  const description = fileName
    ? `Inferred curriculum generated from ${fileName}. Structure generated per Rule 5 guidelines. Review and edit all entries.`
    : 'Auto-generated structure from unstructured document. Review and edit all entries.';

  const modules: CurriculumNode[] = NURSING_MODULE_TEMPLATES.map((modTpl) => {
    const topics: CurriculumNode[] = modTpl.topics.map((topTpl) => {
      const lessons: CurriculumNode[] = topTpl.lessons.map((lesTpl) => ({
        id: crypto.randomUUID(),
        level: 'lesson',
        title: lesTpl.title,
        description: lesTpl.description,
        children: [],
        isExpanded: false,
        origin: 'inferred',
        createdAt: now,
        updatedAt: now,
      }));

      return {
        id: crypto.randomUUID(),
        level: 'topic',
        title: topTpl.title,
        description: topTpl.description,
        children: lessons,
        isExpanded: true,
        origin: 'inferred',
        createdAt: now,
        updatedAt: now,
      };
    });

    return {
      id: crypto.randomUUID(),
      level: 'module',
      title: modTpl.title,
      description: modTpl.description,
      children: topics,
      isExpanded: true,
      origin: 'inferred',
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    id: crypto.randomUUID(),
    level: 'curriculum',
    title,
    description,
    children: modules,
    isExpanded: true,
    origin: 'inferred',
    createdAt: now,
    updatedAt: now,
  };
}
