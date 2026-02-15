# Technical Architecture & Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                              │
│                    (Web Browser - Any OS)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL CDN (Global)                         │
│                   - Edge Network                                 │
│                   - Auto-scaling                                 │
│                   - HTTPS/SSL                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│  FRONTEND (Vercel)   │           │   BACKEND (Vercel)   │
│  portfolio-pilot     │◄─────────►│   API Routes         │
│                      │   REST    │                      │
│  - Next.js 14        │   API     │  - Next.js API       │
│  - React Components  │           │  - Serverless        │
│  - Tailwind CSS      │           │  - Node.js           │
│  - TypeScript        │           │                      │
└──────────────────────┘           └──────────┬───────────┘
                                              │
                                              │ Supabase JS SDK
                                              ▼
                                   ┌─────────────────────────┐
                                   │   SUPABASE (Cloud)      │
                                   │                         │
                                   │  ┌──────────────────┐   │
                                   │  │   PostgreSQL     │   │
                                   │  │   - profiles     │   │
                                   │  │   - achievements │   │
                                   │  └──────────────────┘   │
                                   │                         │
                                   │  ┌──────────────────┐   │
                                   │  │   Supabase Auth  │   │
                                   │  │   - JWT tokens   │   │
                                   │  │   - Sessions     │   │
                                   │  └──────────────────┘   │
                                   │                         │
                                   │  ┌──────────────────┐   │
                                   │  │  Storage Bucket  │   │
                                   │  │  - Certificates  │   │
                                   │  │  - Photos        │   │
                                   │  └──────────────────┘   │
                                   └─────────────────────────┘
```


## User Flow Diagrams

### 1. Registration Flow

```
START
  │
  ▼
┌─────────────────┐
│ User visits     │
│ /register       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Fill registration form: │
│ - Name                  │
│ - Email                 │
│ - Username              │
│ - School                │
│ - Password              │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐
│ Submit form          │
└────────┬─────────────┘
         │
         ▼
┌───────────────────────────┐      ┌─────────────────┐
│ Supabase.auth.signUp()   │─────►│  Create auth    │
└────────┬──────────────────┘      │  user account   │
         │                         └─────────────────┘
         ▼
┌───────────────────────────┐      ┌─────────────────┐
│ Insert into profiles      │─────►│  Store profile  │
│ table with user.id        │      │  data in DB     │
└────────┬──────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ /dashboard      │
└─────────────────┘
  │
  ▼
END
```


### 2. Add Achievement Flow

```
START (User on Dashboard)
  │
  ▼
┌─────────────────┐
│ Click "Add      │
│ Achievement"    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Fill form:              │
│ - Category (Award/      │
│   Activity)             │
│ - Type                  │
│ - Title                 │
│ - Description           │
│ - Date                  │
│ - Upload certificate    │
│   (optional)            │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────┐      NO
│ Certificate file?    │──────────┐
└────────┬─────────────┘          │
         │ YES                    │
         ▼                        │
┌──────────────────────┐          │
│ POST /api/upload     │          │
│ - Upload to Storage  │          │
│ - Get file_url       │          │
└────────┬─────────────┘          │
         │                        │
         ▼                        ▼
┌────────────────────────────────────┐
│ POST /api/achievements             │
│ - Send title, description, etc     │
│ - Include file_url if exists       │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ INSERT into achievements table     │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Update UI       │
│ Show success    │
│ message         │
└─────────────────┘
  │
  ▼
END
```


### 3. View Public Profile Flow

```
START
  │
  ▼
┌─────────────────────────┐
│ User visits             │
│ /profile/[username]     │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────┐
│ Fetch profile by username  │
│ SELECT * FROM profiles     │
│ WHERE username = ?         │
└────────┬───────────────────┘
         │
         ▼
┌──────────────┐      NO    ┌─────────────────┐
│ Profile      │───────────►│ Show 404 page   │
│ exists?      │            └─────────────────┘
└────────┬─────┘                    │
         │ YES                      ▼
         ▼                         END
┌──────────────┐      NO    ┌─────────────────┐
│ is_public    │───────────►│ Show "Private   │
│ = true?      │            │ Profile" message│
└────────┬─────┘            └─────────────────┘
         │ YES                      │
         ▼                          ▼
┌───────────────────────────┐     END
│ Fetch achievements        │
│ SELECT * FROM             │
│ achievements              │
│ WHERE user_id = ?         │
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│ Render profile page:      │
│ - Name, school, region    │
│ - About Me                │
│ - GPA, SAT, IELTS, TOEFL  │
│ - Awards (table)          │
│ - Activities (table)      │
│ - Download PDF button     │
└─────────────────┘
  │
  ▼
END
```


### 4. PDF Export Flow

```
START (User on public profile)
  │
  ▼
