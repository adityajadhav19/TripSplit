# TripSplit

**Split expenses, not friendships.**

TripSplit is a group expense-sharing web application designed to help friends and travel groups track shared expenses, understand who owes whom, and simplify settling up.

## Features

- **Create a trip:** Create a group with a name and password.
- **Join a trip:** Join an existing group using its group code and password.
- **Member management:** Track group members and associate expenses with the correct people.
- **Expense tracking:** Record expenses, amounts, payers, and participating members.
- **Expense sharing:** Divide expenses among selected participants.
- **Settlement calculations:** Calculate balances and determine who owes whom.
- **Session management:** Maintain member sessions using secure HTTP-only cookies.
- **Responsive interface:** Use the application across desktop and mobile screen sizes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling and responsive UI |
| Prisma ORM | Database access and schema management |
| PostgreSQL | Relational database |
| bcryptjs | Password hashing |
| jose | JWT-based session handling |

## Project Structure

```text
trip-split/
├── app/
│   ├── api/
│   │   └── groups/
│   │       ├── join/
│   │       └── [groupCode]/
│   │           ├── expenses/
│   │           └── settlement/
│   ├── trip/
│   │   └── [groupCode]/
│   │       ├── expenses/
│   │       │   └── new/
│   │       ├── settlement/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AddExpenseModal.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── RecentExpenses.tsx
│   └── TripActionCard.tsx
├── lib/
│   ├── prisma.ts
│   └── session.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── prisma.config.ts
├── .env
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js compatible with your Next.js version
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd trip-split
```

Replace `<repository-url>` with your repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/trip?schema=public"
SESSION_SECRET="your-long-random-secret"
```

Replace the database credentials with your PostgreSQL configuration.

Use a strong, randomly generated session secret. Never commit `.env` or expose production credentials.

### 4. Configure Prisma

Ensure `prisma.config.ts` loads the appropriate database connection string and that `prisma/schema.prisma` matches the intended database schema.

Generate the Prisma Client:

```bash
npx prisma generate
```

For a fresh development database with properly configured migrations, apply them using:

```bash
npx prisma migrate dev
```

If you are setting up an existing database, inspect its schema and migration history before applying migrations. Do not reset a database containing data you need to preserve.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Models

TripSplit uses the following core entities:

### Group

Represents a trip or shared-expense group.

- Group name
- Unique group code
- Hashed group password
- Members and expenses
- Creation and update timestamps

### Member

Represents a participant in a group.

- Member ID
- Display name
- Group association
- Expense payments and shares

Member names are intended to be unique within each group, allowing returning members to be matched to their existing membership.

### Expense

Represents a shared expense.

- Description
- Amount stored as an integer
- Group association
- Payer
- Expense date
- Creation and update timestamps

### ExpenseShare

Represents an individual member's share of an expense.

- Expense association
- Member association
- Share amount stored as an integer

## Authentication and Rejoining

Group passwords are hashed using bcrypt before storage.

When a member joins a group, the application creates a session token and stores it in an HTTP-only cookie named `trip_session`.

The intended rejoining flow uses the group code, group password, and member name to restore an existing member's session instead of creating a duplicate membership.

**Security note:** A shared group password and member name do not uniquely prove a person's identity. Anyone who knows those credentials may be able to impersonate another member. Stronger individual verification may be needed for groups requiring stronger identity protection.

## Expense and Settlement Logic

Expenses are recorded in integer units of the smallest currency denomination to avoid floating-point storage errors. For INR, this means storing amounts in paise.

Expenses can be associated with a payer and participating members. The settlement feature calculates balances and proposes transfers to settle shared expenses.

Rounding and remainder allocation should be tested carefully, especially when an expense cannot be divided evenly among participants.

## Security Considerations

- Hash group passwords before storing them.
- Keep session tokens in HTTP-only cookies.
- Validate and sanitize user input on the server.
- Verify that members belong to the relevant group before accessing or modifying its resources.
- Enforce member-name uniqueness at the database level.
- Apply rate limiting to sensitive endpoints.
- Protect expense and settlement APIs against unauthorized access and IDOR/BOLA vulnerabilities.
- Keep secrets in environment variables.
- Use HTTPS in production.

## Development Commands

```bash
npm run dev
npm run build
npm run start
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

Run `npm run build` before deployment to catch compilation and type errors.

## Future Improvements

Potential improvements include:

- More robust member recovery and identity verification
- Improved expense rounding and remainder handling
- Stronger API authorization and rate limiting
- Expense editing and deletion
- Group member management
- Better settlement summaries
- Automated tests for expense splitting and authentication

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run the build and relevant tests.
4. Review security implications for API and database changes.
5. Submit a pull request with a clear description.

---

**TripSplit — Spend together. Settle fairly.**