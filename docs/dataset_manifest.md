# CareCompass — Dataset Manifest & Research Data Strategy

## 1. Internal Bundled Synthetic Datasets

All datasets committed directly within this repository are 100% fictional, synthetically authored records created specifically for prototype demonstration and automated regression testing. They contain zero Real-World Protected Health Information (PHI) or personally identifiable information.

| Dataset File | File Format | Records | Purpose / Intended Use | Known Limitations | License |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/app/data/synthetic_triage_tests.json` | JSON | 22 cases | Automated regression test cases for all 12 emergency red-flag categories, negation tests, Hindi/Hinglish language variants, and routine support queries. | Synthetic test cases authored for hackathon safety verification. **Not a certified clinical benchmark.** | MIT |
| `backend/app/data/caregiver_profiles_synthetic.csv` | CSV | 10 profiles | Fictional non-clinical caregiver profiles (aides, companions, doulas) with structured skills, areas, and availability for matching algorithm demos. | Fictional names, synthetic capabilities. No real phone numbers or addresses. | MIT |
| `backend/app/data/language_examples_synthetic.csv` | CSV | 15 examples | Reference multi-lingual utterances in English, Hindi (Devanagari), and Hinglish mapped to symptom concepts. | Demonstrative language coverage; not exhaustive across all dialects. | MIT |

---

## 2. Research Datasets & External Academic References

In compliance with repository safety policies, copyrighted, restricted, or gated third-party clinical datasets are **not bundled** into this repository. Developers and researchers interested in benchmarking care navigation architectures should acquire them directly from original research repositories under their respective terms:

### 1. Kaggle Disease Symptom Prediction / Description Dataset
- **URL:** [https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset](https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset)
- **Intended Use:** Structured symptom vocabulary experimentation and normalization token mapping.
- **Known Limitations:** Contains disease prediction pairs; **strictly unsuitable** for validated triage or emergency assessment.

### 2. Kaggle Triagegeist
- **URL:** [https://www.kaggle.com/competitions/triagegeist/data](https://www.kaggle.com/competitions/triagegeist/data)
- **Intended Use:** Synthetic Emergency Department triage records with acuity levels (ESI 1-5) and chief complaint narratives.
- **Terms & Restrictions:** Non-commercial research and educational use only; competition redistribution restrictions apply. Do not bundle raw files.

### 3. Mendeley Triage Scenario Dataset
- **URL:** [https://data.mendeley.com/datasets/dd359z6trk/2](https://data.mendeley.com/datasets/dd359z6trk/2)
- **License:** CC BY 4.0
- **Intended Use:** Triage scenario evaluations comparing expert clinical nurse triage ratings against automated classification models.
- **Verification Note:** Inspect schema and ethical documentation prior to fine-tuning or clinical calibration experiments.

### 4. Hospital Triage and Patient History Dataset
- **URL:** [https://www.kaggle.com/code/maalona/hospital-triage-and-history-data](https://www.kaggle.com/code/maalona/hospital-triage-and-history-data)
- **Intended Use:** In-depth exploratory analysis of demographic factors, vital signs, and retrospective triage allocations.
- **Compliance:** Confirm source hospital privacy obligations, de-identification verification, and institutional review permissions before external ingestion.

---

## 3. Responsible AI & Data Disclaimer
No research or synthetic dataset in this repository is claimed to be clinically validated. The CareCompass team explicitly acknowledges that clinical validation requires formal prospective trials supervised by certified healthcare regulatory boards.
