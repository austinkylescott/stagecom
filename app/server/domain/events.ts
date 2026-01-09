export type DomainEventType =
  | 'show.submitted_for_review'
  | 'show.approved'
  | 'show.rejected'
  | 'cast.invited'
  | 'cast.requested'
  | 'cast.accepted'
  | 'cast.declined'
  | 'cast.withdrawn'
  | 'cast.removed_by_producer'
  | 'occurrence.time_changed'
  | 'occurrence.cancelled'
  | 'occurrence.reminder_24h'
  | 'show.casting_opened'

export type NotificationType =
  | 'invited_to_show'
  | 'show_time_changed'
  | 'show_reminder'
  | 'show_approved'
  | 'show_rejected'
  | 'show_submitted'
  | 'cast_request_received'
  | 'cast_response_received'
  | 'cast_declined'
  | 'cast_withdrawn'
  | 'cast_removed'
  | 'new_casting_show'
  | 'show_cancelled'
  | 'in_app_generic'

export type DeliveryChannel = 'in-app' | 'email'

export interface DomainEventPayload {
  [key: string]: unknown
}

export interface DomainEvent {
  type: DomainEventType
  showId?: string
  theaterId?: string
  occurrenceId?: string
  performerId?: string
  payload?: DomainEventPayload
  dedupeKey?: string
}

const notificationTypeMap: Record<DomainEventType, NotificationType> = {
  'show.submitted_for_review': 'show_submitted',
  'show.approved': 'show_approved',
  'show.rejected': 'show_rejected',
  'cast.invited': 'invited_to_show',
  'cast.requested': 'cast_request_received',
  'cast.accepted': 'cast_response_received',
  'cast.declined': 'cast_declined',
  'cast.withdrawn': 'cast_withdrawn',
  'cast.removed_by_producer': 'cast_removed',
  'occurrence.time_changed': 'show_time_changed',
  'occurrence.cancelled': 'show_cancelled',
  'occurrence.reminder_24h': 'show_reminder',
  'show.casting_opened': 'new_casting_show'
}

const emailAndInApp: Set<NotificationType> = new Set([
  'invited_to_show',
  'show_time_changed',
  'show_reminder',
  'show_approved',
  'show_rejected'
])

export function resolveNotificationType(eventType: DomainEventType): NotificationType {
  return notificationTypeMap[eventType] ?? 'in_app_generic'
}

export function resolveDeliveryChannels(notificationType: NotificationType): DeliveryChannel[] {
  return emailAndInApp.has(notificationType) ? ['in-app', 'email'] : ['in-app']
}
