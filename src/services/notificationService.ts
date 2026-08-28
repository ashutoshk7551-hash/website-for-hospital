/**
 * Real-Time Notification & Transactional Alert Service
 * Provides stub functions and webhook dispatch triggers for SendGrid, Twilio, and On-Call Pagers.
 */

export type NotificationChannel = "twilio_sms" | "sendgrid_email" | "pagerduty_oncall" | "in_app_broadcast";
export type AlertUrgency = "routine" | "moderate" | "high" | "emergency";

export interface TransactionalAlertPayload {
  id: string;
  referenceId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  department: string;
  urgency: AlertUrgency;
  medicalConcern: string;
  timestamp: string;
  channels: NotificationChannel[];
  sendGridStatus?: "sent" | "delivered" | "failed" | "mock_simulated";
  twilioStatus?: "sent" | "delivered" | "failed" | "mock_simulated";
  pagerDutyStatus?: "triggered" | "acknowledged" | "resolved" | "not_required";
  metaPayload?: Record<string, any>;
}

export interface NotificationDispatchResult {
  success: boolean;
  alertId: string;
  timestamp: string;
  channelsTriggered: NotificationChannel[];
  summary: string;
  sendGridEvent?: {
    templateId: string;
    recipient: string;
    subject: string;
    status: string;
    apiResponseCode: number;
  };
  twilioEvent?: {
    messageSid: string;
    to: string;
    from: string;
    body: string;
    status: string;
    apiResponseCode: number;
  };
  pagerDutyEvent?: {
    incidentKey: string;
    service: string;
    urgencyLevel: string;
    status: string;
  };
}

const DISPATCH_HISTORY_KEY = "peoples_hospital_alert_dispatch_logs";

/**
 * Retrieves persisted alert dispatch logs from local storage.
 */
export function getAlertDispatchLogs(): TransactionalAlertPayload[] {
  try {
    const raw = localStorage.getItem(DISPATCH_HISTORY_KEY);
    if (!raw) return getInitialDispatchLogs();
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load dispatch history:", err);
    return getInitialDispatchLogs();
  }
}

/**
 * Saves alert dispatch logs to local storage.
 */
export function saveAlertDispatchLogs(logs: TransactionalAlertPayload[]): void {
  try {
    localStorage.setItem(DISPATCH_HISTORY_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to save dispatch history:", err);
  }
}

/**
 * Triggers SendGrid Email API stub.
 */
export async function triggerSendGridEmailNotification(
  recipientEmail: string,
  subject: string,
  patientData: { name: string; department: string; urgency: AlertUrgency; concern: string; referenceId: string }
): Promise<{ success: boolean; templateId: string; apiResponseCode: number; details: string }> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const templateId = "d-sendgrid-hipaa-clinical-triage-v4";
  console.log(`[SendGrid Webhook] Dispatched clinical email to ${recipientEmail} with Template: ${templateId}`, {
    subject,
    patientData,
  });

  return {
    success: true,
    templateId,
    apiResponseCode: 202,
    details: `SendGrid transactional email queued for ${recipientEmail}. Subject: "${subject}".`,
  };
}

/**
 * Triggers Twilio SMS Notification API stub.
 */
export async function triggerTwilioSmsAlert(
  recipientPhone: string,
  messageBody: string
): Promise<{ success: boolean; messageSid: string; apiResponseCode: number; details: string }> {
  // Simulate network latency (300ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  const messageSid = `SM${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
  console.log(`[Twilio Messaging] SMS dispatched to ${recipientPhone} (SID: ${messageSid}): "${messageBody}"`);

  return {
    success: true,
    messageSid,
    apiResponseCode: 201,
    details: `Twilio SMS dispatched to ${recipientPhone} via Alphanumeric Sender 'PEOPLESHOSP'. SID: ${messageSid}`,
  };
}

/**
 * Triggers On-Call Clinical PagerDuty / Telemetry Alert for High or Emergency cases.
 */
export async function triggerOnCallPagerDutyAlert(
  department: string,
  urgency: AlertUrgency,
  concern: string,
  referenceId: string
): Promise<{ success: boolean; incidentKey: string; details: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const incidentKey = `PD-HOSP-INC-${Date.now().toString().slice(-6)}`;
  console.log(`[PagerDuty Alert] Urgent on-call page created for ${department} [${urgency.toUpperCase()}]: ${concern} (Ref: ${referenceId})`);

  return {
    success: true,
    incidentKey,
    details: `On-Call Clinical Triage Escalation logged in ${department} pager queue. Incident: ${incidentKey}`,
  };
}

/**
 * High-level orchestration function to dispatch automated alerts based on submission urgency.
 */
