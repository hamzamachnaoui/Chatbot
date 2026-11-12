/**
 * Build a deterministic private chat document ID for two distinct user UIDs.
 */
export function getPrivateChatId(uid1, uid2) {
  if (!uid1 || !uid2 || uid1 === uid2) return "";
  return [uid1, uid2].sort().join("__");
}

/**
 * Extract the peer UID from a deterministic private chat ID.
 */
export function getOtherParticipantUid(chatId, currentUid) {
  if (!chatId || !currentUid) return "";
  const parts = chatId.split("__");
  if (parts.length !== 2) return "";
  if (parts[0] === currentUid) return parts[1];
  if (parts[1] === currentUid) return parts[0];
  return "";
}

/**
 * Check whether the current user is one of the two participants encoded in chatId.
 */
export function isValidPrivateChatIdForUser(chatId, currentUid) {
  return Boolean(getOtherParticipantUid(chatId, currentUid));
}

