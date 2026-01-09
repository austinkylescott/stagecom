import type { DomainEvent, DeliveryChannel, NotificationType } from '../domain/events'
import { resolveDeliveryChannels, resolveNotificationType } from '../domain/events'
import type { Recipient, RecipientRuleRepositories } from '../domain/recipientRules'
import { resolveRecipients } from '../domain/recipientRules'

export interface NotificationRecord {
  userId: string
  notificationType: NotificationType
  eventType: DomainEvent['type']
  payload: Record<string, unknown>
  dedupeKey: string
  channels: DeliveryChannel[]
}

export interface NotificationRepository {
  hasDedupeKey: (userId: string, dedupeKey: string) => Promise<boolean>
  save: (notification: NotificationRecord) => Promise<void>
}

export interface EmailOutboxJob {
  userId: string
  notificationType: NotificationType
  payload: Record<string, unknown>
  dedupeKey: string
}

export interface EmailOutboxRepository {
  queueEmail: (job: EmailOutboxJob) => Promise<void>
}

export interface EmitEventDependencies {
  recipientRules: RecipientRuleRepositories
  notificationRepo: NotificationRepository
  emailOutbox?: EmailOutboxRepository
}

export interface EmitEventResult {
  delivered: number
  deduped: number
  recipients: string[]
}

function buildDedupeKey(event: DomainEvent, notificationType: NotificationType, userId: string): string {
  const base =
    event.dedupeKey ??
    [event.type, event.showId, event.occurrenceId, event.performerId, notificationType]
      .filter(Boolean)
      .join(':')
  return `${base}:user:${userId}`
}

export async function emitEvent(event: DomainEvent, deps: EmitEventDependencies): Promise<EmitEventResult> {
  const notificationType = resolveNotificationType(event.type)
  const channels = resolveDeliveryChannels(notificationType)
  const recipients: Recipient[] = await resolveRecipients(event, deps.recipientRules)

  let delivered = 0
  let deduped = 0

  for (const recipient of recipients) {
    const dedupeKey = buildDedupeKey(event, notificationType, recipient.userId)
    const alreadyExists = await deps.notificationRepo.hasDedupeKey(recipient.userId, dedupeKey)
    if (alreadyExists) {
      deduped += 1
      continue
    }

    const record: NotificationRecord = {
      userId: recipient.userId,
      notificationType,
      eventType: event.type,
      payload: event.payload ?? {},
      dedupeKey,
      channels
    }

    await deps.notificationRepo.save(record)

    if (channels.includes('email') && deps.emailOutbox) {
      await deps.emailOutbox.queueEmail({
        userId: recipient.userId,
        notificationType,
        payload: record.payload,
        dedupeKey
      })
    }

    delivered += 1
  }

  return {
    delivered,
    deduped,
    recipients: recipients.map((recipient) => recipient.userId)
  }
}
