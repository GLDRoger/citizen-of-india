export interface MockGovResponse<T> {
  simulated: true;
  authority: string;
  data: T;
}

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function reference(prefix: string, key: string) {
  return `${prefix}-${String(hash(key) % 10_000_000).padStart(7, "0")}`;
}

async function mockResponse<T>(key: string, authority: string, data: T): Promise<MockGovResponse<T>> {
  const latency = 400 + (hash(key) % 801);
  await new Promise((resolve) => setTimeout(resolve, latency));
  return { simulated: true, authority, data };
}

export function registerDeath(input: { deceasedName: string; date: string; reporterId: string }) {
  return mockResponse(`death:${input.deceasedName}:${input.date}`, "BBMP Births & Deaths", {
    registrationId: reference("BBMP-DR", input.deceasedName),
    status: "registered" as const,
    registeredOn: input.date,
  });
}

export function issueDeathCertificate(input: { deceasedName: string; registrationId: string }) {
  return mockResponse(`certificate:${input.registrationId}`, "BBMP Births & Deaths", {
    certificateNumber: reference("BBMP-DC", input.deceasedName),
    issuedOn: "2026-08-24",
    status: "issued" as const,
  });
}

export function requestFamilyConsent(input: { participantName: string; procedureId: string }) {
  return mockResponse(`consent:${input.procedureId}:${input.participantName}`, "Citizen consent relay", {
    participantName: input.participantName,
    status: "consent-received" as const,
    receivedAt: "2026-08-24T12:40:00+05:30",
  });
}

export function bookAppointment(input: { procedureId: string; city: string }) {
  return mockResponse(`appointment:${input.procedureId}:${input.city}`, "Kaveri Online Services", {
    appointmentId: reference("APT", input.procedureId),
    office: `Sub-Registrar Office, ${input.city}`,
    scheduledFor: "2026-09-03T11:30:00+05:30",
  });
}

export function processPayment(input: { purpose: string; amount: number; payerId: string }) {
  return mockResponse(`payment:${input.purpose}:${input.payerId}`, "Karnataka One", {
    receipt: reference("PAY", `${input.purpose}:${input.payerId}`),
    amount: input.amount,
    status: "paid" as const,
  });
}

export function submitGstr3b(input: { businessId: string; period: string }) {
  return mockResponse(`gstr3b:${input.businessId}:${input.period}`, "GSTN simulated filing desk", {
    acknowledgement: reference("GST-ARN", `${input.businessId}:${input.period}`),
    period: input.period,
    status: "filed" as const,
  });
}

export function submitClaim(input: { kind: string; claimantId: string }) {
  return mockResponse(`claim:${input.kind}:${input.claimantId}`, "EPFO", {
    claimReference: reference("EPFO-CLM", `${input.kind}:${input.claimantId}`),
    status: "submitted" as const,
    expectedDecisionDays: 20,
  });
}

export function registerEpfoGrievance(input: { employmentId: string; issue: string; memberId: string }) {
  return mockResponse(`epfo-grievance:${input.employmentId}:${input.issue}:${input.memberId}`, "EPFO", {
    grievanceReference: reference("EPFO-GRV", `${input.memberId}:${input.issue}`),
    status: "registered" as const,
    expectedResponseDays: 15,
  });
}

export function submitBenefitApplication(input: { benefitId: string; applicantId: string }) {
  return mockResponse(`benefit:${input.benefitId}:${input.applicantId}`, "UMANG scheme application desk", {
    applicationReference: reference("SCH", `${input.benefitId}:${input.applicantId}`),
    status: "submitted" as const,
  });
}

export function submitMarriageRegistration(input: { applicantId: string; partnerId: string }) {
  return mockResponse(`marriage:${input.applicantId}:${input.partnerId}`, "Kaveri Online Services", {
    applicationReference: reference("KAV-MRG", `${input.applicantId}:${input.partnerId}`),
    certificateNumber: reference("KA-MC", `${input.partnerId}:${input.applicantId}`),
    status: "registered" as const,
  });
}

export function submitPanCorrection(input: { personId: string; correctedName: string }) {
  return mockResponse(`pan:${input.personId}:${input.correctedName}`, "Protean eGov (PAN)", {
    acknowledgement: reference("PAN-CR", input.personId),
    correctedName: input.correctedName,
    status: "submitted" as const,
  });
}
