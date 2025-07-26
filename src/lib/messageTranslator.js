/**
 * Utility function to translate server-side message keys on the client side
 */

export function translateServerMessage(message, t) {
  if (!message || typeof message !== 'string') {
    return message;
  }

  // Handle installation scheduled messages
  if (message.startsWith('INSTALLATION_SCHEDULED_MESSAGE:')) {
    const parts = message.split(':');
    if (parts.length >= 4) {
      const scheduledDate = parts[1];
      const timeRange = parts[2];
      const duration = parts[3];
      const additionalNotes = parts.length > 4 ? parts.slice(4).join(':') : '';
      
      const baseMessage = t('admin.orders.messages.installationScheduled');
      const formattedMessage = `${baseMessage} ${scheduledDate} ${timeRange} (${duration}h)`;
      
      return additionalNotes ? `${formattedMessage}. ${t('admin.orders.notes')}: ${additionalNotes}` : formattedMessage;
    }
  }

  // Handle status change messages
  if (message.startsWith('STATUS_CHANGE_MESSAGE:')) {
    const parts = message.split(':');
    if (parts.length >= 3) {
      const oldStatus = parts[1];
      const newStatus = parts[2];
      const additionalNotes = parts.length > 3 ? parts.slice(3).join(':') : '';
      
      const baseMessage = t('admin.orders.messages.statusChanged');
      const formattedMessage = `${baseMessage} ${t(`admin.orders.status.${oldStatus}`)} ${t('admin.orders.to')} ${t(`admin.orders.status.${newStatus}`)}`;
      
      return additionalNotes ? `${formattedMessage}. ${t('admin.orders.notes')}: ${additionalNotes}` : formattedMessage;
    }
  }

  // Handle old hardcoded English messages (fallback for existing data)
  if (message.includes('Installation scheduled for')) {
    // Extract date and time information from the old format
    const match = message.match(/Installation scheduled for (.+?) \((.+?)h\)/);
    if (match) {
      const dateTime = match[1];
      const duration = match[2];
      const baseMessage = t('admin.orders.messages.installationScheduled');
      return `${baseMessage} ${dateTime} (${duration}h)`;
    }
  }

  if (message.includes('Installation scheduled from')) {
    // Extract date and time information from the old format
    const match = message.match(/Installation scheduled from (.+?) to (.+)/);
    if (match) {
      const startDateTime = match[1];
      const endDateTime = match[2];
      const baseMessage = t('admin.orders.messages.installationScheduled');
      return `${baseMessage} ${startDateTime} to ${endDateTime}`;
    }
  }

  if (message.includes('Status updated from')) {
    // Extract status information from the old format
    const match = message.match(/Status updated from (.+?) to (.+)/);
    if (match) {
      const oldStatus = match[1];
      const newStatus = match[2];
      const baseMessage = t('admin.orders.messages.statusChanged');
      return `${baseMessage} ${t(`admin.orders.status.${oldStatus}`)} ${t('admin.orders.to')} ${t(`admin.orders.status.${newStatus}`)}`;
    }
  }

  // Return original message if no translation pattern matches
  return message;
}

/**
 * Translate an array of messages (useful for order history)
 */
export function translateServerMessages(messages, t) {
  if (!Array.isArray(messages)) {
    return messages;
  }
  
  return messages.map(message => translateServerMessage(message, t));
} 