┌─────────────────┐
│ Click "Download │
│ PDF Portfolio"  │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────┐
│ Client-side PDF generation     │
│ using jsPDF library            │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add header:                    │
│ - Name                         │
│ - Username                     │
│ - School • Region              │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add About Me section (if exists)│
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add Academic Metrics:          │
│ - GPA                          │
│ - SAT Score                    │
│ - IELTS                        │
│ - TOEFL                        │
│ - GitHub URL                   │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add Awards table:              │
│ - Title | Type | Date | Desc   │
│ (using jspdf-autotable)        │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add Activities table:          │
│ - Title | Type | Date | Desc   │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Add footer:                    │
│ "Generated by PortfolioPilot"  │
│ Page X of Y                    │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Save file:                     │
│ {username}_portfolio.pdf       │
└─────────────────┘
  │
  ▼
END
```


## Database Entity-Relationship Diagram

```
┌─────────────────────────┐
│      auth.users         │
│    (Supabase Auth)      │
│─────────────────────────│
│ id (UUID) PK            │
│ email                   │
│ encrypted_password      │
│ created_at              │
└────────┬────────────────┘
         │ 1
         │
         │ has profile
         │
         │ 1
         ▼
┌─────────────────────────┐
│       profiles          │
│─────────────────────────│
│ id (UUID) PK, FK        │◄────┐
│ email                   │     │
│ name                    │     │
│ username (UNIQUE)       │     │ 1
│ school                  │     │
│ region                  │     │ has many
│ is_public (BOOLEAN)     │     │
│ gpa (NUMERIC)           │     │ achievements
│ sat_score (INTEGER)     │     │
│ ielts (NUMERIC)         │     │ n
│ toefl (INTEGER)         │     │
│ github_url              │     │
│ about_me (TEXT)         │     │
│ created_at              │     │
│ updated_at              │     │
└─────────────────────────┘     │
                                │
                                │
┌───────────────────────────────┴┐
│        achievements            │
│────────────────────────────────│
│ id (UUID) PK                   │
│ user_id (UUID) FK              │
│ title (TEXT)                   │
│ description (TEXT)             │
│ category (TEXT)                │
│   - 'award' or 'activity'      │
│ type (TEXT)                    │
│   Awards: olympiad,            │
│           competition,         │
│           award_other          │
│   Activities: project,         │
│               research,        │
│               internship,      │
│               volunteering,    │
│               leadership,      │
│               club,            │
│               activity_other   │
│ date (DATE)                    │
│ file_url (TEXT)                │
│   - Supabase Storage URL       │
│ verified (BOOLEAN)             │
│ created_at                     │
│ updated_at                     │
└────────────────────────────────┘
```


## API Request/Response Flow

### Example: Create Achievement

```
┌────────────┐                  ┌────────────┐                  ┌────────────┐
│  Browser   │                  │ Backend API│                  │  Supabase  │
└──────┬─────┘                  └──────┬─────┘                  └──────┬─────┘
       │                               │                               │
       │  POST /api/achievements       │                               │
       │  {                            │                               │
       │    user_id: "uuid",           │                               │
       │    title: "IOI Gold",         │                               │
       │    category: "award",         │                               │
       │    type: "olympiad",          │                               │
       │    date: "2024-09-15"         │                               │
       │  }                            │                               │
       │──────────────────────────────►│                               │
       │                               │                               │
       │                               │  INSERT INTO achievements     │
       │                               │  VALUES (...)                 │
       │                               │──────────────────────────────►│
       │                               │                               │
       │                               │         Success Response      │
       │                               │◄──────────────────────────────│
       │                               │  { id: "new-uuid", ... }      │
       │                               │                               │
       │   200 OK                      │                               │
       │   {                           │                               │
       │     success: true,            │                               │
       │     data: {                   │                               │
       │       id: "new-uuid",         │                               │
       │       user_id: "uuid",        │                               │
       │       title: "IOI Gold",      │                               │
       │       ...                     │                               │
       │     }                         │                               │
       │   }                           │                               │
       │◄──────────────────────────────│                               │
       │                               │                               │
       ▼                               ▼                               ▼
