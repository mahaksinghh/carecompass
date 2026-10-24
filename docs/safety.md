# CareCompass — Clinical Safety & Risk Mitigation Protocol

## 1. Safety Principles & Non-Negotiable Boundaries

CareCompass is designed around the fundamental principle of patient safety:

1. **Non-Diagnostic Scope:** CareCompass does not diagnose disease, prescribe medicines, calculate medication doses, or recommend changes to prescribed treatment plans. It acts exclusively as an operational navigation aid and non-clinical caregiver matching service.
2. **Deterministic Pre-Filter:** Safety red flags are written as tested, deterministic code. Generative AI models are strictly prohibited from modifying, downgrading, or overriding the output of the red-flag engine.
3. **Zero Delay Policy:** When an emergency trigger is detected, the application halts ordinary inquiry and displays emergency guidance immediately. It does not ask follow-up questions or introduce delay.
4. **Caregiver Emergency Isolation:** Potential emergencies immediately disable caregiver matching. Fictional caregivers are not medical first responders and must never be matched during life-threatening crises.
5. **Transparent Uncertainty:** When input data is ambiguous, conflicting, or out of scope, the system explicitly states uncertainty and directs the user to consult a licensed clinician.
6. **No False Precision:** The application does not show disease likelihood percentages or claim clinical validation.

---

## 2. Tested Emergency Red-Flag Categories

The prototype red-flag engine monitors 12 critical emergency categories:

| Flag ID | Category | Clinical Rationale & Cue Examples |
| :--- | :--- | :--- |
| `FAST_STROKE` | Acute Stroke | Facial droop, unilateral arm weakness, slurred speech, sudden loss of speech (*FAST protocol*). |
| `CHEST_PAIN_CARDIAC` | Cardiac / Heart Attack | Crushing central chest pressure radiating to arm, jaw, neck, cold sweats, history of CAD. |
| `SEVERE_RESPIRATORY_DISTRESS` | Airway Compromise | Cyanosis (blue lips), gasping for air, stridor, inability to speak full sentences. |
| `UNRESPONSIVE_COMA` | Altered Consciousness | Unresponsiveness when shaken, sudden loss of consciousness, collapse. |
| `PROLONGED_SEIZURE` | Status Epilepticus | Active convulsion lasting >5 minutes or repeated seizures without regaining awareness. |
| `SEVERE_ARTERIAL_BLEEDING` | Pulsatile Hemorrhage | Spurting blood in pulses, uncontrollable bleeding soaking multiple towels. |
| `ANAPHYLAXIS` | Severe Allergy | Acute throat tightness, facial/lip swelling, hives, stridor after allergen exposure. |
| `POISONING_INGESTION` | Toxic Ingestion | Swallowing caustic chemicals (drain cleaner, acid, bleach), pesticides, or acute drug overdose. |
| `MAJOR_TRAUMA` | High-Impact Injury | High fall (>2nd floor / 10 ft), severe head deformity, bleeding from ears, major collision. |
| `PREGNANCY_ACUTE_EMERGENCY` | Obstetric Crisis | Heavy bright red vaginal hemorrhage in 3rd trimester, severe abdominal rigidity, pre-eclampsia signs. |
| `SEVERE_BURNS` | High-Degree Burns | Charred skin, peeling third-degree burns covering large surface areas, electrical high-voltage injury. |
| `SELF_HARM_CRISIS` | Psychiatric Emergency | Active suicide attempt, ingested substances to end life, immediate danger to self. |

---

## 3. Negation Handling Verification

A critical flaw in basic keyword matching is triggering false alarms on negated statements. CareCompass tests bidirectional negation tokens within a 35-character contextual window:

- *"I sprained my ankle, but have **NO chest pain** and **NO breathing trouble**."* → Safely routed to Urgent In-Person Assessment without triggering cardiac red flags.
- *"Ghutne me halki moch hai, **koi chest pain nahi hai**."* → Successfully parses negative cue and avoids emergency escalation.

---

## 4. Emergency Number & Dispatch Limitations

- **General Emergency Number:** Displays **112** (the universal national emergency number in India) prominently.
- **Geographic Notice:** Clearly instructs users located outside India to immediately dial their national emergency service (e.g. 911 in the US/Canada, 999 in the UK).
- **Explicit Dispatch Notice:** CareCompass explicitly informs users that the application **CANNOT dispatch emergency responders or ambulances**. Users must telephone services directly.

---

## 5. Privacy-Preserving Architecture

- User concern narratives and voice transcriptions exist strictly in volatile memory.
- No personal identifiable health information is logged to disk.
- An in-memory anonymized safety audit log records only event types and triggered rule IDs for testing inspection.
- A "Reset Session" button allows users to immediately purge session state.
