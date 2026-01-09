import type { DomainEvent } from './events'

export interface Recipient {
  userId: string
}

export interface RecipientRuleRepositories {
  getTheaterStaffForShow: (showId: string) => Promise<Recipient[]>
  getShowProducers: (showId: string) => Promise<Recipient[]>
  getPerformerById: (userId: string) => Promise<Recipient | null>
  getAcceptedPerformersForOccurrence: (occurrenceId: string) => Promise<Recipient[]>
}

export function mergeRecipients(...groups: Recipient[][]): Recipient[] {
  const seen = new Set<string>()
  const merged: Recipient[] = []
  for (const group of groups) {
    for (const recipient of group) {
      if (seen.has(recipient.userId)) continue
      seen.add(recipient.userId)
      merged.push(recipient)
    }
  }
  return merged
}

export async function resolveRecipients(
  event: DomainEvent,
  repositories: RecipientRuleRepositories
): Promise<Recipient[]> {
  switch (event.type) {
    case 'show.submitted_for_review': {
      if (!event.showId) return []
      return repositories.getTheaterStaffForShow(event.showId)
    }
    case 'show.approved':
    case 'show.rejected':
    case 'cast.requested':
    case 'cast.accepted':
    case 'cast.declined':
    case 'cast.withdrawn': {
      if (!event.showId) return []
      return repositories.getShowProducers(event.showId)
    }
    case 'cast.invited':
    case 'cast.removed_by_producer': {
      if (!event.performerId) return []
      const performer = await repositories.getPerformerById(event.performerId)
      return performer ? [performer] : []
    }
    case 'occurrence.time_changed':
    case 'occurrence.cancelled':
    case 'occurrence.reminder_24h': {
      const producers = event.showId ? await repositories.getShowProducers(event.showId) : []
      const performers = event.occurrenceId
        ? await repositories.getAcceptedPerformersForOccurrence(event.occurrenceId)
        : []
      return mergeRecipients(producers, performers)
    }
    case 'show.casting_opened': {
      // Minimal default: notify producers; casting audience targeting can be expanded later.
      if (!event.showId) return []
      return repositories.getShowProducers(event.showId)
    }
    default:
      return []
  }
}
