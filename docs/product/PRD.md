# PRD: Triage and Patient Navigator in the Health System

> Terms: **EPS** is the patient's health insurer and **IPS** is the healthcare provider (clinic or hospital).

## 1. Product vision
A conversational system that classifies a user's pain or discomfort in everyday language to guide them to the right level of
care (Emergency, Priority Care or General Medicine) and to explain what they need for their visit.

## 2. Problem statement
Users and patients do not understand the operational difference between emergency care, priority care and outpatient or
general medicine. This causes:
- Congestion and inefficiency in emergency rooms with low-complexity cases.
- Unnecessary trips and lost time for the patient.
- Poor allocation of resources across the provider network.

## 3. Target customers and payers
- Health insurers (EPS).
- Health secretariats and providers (IPS).
- Telephone and municipal medical advice lines (emergency regulation centers).

## 4. Clinical and legal limits (red lines)
- **Golden rule:** guiding is NOT diagnosing or prescribing.
- The agent must **NEVER**:
  - Give medical diagnoses or suggest names of pathologies as definitive.
  - Recommend medication, doses or home treatments.
  - Discourage seeking medical care if the patient still has doubts.

## 5. Main features (v1 scope)
1. **Immediate warning-sign (red flag) detection:** priority evaluation of critical symptoms (chest pain, loss of
   consciousness, severe breathing difficulty, sudden paralysis, massive bleeding, etc.) to refer straight to the emergency
   room or the national emergency line (123).
2. **Simplified evaluation in everyday language:** an adaptive questionnaire of 3 to 5 short questions with no medical
   jargon, to understand severity and duration.
3. **Level-of-care recommendation:** a clear assignment to:
   - Vital or hospital emergency care.
   - Priority care.
   - General medicine or telemedicine.
4. **Travel instructions and checklist:** a clear guide on what to bring (ID, previous exams, insurance card, prior order)
   and the network of recommended sites for their provider.

## 6. Out of scope (v1)
- Booking appointments directly in IPS or EPS calendars.
- Viewing the patient's complete clinical records.
- Prescribing medication.
