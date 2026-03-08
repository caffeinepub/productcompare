# AutoShowroom

## Current State

A car sales app with:
- Public catalog of car models (sedan, SUV, hatchback)
- Per-model trim/variant pages with features
- Pricing page with EMI breakdowns
- Side-by-side comparison tool (up to 4 trims)
- Admin panel protected by Internet Identity + role-based access control
- Admin can claim access, reset admin, seed sample data, add/edit/delete models and trims

The current admin flow has issues: the claimAdmin/resetAdmin functions are unprotected and unreliable. The user has a known Internet Identity principal and cannot access the admin panel reliably.

## Requested Changes (Diff)

### Add
- Hardcoded OWNER_PRINCIPAL constant = `xkh5y-mmyoe-vquq7-42fdf-xmiwm-gqvrh-jzqej-4uqep-vogg2-yumzv-kae`
- `isOwner(caller)` helper that returns true when caller matches OWNER_PRINCIPAL
- `getCallerPrincipal` query so the frontend can display the caller's principal for debugging
- All admin-gated functions must also accept the owner principal (bypass role check if caller == OWNER_PRINCIPAL)

### Modify
- `claimAdminIfNoneExists`: always succeeds for OWNER_PRINCIPAL regardless of `adminAssigned` state
- `resetAdmin`: restricted -- only callable by OWNER_PRINCIPAL
- All CRUD functions (addCarModel, updateCarModel, deleteCarModel, addTrim, updateTrim, deleteTrim, seedData): accept caller if caller == OWNER_PRINCIPAL OR has admin role

### Remove
- Nothing removed from existing data model or public API surface

## Implementation Plan

1. Add OWNER_PRINCIPAL constant at top of actor
2. Add `isAdminOrOwner(caller)` private helper
3. Replace all `AccessControl.hasPermission(accessControlState, caller, #admin)` checks with `isAdminOrOwner(caller)`
4. Update `claimAdminIfNoneExists` to always grant admin to OWNER_PRINCIPAL
5. Restrict `resetAdmin` to OWNER_PRINCIPAL only
6. Add `getCallerPrincipal` public query returning caller as Text
7. Update frontend Admin page: show "You are logged in as owner" when principal matches, remove Reset Admin button from Access Denied screen (owner never needs it), auto-claim admin on login if principal is owner