export async function dispatchTransactionalAlerts(submission: {
  referenceId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  department: string;
  urgency: AlertUrgency;
  medicalConcern: string;
}): Promise<NotificationDispatchResult> {
  const alertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
  const channels: NotificationChannel[] = ["in_app_broadcast"];

  let sendGridResult: any = undefined;
  let twilioResult: any = undefined;
  let pagerDutyResult: any = undefined;

  // 1. All submissions get SMS confirmation / alert
  if (submission.patientPhone) {
    channels.push("twilio_sms");
    const smsText = `[People's Hospital] Hello ${submission.patientName.split(" ")[0]}, your ${submission.urgency.toUpperCase()} inquiry (Ref #${submission.referenceId}) was securely logged in ${submission.department}. Clinical response team notified.`;
    twilioResult = await triggerTwilioSmsAlert(submission.patientPhone, smsText);
  }

  // 2. All with email get SendGrid encrypted briefing
  if (submission.patientEmail) {
    channels.push("sendgrid_email");
    const emailSubject = `[Confidential] People's Hospital Intake Receipt: Ref #${submission.referenceId} (${submission.urgency.toUpperCase()})`;
    sendGridResult = await triggerSendGridEmailNotification(submission.patientEmail, emailSubject, {
      name: submission.patientName,
      department: submission.department,
      urgency: submission.urgency,
      concern: submission.medicalConcern,
      referenceId: submission.referenceId,
    });
  }

  // 3. High or Emergency urgency triggers staff On-Call PagerDuty
  if (submission.urgency === "high" || submission.urgency === "emergency") {
    channels.push("pagerduty_oncall");
    pagerDutyResult = await triggerOnCallPagerDutyAlert(
      submission.department,
      submission.urgency,
      submission.medicalConcern,
      submission.referenceId
    );
  }

  const alertEntry: TransactionalAlertPayload = {
    id: alertId,
    referenceId: submission.referenceId,
    patientName: submission.patientName,
    patientPhone: submission.patientPhone,
    patientEmail: submission.patientEmail,
    department: submission.department,
    urgency: submission.urgency,
    medicalConcern: submission.medicalConcern,
    timestamp: new Date().toISOString(),
    channels,
    sendGridStatus: sendGridResult ? "delivered" : "mock_simulated",
    twilioStatus: twilioResult ? "delivered" : "mock_simulated",
    pagerDutyStatus: pagerDutyResult ? "triggered" : "not_required",
  };

  const existing = getAlertDispatchLogs();
  saveAlertDispatchLogs([alertEntry, ...existing]);

  return {
    success: true,
    alertId,
    timestamp: alertEntry.timestamp,
    channelsTriggered: channels,
    summary: `Dispatched ${channels.length} real-time notifications (SMS, Email, Staff On-Call Pager).`,
    sendGridEvent: sendGridResult,
    twilioEvent: twilioResult,
    pagerDutyEvent: pagerDutyResult,
  };
}

function getInitialDispatchLogs(): TransactionalAlertPayload[] {
  return [
    {
      id: "ALT-8821",
      referenceId: "PH-INQ-1049",
      patientName: "Eleanor Vance",
      patientPhone: "+1 (555) 234-8901",
      patientEmail: "eleanor.vance@example.com",
      department: "Cardiology",
      urgency: "high",
      medicalConcern: "Palpitations and intermittent chest tightness after morning stairs",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      channels: ["twilio_sms", "sendgrid_email", "pagerduty_oncall", "in_app_broadcast"],
      sendGridStatus: "delivered",
      twilioStatus: "delivered",
      pagerDutyStatus: "triggered",
    },
    {
      id: "ALT-8819",
      referenceId: "PH-INQ-1048",
      patientName: "Jameson Walker",
      patientPhone: "+1 (555) 345-6789",
      patientEmail: "jameson.w@example.com",
      department: "Endocrinology",
      urgency: "moderate",
      medicalConcern: "Fasting blood glucose fluctuating 170-190 mg/dL on current Metformin dose",
      timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
      channels: ["twilio_sms", "sendgrid_email", "in_app_broadcast"],
      sendGridStatus: "delivered",
      twilioStatus: "delivered",
      pagerDutyStatus: "not_required",
    },
    {
      id: "ALT-8815",
      referenceId: "PH-INQ-1042",
      patientName: "Sophia Hernandez",
      patientPhone: "+1 (555) 456-7890",
      patientEmail: "sophia.h@example.com",
      department: "Pediatrics",
      urgency: "routine",
      medicalConcern: "Routine 6-month developmental milestone evaluation & immunization scheduling",
      timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
      channels: ["twilio_sms", "sendgrid_email", "in_app_broadcast"],
      sendGridStatus: "delivered",
      twilioStatus: "delivered",
      pagerDutyStatus: "not_required",
    },
  ];
}