```


## File Upload Flow

```
┌────────────┐         ┌────────────┐         ┌────────────┐
│  Browser   │         │ Backend API│         │  Supabase  │
└──────┬─────┘         └──────┬─────┘         │  Storage   │
       │                      │               └──────┬─────┘
       │                      │                      │
       │ 1. Select file       │                      │
       │    (certificate.jpg) │                      │
       │                      │                      │
       │ 2. POST /api/upload  │                      │
       │    FormData:         │                      │
       │    - file: Blob      │                      │
       │    - userId: "uuid"  │                      │
       │─────────────────────►│                      │
       │                      │                      │
       │                      │ 3. Generate path:    │
       │                      │    {userId}/         │
       │                      │    {timestamp}.jpg   │
       │                      │                      │
       │                      │ 4. Upload to bucket  │
       │                      │    "achievements"    │
       │                      │─────────────────────►│
       │                      │                      │
       │                      │   5. Return public   │
       │                      │      URL             │
       │                      │◄─────────────────────│
       │                      │                      │
       │ 6. Response:         │                      │
       │    {                 │                      │
       │      success: true,  │                      │
       │      data: {         │                      │
       │        url: "https://│                      │
       │        ...storage... │                      │
       │        /file.jpg"    │                      │
       │      }               │                      │
       │    }                 │                      │
       │◄─────────────────────│                      │
       │                      │                      │
       ▼                      ▼                      ▼
```


## Authentication Flow

```
┌────────────┐                  ┌────────────┐
│  Browser   │                  │  Supabase  │
│            │                  │    Auth    │
└──────┬─────┘                  └──────┬─────┘
       │                               │
       │ 1. Register/Login             │
       │    email + password            │
       │──────────────────────────────►│
       │                               │
       │                               │ 2. Validate
       │                               │    credentials
       │                               │
       │   3. JWT Token + Session      │
       │◄──────────────────────────────│
       │                               │
       │ 4. Store session              │
       │    (httpOnly cookie)          │
       │                               │
       │ 5. All subsequent requests    │
       │    include JWT in headers     │
       │──────────────────────────────►│
       │                               │
       │                               │ 6. Verify JWT
       │                               │    Get user_id
       │                               │
       │   7. Authorized response      │
       │◄──────────────────────────────│
       │                               │
       ▼                               ▼
```


## AI Integration Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard / Settings                                 │   │
│  │  - "AI Essay Assistant" button                        │   │
│  │  - "Optimize Profile" button                          │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /api/ai/generate-essay                         │   │
│  │  POST /api/ai/categorize-achievement                 │   │
│  │  POST /api/ai/optimize-profile                       │   │
│  └───────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE LAYER                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │  OpenAI API    │  │  Claude API    │  │  Custom ML   │   │
│  │  GPT-4         │  │  Sonnet 3.5    │  │  Models      │   │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘   │
└───────────┼──────────────────┼─────────────────┼────────────┘
            │                  │                 │
            └──────────────────┴─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Response   │
                    │   to User    │
                    └──────────────┘
```

**AI Integration Points:**

1. **Essay Assistant** - GPT-4/Claude generates personalized statements based on achievements
2. **Auto-categorization** - ML model classifies achievements into correct types
3. **Profile Optimizer** - Analyzes portfolio and suggests improvements
4. **Analytics** - Predicts admission chances, identifies gaps


## Performance & Scalability

### Current Performance

- **Page Load:** <2 seconds (Next.js SSR + Vercel CDN)
- **API Response:** <500ms (Serverless functions)
- **PDF Generation:** <3 seconds (client-side jsPDF)
- **File Upload:** <5 seconds (Supabase Storage)

### Scalability Strategy

```
Traffic Level          Actions
─────────────────────────────────────────────────────────
0-1,000 users          Current setup (sufficient)
                       - Vercel auto-scales
                       - Supabase free tier

1,000-10,000 users     Optimizations:
                       - Enable Vercel Edge caching
                       - Supabase Pro tier
                       - Implement Redis for sessions

10,000+ users          Infrastructure upgrade:
                       - Dedicated database
                       - CDN for static assets
                       - Load balancing
                       - Horizontal scaling
```


## Security Considerations

### Current Implementation

✅ **HTTPS** - All traffic encrypted  
✅ **Password Hashing** - bcrypt via Supabase  
✅ **JWT Tokens** - Secure session management  
✅ **Environment Variables** - Secrets not in code  
✅ **Input Validation** - Client & server-side  

### Production Checklist

⚠️ **Enable RLS** - Row Level Security on database  
⚠️ **Rate Limiting** - Prevent API abuse  
⚠️ **Email Verification** - Confirm user emails  
⚠️ **CORS** - Restrict API access  
⚠️ **Content Security Policy** - XSS protection  
⚠️ **Regular Backups** - Database snapshots  


## Monitoring & Analytics

### Metrics to Track

**User Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Achievement creation rate
- PDF downloads
- Community feed usage

**Performance:**
- Page load times
- API response times
- Error rates
- Uptime percentage

**Business:**
- Free → PRO conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Customer Acquisition Cost (CAC)

**Tools:**
- Vercel Analytics (built-in)
- Supabase Dashboard (DB metrics)
- Google Analytics (user behavior)
- Sentry (error tracking - planned)


This completes the technical architecture documentation.
