// The documents LendOCR reads. Drives the documents pages, the home page grid and the
// sitemap. Field lists mirror the real API response.

export interface DocField {
  name: string;
  about: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface DocInfo {
  slug: string; // URL: /documents/<slug>/
  type: string; // document_type in the API
  name: string;
  h1?: string; // page heading, if not "<name> OCR API"
  group: "KYC" | "Banking" | "Address" | "Income" | "Asset" | "Business";
  title: string; // <title>
  description: string; // meta description
  summary: string; // one line for cards
  intro: string;
  fields: DocField[];
  checks: string[];
  useCases: string[];
  demo?: string; // id in demo.json
  faq?: Faq[]; // document-specific questions (general ones are added on the page)
}

export const DOCUMENTS: DocInfo[] = [
  {
    slug: "pan-card-ocr-api",
    faq: [
      { q: "Does it work with both old and new PAN card designs?", a: "Yes. LendOCR reads the newer cards with Name and Father's Name labels and the older cards without labels, including when the Hindi header comes out as noise." },
    ],
    type: "pan",
    name: "PAN card",
    group: "KYC",
    title: "PAN Card OCR API: Extract and Verify PAN Details",
    description:
      "PAN card OCR API for lenders: extract PAN number, name, father's name and date of birth with format, holder-type and name checks.",
    summary: "PAN number, name, father's name, date of birth.",
    intro:
      "Upload a photo or scan of a PAN card, old or new design, and get the PAN number, name, father's name and date of birth as JSON. Common OCR slips such as I for 1 or O for 0 are corrected and reported.",
    fields: [
      { name: "pan", about: "10-character PAN, format checked" },
      { name: "name", about: "Card holder's name" },
      { name: "fathers_name", about: "Father's name" },
      { name: "dob", about: "Date of birth (YYYY-MM-DD)" },
    ],
    checks: [
      "PAN format (5 letters, 4 digits, 1 letter)",
      "Holder type from the 4th letter: individual, company, firm, HUF, trust and more",
      "The 5th PAN letter matches an initial in the name",
      "Date of birth is a real, past date",
    ],
    useCases: ["Customer onboarding", "Loan applications", "Vendor and partner KYC"],
    demo: "pan",
  },
  {
    slug: "aadhaar-ocr-api",
    faq: [
      { q: "Is it allowed to read Aadhaar with OCR?", a: "Lenders may collect Aadhaar for KYC within UIDAI's rules, which require the number to be masked when stored or shown. LendOCR always returns it masked (XXXX XXXX 1234) and does not store the document." },
      { q: "Can it read the back side with the address?", a: "Yes. Send the front, the back, or both; the response says which side was found and returns the address, pincode and S/O, D/O or W/O name from the back." },
    ],
    type: "aadhaar",
    name: "Aadhaar card",
    group: "KYC",
    title: "Aadhaar OCR API: Masked Aadhaar Extraction with Checksum",
    description:
      "Aadhaar OCR API that returns the number masked, name, date of birth, gender and address, with Verhoeff checksum validation. Front and back.",
    summary: "Masked number, name, DOB, gender, address.",
    intro:
      "Read the front and back of an Aadhaar card. The Aadhaar number is validated with its Verhoeff checksum and always returned masked (XXXX XXXX 1234), as UIDAI requires. The 16-digit VID is never mistaken for it.",
    fields: [
      { name: "aadhaar_number", about: "Always masked: XXXX XXXX 1234" },
      { name: "name", about: "Card holder's name" },
      { name: "dob / year_of_birth", about: "Date or year of birth" },
      { name: "gender", about: "male, female or transgender" },
      { name: "address, pincode", about: "From the back side" },
      { name: "relative_name", about: "S/O, D/O, W/O or C/O name from the address" },
    ],
    checks: [
      "Verhoeff checksum on the 12-digit number",
      "Never returns the full number",
      "Date of birth is real; holder is an adult",
    ],
    useCases: ["Address proof", "Identity verification", "Co-applicant KYC"],
    demo: "aadhaar",
  },
  {
    slug: "voter-id-ocr-api",
    faq: [
      { q: "What if the card shows age instead of date of birth?", a: "Older voter ID cards print 'Age as on' a date. LendOCR returns the age in that case, and the date of birth when it is printed." },
    ],
    type: "voter_id",
    name: "Voter ID",
    group: "KYC",
    title: "Voter ID OCR API: Extract EPIC Number and Details",
    description:
      "Voter ID (EPIC) OCR API: extract EPIC number, name, relative's name, gender, date of birth or age, and address.",
    summary: "EPIC number, name, relative, gender, DOB or age.",
    intro:
      "Read Election Commission voter ID cards, front and back. Works with cards that show a date of birth or only an age.",
    fields: [
      { name: "epic_number", about: "3 letters + 7 digits, format checked" },
      { name: "name", about: "Elector's name" },
      { name: "relative_name", about: "Father's or husband's name (relation reported)" },
      { name: "gender", about: "As printed" },
      { name: "dob / age", about: "Date of birth, or age where only age is printed" },
      { name: "address, pincode", about: "From the back side" },
    ],
    checks: ["EPIC number format", "Date of birth is a real, past date"],
    useCases: ["Identity and address proof", "Rural and MFI lending"],
  },
  {
    slug: "driving-licence-ocr-api",
    faq: [
      { q: "Does it check if the driving licence has expired?", a: "Yes. The non-transport validity date is compared with today and an expired licence is flagged for review." },
    ],
    type: "driving_licence",
    name: "Driving licence",
    group: "KYC",
    title: "Driving Licence OCR API: DL Number and Validity",
    description:
      "Driving licence OCR API for India: DL number with state and RTO, name, date of birth, issue date, validity, vehicle classes and address.",
    summary: "DL number, name, DOB, validity, vehicle classes.",
    intro:
      "Read state driving licences in any common format. The DL number is split into state, RTO and year of issue, and an expired licence is flagged.",
    fields: [
      { name: "dl_number", about: "e.g. TN01 20190001234, with state and RTO" },
      { name: "name, relative_name", about: "Holder and S/D/W of" },
      { name: "dob", about: "Date of birth" },
      { name: "issue_date, valid_till", about: "Issue and validity dates" },
      { name: "vehicle_classes", about: "MCWG, LMV and others" },
      { name: "address, pincode, blood_group", about: "Where printed" },
    ],
    checks: [
      "State code, RTO and issue year are valid",
      "Licence has not expired",
      "Holder was at least 16 at issue",
    ],
    useCases: ["Two-wheeler and car loans", "Identity proof"],
  },
  {
    slug: "passport-ocr-api",
    faq: [
      { q: "Why is the MRZ important?", a: "The two lines of characters at the bottom of the data page carry check digits for the passport number, date of birth and expiry. When they pass, those fields are almost certainly correct; when they fail, the passport is flagged." },
    ],
    type: "passport",
    name: "Passport",
    group: "KYC",
    title: "Passport OCR API with MRZ Check Digits",
    description:
      "Passport OCR API that reads the MRZ and verifies its check digits: passport number, names, nationality, date of birth, expiry and more.",
    summary: "MRZ with check digits, names, DOB, expiry.",
    intro:
      "Read the passport data page. The machine-readable zone (MRZ) carries check digits for the number, birth date and expiry, so when they pass, those fields are near-certain. Printed fields fill in the rest.",
    fields: [
      { name: "passport_number", about: "1 letter + 7 digits" },
      { name: "surname, given_names", about: "From the MRZ" },
      { name: "dob, expiry_date, issue_date", about: "Dates" },
      { name: "nationality, gender", about: "From the MRZ" },
      { name: "place_of_birth, place_of_issue, file_number", about: "Printed fields" },
    ],
    checks: ["All four MRZ check digits", "Passport has not expired", "Number format"],
    useCases: ["NRI customers", "High-value onboarding"],
  },
  {
    slug: "cheque-ocr-api",
    faq: [
      { q: "Can it read a cancelled cheque for NACH set-up?", a: "Yes. It returns the IFSC, bank name, account number, account holder and the MICR code, and reports whether 'Cancelled' is written on the cheque." },
    ],
    type: "cheque",
    name: "Cheque",
    group: "Banking",
    title: "Cheque OCR API: IFSC, Account Number and MICR",
    description:
      "Cheque OCR API: read IFSC, bank name, account number, account holder and the MICR band (cheque number, MICR code) from cancelled cheques.",
    summary: "IFSC, bank, account number, MICR, holder.",
    intro:
      "Read cancelled cheques for disbursal and NACH set-up. The bank name comes from the IFSC, and the MICR band at the bottom is decoded even when OCR turns its special symbols into stray characters.",
    fields: [
      { name: "ifsc, bank_name", about: "IFSC and the bank it belongs to" },
      { name: "account_number", about: "9 to 18 digits" },
      { name: "account_holder", about: "Name printed near the signature" },
      { name: "micr_code, cheque_number", about: "From the MICR band" },
    ],
    checks: ["IFSC format", "MICR format", "Account number length", "'Cancelled' detected"],
    useCases: ["Disbursal account", "NACH / e-mandate set-up"],
    demo: "cheque",
  },
  {
    slug: "bank-statement-analysis-api",
    faq: [
      { q: "Which banks' statements are supported?", a: "LendOCR reads the transaction table by its structure and checks every row against the running balance, so it is not tied to fixed templates. Digital PDFs (including password-protected ones) give the most reliable results; scans and photos are read with OCR." },
      { q: "How does it spot an edited statement?", a: "Every row's balance must equal the previous balance plus credits minus debits. Rows that do not add up are listed in the response and the statement is flagged for review." },
      { q: "What analysis is included?", a: "Monthly credits, debits and balances, average daily balance, salary credits, EMI and loan debits, cheque and ECS bounces, cash deposits, ATM withdrawals, charges and interest." },
    ],
    type: "bank_statement",
    name: "Bank statement",
    h1: "Bank statement analysis API",
    group: "Banking",
    title: "Bank Statement Analysis API: Salary, EMI and Bounces",
    description:
      "Bank statement analysis API: every transaction plus salary, EMIs, cheque bounces, average balance and a tamper check. Digital or scanned PDFs.",
    summary: "Transactions, salary, EMIs, bounces, average balance.",
    intro:
      "Send a digital or scanned statement, including password-protected PDFs. LendOCR returns every transaction and the analysis credit teams do by hand, and checks that every row's balance adds up, so edited statements stand out.",
    fields: [
      { name: "account_number, account_holder, ifsc, bank_name", about: "Header details" },
      { name: "period_from, period_to", about: "Statement period" },
      { name: "opening_balance, closing_balance", about: "Balances" },
      { name: "data.transactions", about: "Date, narration, debit, credit, balance, category" },
      { name: "data.analysis", about: "Salary, EMIs, bounces, cash, ATM, charges, monthly summary, average daily balance" },
    ],
    checks: [
      "Running balance adds up on every row (tamper check)",
      "Stated closing balance matches the last transaction",
      "Transactions found",
    ],
    useCases: ["Income assessment", "Banking surrogate programmes", "Fraud screening"],
    demo: "bank_statement",
  },
  {
    slug: "electricity-bill-ocr-api",
    faq: [
      { q: "Which electricity boards are supported?", a: "Bills from state boards and private DISCOMs are read by their labels (consumer or service number, bill date, amount payable), so most formats work without special templates." },
    ],
    type: "electricity_bill",
    name: "Electricity bill",
    group: "Address",
    title: "Electricity Bill OCR API for Address Proof",
    description:
      "Electricity (EB) bill OCR API: consumer number, name, address, pincode, bill date, due date, amount and units, with a 3-month recency check.",
    summary: "Consumer number, name, address, bill date, amount.",
    intro:
      "Read electricity bills from state boards and private DISCOMs as address proof. Bills older than about three months are flagged, since most lenders will not accept them.",
    fields: [
      { name: "consumer_number", about: "Service / consumer / CA number" },
      { name: "name, address, pincode", about: "As billed" },
      { name: "bill_date, due_date, period", about: "Billing dates" },
      { name: "amount_due, units_consumed", about: "Amount and kWh" },
      { name: "provider", about: "Electricity board" },
    ],
    checks: ["Bill is not older than 3 months", "Due date after bill date", "Amount is valid"],
    useCases: ["Address proof", "Utility-payment track record"],
    demo: "electricity_bill",
  },
  {
    slug: "water-bill-ocr-api",
    faq: [
      { q: "Is a water bill accepted as address proof?", a: "Many lenders accept recent utility bills as address proof. LendOCR extracts the name and address and flags bills older than about three months." },
    ],
    type: "water_bill",
    name: "Water bill",
    group: "Address",
    title: "Water Bill OCR API for Address Proof",
    description:
      "Water bill OCR API: consumer number, name, premises address, pincode, bill date, due date and amount, with a recency check.",
    summary: "Consumer number, name, address, bill date, amount.",
    intro: "Read municipal and water-board bills as address proof, with the same recency check as electricity bills.",
    fields: [
      { name: "consumer_number", about: "Consumer / connection number" },
      { name: "name, address, pincode", about: "As billed" },
      { name: "bill_date, due_date", about: "Billing dates" },
      { name: "amount_due", about: "Amount payable" },
    ],
    checks: ["Bill is not older than 3 months", "Due date after bill date"],
    useCases: ["Address proof"],
  },
  {
    slug: "vehicle-insurance-ocr-api",
    faq: [
      { q: "Does it work for both bikes and cars?", a: "Yes. It reads two-wheeler and private-car policies, reports which one it is, and whether the cover is comprehensive, third-party or own-damage." },
    ],
    type: "motor_insurance",
    name: "Bike and car insurance",
    group: "Asset",
    title: "Vehicle Insurance OCR API: Bike and Car Policy Extraction",
    description:
      "Motor insurance OCR API for two-wheeler and car policies: policy number, insurer, insured name, registration number, policy period, IDV and premium.",
    summary: "Policy, insurer, registration, period, IDV.",
    intro:
      "Read two-wheeler and private-car policies from major insurers. The registration number is validated and the policy is checked to be active today.",
    fields: [
      { name: "policy_number, insurer", about: "Policy and insurance company" },
      { name: "insured_name", about: "Policy holder" },
      { name: "registration_number", about: "e.g. TN 09 AB 1234, or BH series" },
      { name: "make_model, engine_number, chassis_number", about: "Vehicle details" },
      { name: "policy_start, policy_end", about: "Cover period" },
      { name: "idv, premium", about: "Insured declared value and premium" },
    ],
    checks: ["Registration number format and state", "Policy is active today", "End date after start date"],
    useCases: ["Vehicle loans", "Asset verification", "Renewal tracking"],
    demo: "motor_insurance",
  },
  {
    slug: "itr-ocr-api",
    faq: [
      { q: "How do I open a password-protected ITR-V?", a: "Send the PDF with its password in the password field. For ITR-V the password is the PAN in lower case followed by the date of birth as ddmmyyyy." },
    ],
    type: "itr_v",
    name: "ITR-V acknowledgement",
    group: "Income",
    title: "ITR OCR API: Extract ITR-V Acknowledgement Data",
    description:
      "ITR-V OCR API: PAN, name, assessment year, acknowledgement number, filing date, gross and total income, tax and refund. Password-protected PDFs supported.",
    summary: "PAN, AY, acknowledgement, income, tax.",
    intro:
      "Read income tax return acknowledgements, including the password-protected PDFs taxpayers download (password: PAN in lower case + date of birth).",
    fields: [
      { name: "pan, name", about: "Taxpayer" },
      { name: "assessment_year, itr_form", about: "e.g. 2025-26, ITR-1" },
      { name: "acknowledgement_number, filing_date", about: "Filing details" },
      { name: "gross_total_income, total_income", about: "Income" },
      { name: "tax_payable, taxes_paid, refund", about: "Tax figures" },
    ],
    checks: [
      "Assessment year format",
      "Filing date fits the assessment year",
      "Total income is not more than gross total income",
    ],
    useCases: ["Self-employed income proof", "MSME lending"],
    demo: "itr_v",
  },
  {
    slug: "salary-slip-ocr-api",
    faq: [
      { q: "What if the salary slip numbers do not add up?", a: "LendOCR checks that net pay equals gross earnings minus deductions. If it does not, the slip is flagged for review with a warning." },
    ],
    type: "salary_slip",
    name: "Salary slip",
    group: "Income",
    title: "Salary Slip OCR API: Extract Gross, Deductions and Net Pay",
    description:
      "Salary slip OCR API: employer, month, employee, gross earnings, deductions, net pay, basic, HRA and PF, with a net = gross − deductions check.",
    summary: "Employer, month, gross, deductions, net pay.",
    intro:
      "Read payslips in common layouts and check that the numbers add up: net pay must equal gross earnings minus deductions.",
    fields: [
      { name: "employer, month", about: "Employer and pay month" },
      { name: "employee_name, employee_id, designation", about: "Employee" },
      { name: "gross_earnings, total_deductions, net_pay", about: "Totals" },
      { name: "basic, hra, provident_fund, professional_tax", about: "Components" },
      { name: "pan, uan, bank_account", about: "Where printed" },
    ],
    checks: ["Net pay = gross earnings − total deductions", "Net pay is plausible"],
    useCases: ["Salaried income assessment", "Personal loans"],
    demo: "salary_slip",
  },
  {
    slug: "gst-certificate-ocr-api",
    faq: [
      { q: "Does it verify the GSTIN?", a: "It validates the GSTIN's checksum, state code and the PAN inside it. Confirming the registration is active needs the GST portal, which you can check alongside." },
    ],
    type: "gst_certificate",
    name: "GST certificate",
    group: "Business",
    title: "GST Certificate OCR API: GSTIN, Legal Name and Address",
    description:
      "GST registration certificate (REG-06) OCR API: GSTIN with checksum, legal and trade name, constitution, principal place of business and dates.",
    summary: "GSTIN, legal name, constitution, address.",
    intro:
      "Read GST registration certificates. The GSTIN is validated with its checksum, the PAN inside it is checked, and the state is compared with the address.",
    fields: [
      { name: "gstin", about: "15 characters, checksum verified" },
      { name: "legal_name, trade_name", about: "Business names" },
      { name: "constitution, registration_type", about: "e.g. Partnership, Regular" },
      { name: "address, pincode", about: "Principal place of business" },
      { name: "liability_date, valid_from", about: "Dates" },
    ],
    checks: ["GSTIN checksum", "Embedded PAN is valid", "State matches the address"],
    useCases: ["MSME and business loans", "Supplier onboarding"],
  },
  {
    slug: "udyam-certificate-ocr-api",
    faq: [
      { q: "What does it return for MSME classification?", a: "The Udyam number, enterprise name, whether it is micro, small or medium, its major activity and the registration date." },
    ],
    type: "udyam",
    name: "Udyam certificate",
    group: "Business",
    title: "Udyam Certificate OCR API: MSME Registration Details",
    description:
      "Udyam registration certificate OCR API: Udyam number, enterprise name, micro/small/medium type, major activity and registration date.",
    summary: "Udyam number, enterprise, type, activity.",
    intro: "Read Udyam (MSME) registration certificates for business lending and priority-sector classification.",
    fields: [
      { name: "udyam_number", about: "UDYAM-XX-00-0000000, format checked" },
      { name: "enterprise_name", about: "Name of enterprise" },
      { name: "enterprise_type", about: "micro, small or medium" },
      { name: "major_activity", about: "Manufacturing, services or trading" },
      { name: "registration_date", about: "Date of Udyam registration" },
    ],
    checks: ["Udyam number format and state code"],
    useCases: ["MSME loans", "Priority-sector lending"],
  },
];

export const GROUPS: DocInfo["group"][] = ["KYC", "Banking", "Address", "Income", "Asset", "Business"];
