# GymFlow

## Current State
Full member management exists: add/edit/delete with modals and confirmation dialogs. Mobile card view and desktop table view both show direct Pencil and Trash2 buttons per member. Success toasts fire after each action.

## Requested Changes (Diff)

### Add
- 3-dot (MoreVertical) dropdown action menu for each member row/card with "Edit Details" and "Delete Member" options
- Expiry date preview shown in the Add/Edit modal (auto-calculated from joining date + plan)
- "Member Added Successfully", "Details Updated", "Member Deleted" toast messages (already present, confirm wording matches)

### Modify
- Replace direct Pencil + Trash2 buttons in mobile cards and desktop table rows with a DropdownMenu (⋮)
- Improve modal layout for better mobile usability (larger touch targets, sticky footer)
- Desktop table: add Start Date column more visibly

### Remove
- Standalone Pencil/Trash2 icon buttons from member rows (replaced by 3-dot menu)

## Implementation Plan
1. Update MembersTable.tsx: swap Pencil+Trash2 buttons for DropdownMenu with MoreVertical trigger
2. Update MemberModal.tsx: add live expiry date preview
3. Confirm toast messages match requested wording
