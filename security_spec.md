# Security Specification - Campus Lost & Found

## 1. Data Invariants
- An `Item` must have a valid `reporterId` that matches the authenticated user's UID.
- `type` must be either 'lost' or 'found'.
- `status` defaults to 'active' on creation.
- Only the `reporter` or an `admin` can update or delete an `Item`.
- Terminal State: Once an item status is 'archived', only an admin can modify it.
- `UserProfile` can only be updated by the owner or an admin.
- Users cannot promote themselves to 'admin'.

## 2. The "Dirty Dozen" Payloads (Deny Cases)

1. **Identity Theft**: Create an item with `reporterId` of another user.
2. **Shadow Field Injection**: Create an item with a hidden `isAdmin: true` field.
3. **Privilege Escalation**: Update own `UserProfile.role` to 'admin'.
4. **ID Poisoning**: Use a document ID that is a 2MB string.
5. **PII Breach**: Unauthorized 'list' query that scrapes all user emails without ownership.
6. **State Shortcutting**: Update an item's `status` directly to 'archived' without being the owner or admin.
7. **Resource Exhaustion**: Post an item with a `description` that is 1MB in size.
8. **Relational Sync Failure**: Create an item with a non-existent category (if we were enforcing categories via collections).
9. **Timestamp Spoofing**: Post an item with a `createdAt` date in the future.
10. **Immutable Field Tampering**: Update `reporterId` on an existing item.
11. **Orphaned Write**: Create an item without required fields like `location` or `title`.
12. **Unauthorized Deletion**: Delete an item reported by someone else.

## 3. Test Runner Design (logic)
The `firestore.rules` will be built to fail all the above scenarios by:
- Using `isValidItem()` helper.
- Enforcing `request.auth.uid == incoming().reporterId`.
- Strictly monitoring `affectedKeys()`.
- Checking `email_verified` for write actions.
