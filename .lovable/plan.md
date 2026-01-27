

## Legal Declaration and ID Upload for Parcel Booking

### Overview
Add two critical compliance features to the Small Parcel Booking page:
1. A mandatory legal declaration that the sender is not shipping illegal or stolen goods
2. An ID/Passport upload field to ensure traceability of the person making the booking

---

### What You Will Get

1. **Legal Declaration Checkbox** - A prominent declaration the sender must agree to before booking, stating:
   - Contents are not illegal, stolen, or prohibited
   - They accept personal liability under South African, Lesotho, and Zimbabwean law
   - They understand false declarations may result in legal action

2. **ID/Passport Upload** - A file upload field requiring:
   - Valid ID document or passport photo
   - File validation (PDF, JPEG, PNG only, max 5MB)
   - Visual confirmation when file is uploaded

3. **Review Integration** - Both the declaration status and ID upload will be shown in the review screen before final submission

---

### User Experience Flow

```text
+-------------------+     +-------------------+     +-------------------+
| Fill Booking Form | --> | Upload ID/Passport| --> | Tick Declaration  |
+-------------------+     +-------------------+     +-------------------+
                                                           |
                                                           v
                                                   +-------------------+
                                                   | Review Screen     |
                                                   | (shows ID + decl) |
                                                   +-------------------+
                                                           |
                                                           v
                                                   +-------------------+
                                                   | Confirm Booking   |
                                                   +-------------------+
```

---

### Implementation Details

#### 1. Update Form Schema
Add new required fields to the Zod validation schema:

| Field | Type | Validation |
|-------|------|------------|
| `idDocument` | string | Required - stores filename of uploaded ID |
| `legalDeclaration` | boolean | Must be `true` to proceed |

#### 2. New "Sender Verification" Section
Add a new section to the booking form after "Your Details" containing:
- **ID/Passport Upload Box** - Reusing the upload pattern from Carrier Registration
- **Legal Declaration Checkbox** - A styled checkbox with full declaration text

#### 3. Declaration Text
The declaration will read:

> "I hereby declare that the contents of this parcel are not illegal, stolen, counterfeit, or prohibited under the laws of South Africa, Lesotho, or Zimbabwe. I understand that I will be held personally liable for any violation of applicable laws and that false declarations may result in legal action. I consent to my identification being recorded for traceability purposes."

#### 4. Review Screen Updates
The review overlay will display:
- Uploaded ID document filename
- Confirmation that the legal declaration was accepted
- A reminder of liability in the disclaimer section

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SmallParcelBooking.tsx` | Add ID upload, declaration checkbox, update schema, update review screen |

---

### Visual Design

**ID Upload Section:**
- Drag-and-drop styled box (matching Carrier Registration)
- Shows checkmark and filename when uploaded
- Error state with red border if missing

**Declaration Section:**
- Amber/warning-styled background to draw attention
- Checkbox with a scale/legal icon
- Full legal text visible (not hidden behind a link)
- Required asterisk indicator

**Review Screen:**
- New "Verification" summary card showing:
  - ID document filename
  - "Declaration accepted" confirmation

---

### Technical Approach

1. **State Management**
   - Add `idDocumentFile` state for the actual File object
   - Add `idDocumentName` to formData for the filename
   - Add `legalDeclarationAccepted` boolean to formData

2. **File Upload Handler**
   - Reuse validation logic from Carrier Registration (5MB max, PDF/JPEG/PNG only)
   - Store filename in form state
   - Show upload errors inline

3. **Validation**
   - Both fields required before "Review Booking" button activates
   - Schema validation enforces both fields on submission

4. **Review Display**
   - Add a new summary card in the review overlay
   - Show ID filename and declaration status

---

### Security Note

The ID document upload will initially be client-side only (stored in browser memory during the session). Once Supabase/backend is connected, the file will be stored in secure blob storage and the reference saved to the database. The ID is never stored in the database directly - only a reference to the file in storage.

