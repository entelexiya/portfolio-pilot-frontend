# PortfolioPilot - Project Documentation
**INFOMATRIX-ASIA AI Hackathon 2026**

---

## 📋 Project Information

**Project Name:** PortfolioPilot  
**Category:** AI Hackathon  
**Team:** [Your Team Name]  
**Live Demo:** https://portfolio-pilot-frontend.vercel.app  
**Repository:** [GitHub Link]

---

## 1. Executive Summary

### Problem Statement
Kazakhstan students have exceptional achievements (IOI/IMO medals, research projects, internships) but lack a professional platform to showcase them for top university applications. Current solutions:
- **LinkedIn** - Too corporate, not for high school students
- **Common App** - Plain forms, no portfolio visualization
- **Google Docs/Notion** - Unstructured, unprofessional appearance

### Our Solution
PortfolioPilot is a web platform that enables Kazakhstan high school students to create stunning digital portfolios optimized for applications to MIT, Stanford, Harvard, and other top universities worldwide.

**Key Value Propositions:**
- ✅ Structured portfolio (Awards vs Activities)
- ✅ Professional PDF export for applications
- ✅ Public shareable profiles
- ✅ Community to compare with peers
- ✅ Free to start, premium features for serious applicants

### Target Audience
- **Primary:** High school students in Kazakhstan (NIS, BIL, Miras)
- **Secondary:** International students applying to top universities
- **Geographic:** Initially Almaty, Astana, Turkistan → expanding nationwide

### Market Opportunity
- 🎓 **20,000+** NIS students across Kazakhstan
- 📈 **Growing trend** of international university applications
- 💰 **Freemium model:** $5/month PRO tier = sustainable revenue

---

## 2. Technical Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router) - Modern React framework
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- shadcn/ui - High-quality UI components
- Lucide React - Icon system

**Backend:**
- Next.js API Routes - Serverless backend
- Supabase PostgreSQL - Database
- Supabase Auth - Authentication (email/password)
- Supabase Storage - File uploads (certificates, photos)

**Deployment:**
- Vercel - Frontend & Backend (separate deployments)
- Auto-deployment from GitHub
- Global CDN for fast loading

**External Services:**
- jsPDF - PDF generation for portfolios
- jspdf-autotable - Tables in PDF exports

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (User Device)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vercel CDN    │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Next.js App    │◄────►│  Backend API     │
│  (Frontend UI)  │      │  (API Routes)    │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │    Supabase    │
                         │  - PostgreSQL  │
                         │  - Auth        │
                         │  - Storage     │
                         └────────────────┘
```

### Database Schema

**Table: profiles**
```sql
id              UUID PRIMARY KEY (links to auth.users.id)
email           TEXT
name            TEXT
username        TEXT UNIQUE (for public URLs)
school          TEXT
region          TEXT (Almaty/Astana/Turkistan/etc)
is_public       BOOLEAN DEFAULT true
gpa             NUMERIC(3,2) (0.00 - 4.00)
sat_score       INTEGER (400 - 1600)
ielts           NUMERIC(2,1) (0.0 - 9.0)
toefl           INTEGER (0 - 120)
github_url      TEXT
about_me        TEXT (personal statement, max 2000 chars)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Table: achievements**
```sql
id              UUID PRIMARY KEY
user_id         UUID (references profiles.id)
title           TEXT NOT NULL
description     TEXT
category        TEXT ('award' | 'activity')
type            TEXT (olympiad/competition/project/research/etc)
date            DATE
file_url        TEXT (Supabase Storage URL)
verified        BOOLEAN DEFAULT false
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Storage Bucket: achievements**
- File structure: `{user_id}/{timestamp}.{extension}`
- Supported formats: JPG, PNG, PDF
- Max size: 5MB per file

### API Endpoints

**Base URL:** `https://portfolio-pilot-api.vercel.app`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/achievements?userId={id}` | Get all achievements for user | No |
| POST | `/api/achievements` | Create new achievement | Yes |
| GET | `/api/achievements/[id]` | Get single achievement | No |
| PATCH | `/api/achievements/[id]` | Update achievement | Yes |
| DELETE | `/api/achievements/[id]` | Delete achievement | Yes |
| POST | `/api/upload` | Upload certificate file | Yes |
| DELETE | `/api/upload?path={path}` | Delete uploaded file | Yes |
| GET | `/api/profile/[id]` | Get public profile + stats | No |

---

## 3. CRUDL Implementation

As required by INFOMATRIX-ASIA, our project implements full CRUDL operations:

### ✅ CREATE
1. **User Registration** (`/register`)
   - Creates profile in `profiles` table
   - Creates auth account in Supabase Auth
   - Validates unique username

2. **Add Achievement** (`/dashboard`)
   - Form with category, type, title, description, date
   - File upload to Supabase Storage
   - INSERT into `achievements` table

3. **Upload Certificate**
   - POST to `/api/upload` with multipart/form-data
   - Stores in Supabase Storage bucket
   - Returns public URL

### ✅ READ
1. **View Dashboard** (`/dashboard`)
   - GET `/api/achievements?userId={id}`
   - Displays Awards and Activities in separate tabs
   - Shows achievement count statistics

2. **Public Profile** (`/profile/[username]`)
   - Fetches profile by username
   - Retrieves all achievements
   - Displays academic metrics (GPA, SAT, IELTS, TOEFL)

3. **Community Feed** (`/community`)
   - Lists all public profiles
   - Shows achievement statistics
   - Supports search and filtering

4. **Settings Page** (`/settings`)
   - Reads current profile data
   - Displays in editable form

### ✅ UPDATE
1. **Edit Profile** (`/settings`)
   - Update name, school, region
   - Modify GPA, test scores
   - Edit About Me statement
   - PATCH request to Supabase

2. **Edit Achievement**
   - Click edit button on achievement card
   - Modify title, description, type, date
   - PATCH `/api/achievements/[id]`

3. **Toggle Profile Privacy**
   - Switch between public/private
   - Updates `is_public` field
   - Controls visibility in Community

### ✅ DELETE
1. **Delete Achievement**
   - Confirmation dialog
   - DELETE `/api/achievements/[id]`
   - Removes from database
   - Optionally deletes associated file

2. **Delete Certificate File**
   - DELETE `/api/upload?path={path}`
   - Removes from Supabase Storage

### ✅ LIST
1. **Dashboard Achievements List**
   - Filtered by category (Awards/Activities)
   - Sorted by date (newest first)
   - Paginated display

2. **Community Profiles List**
   - All public profiles
   - Filter by region
   - Search by name/school/username
   - Sort by recent or achievement count

---

## 4. Core Features

### 4.1 User Authentication
- **Email/Password** registration and login
- **Session management** via Supabase Auth
- **Secure** password hashing (bcrypt)
- **Logout** functionality

### 4.2 Portfolio Management

**Awards Section:**
- 🏆 Olympiads (IOI, IMO, IPhO, IChO, IBO)
- 🥇 Competitions (ISEF, Hackathons, Contests)
- ⭐ Other Awards (Scholarships, Honors)

**Activities Section:**
- 💻 Projects (Web apps, mobile apps, open source)
- 🔬 Research (Published papers, lab work)
- 💼 Internships (Companies, labs, startups)
- 👥 Volunteering (Community service)
- 👑 Leadership (Club president, team captain)
- 🎯 Clubs (Debate, robotics, math club)
- 📌 Other Activities

### 4.3 Certificate Management
- **Upload** JPG, PNG, or PDF certificates
- **Preview** before upload
- **Link** to achievements
- **Secure storage** in Supabase
- **Download** original files

### 4.4 Public Profiles
- **Unique URL:** `/profile/[username]`
- **Shareable** with universities, recruiters
- **Privacy toggle:** Public or Private
- **Beautiful design** with gradient themes
- **Responsive** for all devices

### 4.5 PDF Export
- **Professional layout** with sections
- **Includes:**
  - Name, school, region
  - About Me statement
  - Academic metrics (GPA, SAT, IELTS, TOEFL)
  - Awards table (title, type, date, description)
  - Activities table
  - GitHub profile link
- **Download** as `{username}_portfolio.pdf`
- **Ready** for Common App, university applications

### 4.6 Community Feed
- **Browse** all public portfolios
- **Search** by name, school, username
- **Filter** by region (Almaty, Astana, Turkistan, etc)
- **Sort** by recent or achievement count
- **Compare** yourself with peers
- **Click** to view full profiles

### 4.7 Personal Statement
- **About Me** field (up to 2000 characters)
- **Rich text** for expressing passions, goals, interests
- **Displayed** on public profile
- **Included** in PDF export
- **Essential** for university applications

---

## 5. AI Integration Readiness

As per INFOMATRIX-ASIA requirements, AI features will be integrated during the Final stage. Our platform is architected to support the following AI capabilities:

### 5.1 Planned AI Features

**1. AI Essay Writing Assistant** (High Priority)
- **Location:** Settings page, About Me section
- **Functionality:**
  - Analyzes user's achievements
  - Suggests compelling narrative structures
  - Generates personalized statement drafts
  - Refines grammar and tone
- **Technology:** GPT-4 API / Claude API
- **User Flow:**
  1. User clicks "AI Assistant" button
  2. AI analyzes profile data
  3. Generates 3-5 essay drafts
  4. User selects and edits preferred version

**2. AI Achievement Categorization** (Medium Priority)
- **Location:** Dashboard, Add Achievement form
- **Functionality:**
  - Auto-detects achievement type from title
  - Suggests category (Award vs Activity)
  - Recommends subcategory (olympiad/competition/project)
- **Technology:** Text classification model
- **Example:**
  - Input: "Gold Medal at IOI 2024"
  - AI Output: category=award, type=olympiad

**3. AI Resume Optimizer** (Medium Priority)
- **Location:** PDF export feature
- **Functionality:**
  - Analyzes portfolio content
  - Suggests improvements (missing sections, weak descriptions)
  - Compares to successful MIT/Stanford profiles
  - Recommends strategic additions
- **Technology:** LLM with retrieval-augmented generation

**4. AI Profile Analytics** (Low Priority)
- **Location:** Dashboard analytics section
- **Functionality:**
  - Predicts admission chances to universities
  - Identifies gaps in profile
  - Recommends next achievements to pursue
- **Technology:** Machine learning model trained on admission data

**5. AI Chatbot Mentor** (Low Priority)
- **Location:** Floating chat widget
- **Functionality:**
  - Answers questions about college applications
  - Provides guidance on portfolio building
  - Suggests timeline for achievements
- **Technology:** RAG-based chatbot

### 5.2 Technical Architecture for AI

```javascript
// Example: AI Essay Assistant implementation
const generateEssay = async (profileData) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert college admissions essay writer.'
        },
        {
          role: 'user',
          content: `Generate a compelling personal statement for a student with these achievements: ${JSON.stringify(profileData.achievements)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

### 5.3 Data Requirements for AI
- User achievements (titles, descriptions, types)
- Academic metrics (GPA, test scores)
- School and region information
- Existing About Me text (for refinement)
- Success Stories dataset (for comparison)

---

## 6. User Interface & Design

### 6.1 Design System

**Color Palette:**
- Primary: Indigo (#4F46E5) → Purple (#9333EA) → Pink (#EC4899) gradient
- Awards: Orange (#F97316) / Yellow (#EAB308)
- Activities: Indigo (#4F46E5) / Purple (#9333EA)
- Success: Emerald (#10B981)
- Danger: Rose (#E11D48)

**Typography:**
- Font Family: Inter (400, 500, 600, 700, 900)
- Headings: font-black (900 weight)
- Body: Regular (400 weight)
- Gradient Text: bg-gradient + bg-clip-text + text-transparent

**Components:**
- Rounded corners: rounded-2xl, rounded-3xl
- Shadows: shadow-xl, shadow-2xl
- Animations: hover:-translate-y-1, transition-all
- Cards: backdrop-blur-xl for glass effect

### 6.2 Page Structure

1. **Landing Page** (`/`)
   - Hero section with CTA
   - Feature showcase
   - Pricing table (Free vs PRO)
   - How it works (3 steps)
   - Social proof (universities)
   - Final CTA

2. **Dashboard** (`/dashboard`)
   - Profile visibility toggle
   - Public profile link
   - Add Achievement button
   - Tabs: Activities vs Awards
   - Achievement cards with edit/delete
   - Empty states for new users

3. **Settings** (`/settings`)
   - Read-only: Email, Username
   - Editable: Name, School, Region
   - Academic Metrics: GPA, SAT, IELTS, TOEFL
   - About Me textarea (2000 chars)
   - GitHub URL
   - Save button

4. **Public Profile** (`/profile/[username]`)
   - Header: Name, school, region, avatar
   - About Me section
   - Statistics: Awards count, Activities count
   - Academic metrics display
   - GitHub link
   - Download PDF button
   - Tabs: Activities vs Awards
   - Achievement cards

5. **Community** (`/community`)
   - Search bar
   - Region filter dropdown
   - Sort buttons (Recent / Most Achievements)
   - Profile cards grid
   - Click to view full profile

### 6.3 Responsive Design
- **Mobile:** Single column, hamburger menu
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid, full navbar
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 7. Business Model & Monetization

### 7.1 Freemium Pricing

**FREE Plan** ($0/forever)
- ✅ Up to 20 achievements
- ✅ Public portfolio profile
- ✅ PDF export (with "Made with PortfolioPilot" watermark)
- ✅ Community access
- ✅ Certificate uploads
- ✅ Basic analytics

**PRO Plan** ($5/month or $50/year)
- ✨ Unlimited achievements
- ✨ PDF without watermark
- ✨ 5 custom themes/templates
- ✨ Profile analytics (views, engagement)
- ✨ Priority in Success Stories
- ✨ AI essay writing assistant
- ✨ Email support

**Target:** 5% conversion rate
- 1,000 free users → 50 PRO users
- 50 × $5/month = **$250/month** = **$3,000/year**

### 7.2 Future Revenue Streams

1. **B2B School Licenses** ($500-1,000/year)
   - Entire school gets PRO features
   - Teacher dashboard to track student progress
   - Branded portfolios with school logo

2. **Premium Content** ($15-25 one-time)
   - Access to full Success Stories essays
   - "Admission Playbook" guides
   - Expert portfolio reviews

3. **Affiliate Partnerships**
   - SAT/IELTS prep courses (10-20% commission)
   - Education agencies referral fees
   - University application services

### 7.3 Market Size
- **Kazakhstan:** 20,000 NIS students + 50,000 other high schools
- **International:** Expanding to Central Asia, then globally
- **TAM (Total Addressable Market):** 500,000+ students applying to top universities annually

---

## 8. Competitive Analysis

| Feature | PortfolioPilot | LinkedIn | Common App | Notion |
|---------|----------------|----------|------------|--------|
| Student-focused | ✅ Yes | ❌ Corporate | ⚠️ Limited | ❌ Generic |
| Structured Awards/Activities | ✅ Yes | ❌ No | ⚠️ Forms only | ❌ Unstructured |
| PDF Export | ✅ Yes | ⚠️ Basic | ❌ No | ⚠️ Messy |
| Public Profile | ✅ Beautiful | ✅ Yes | ❌ No | ⚠️ Complex |
| Community Feed | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| AI Features | ✅ Planned | ⚠️ Basic | ❌ No | ⚠️ Limited |
| Price | ✅ Free/$5 | ✅ Free | ✅ Free | ✅ Free/$8 |
| Kazakhstan Focus | ✅ Yes | ❌ No | ❌ No | ❌ No |

**Our Competitive Advantages:**
1. 🎯 Purpose-built for college applications
2. 🇰🇿 Tailored for Kazakhstan students
3. 📄 Professional PDF export in one click
4. 🤝 Community to compare with peers
5. 🚀 Fast setup (2 minutes vs hours)

---

## 9. Implementation Timeline

### Phase 1: MVP (Completed) ✅
- User authentication
- Profile creation
- Achievement CRUD
- Public profiles
- PDF export
- Basic design

### Phase 2: Enhancement (Completed) ✅
- Community feed
- Search & filters
- About Me field
- Improved landing page
- Premium pricing display

### Phase 3: AI Integration (Final Stage) 🔄
- AI essay assistant
- Achievement categorization
- Profile analytics
- Resume optimizer

### Phase 4: Scale (Post-Hackathon) 📅
- Payment integration (Stripe)
- Email verification
- Row Level Security (RLS)
- Admin dashboard
- Marketing campaign

---

## 10. Security & Privacy

### 10.1 Current Implementation
- ✅ Supabase Auth with bcrypt password hashing
- ✅ HTTPS encryption (Vercel)
- ✅ Environment variables for secrets
- ✅ Public/Private profile toggle
- ⚠️ RLS (Row Level Security) disabled for development

### 10.2 Production Requirements
1. **Enable RLS** on all tables
2. **JWT tokens** for API authentication
3. **Rate limiting** on API endpoints
4. **Email verification** for new accounts
5. **GDPR compliance:**
   - Privacy Policy page
   - Terms of Service page
   - User consent for data collection
   - "Delete my data" button

### 10.3 Data Protection
- Profile data: stored in Supabase (ISO 27001 certified)
- Files: Supabase Storage with access controls
- Passwords: hashed with bcrypt (never stored in plain text)
- Sessions: secure httpOnly cookies

---

## 11. Testing & Quality Assurance

### 11.1 Manual Testing Checklist

**Authentication:**
- ✅ Registration with valid data
- ✅ Registration with duplicate username (error)
- ✅ Login with correct credentials
- ✅ Login with wrong password (error)
- ✅ Logout functionality
- ✅ Session persistence

**CRUD Operations:**
- ✅ Create achievement (Award)
- ✅ Create achievement (Activity)
- ✅ Upload certificate file
- ✅ Edit achievement
- ✅ Delete achievement
- ✅ List achievements (Dashboard)
- ✅ Read public profile

**UI/UX:**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Form validation
- ✅ Loading states
- ✅ Error messages
- ✅ Empty states
- ✅ Success notifications

**Features:**
- ✅ PDF export works
- ✅ Public profile accessible
- ✅ Community search works
- ✅ Region filter works
- ✅ Sort by recent/achievements
- ✅ Profile privacy toggle

### 11.2 Browser Compatibility
- ✅ Chrome 120+
- ✅ Safari 17+
- ✅ Firefox 121+
- ✅ Edge 120+

### 11.3 Performance Metrics
- Page load: <2 seconds
- API response: <500ms
- PDF generation: <3 seconds
- Image upload: <5 seconds

---

## 12. Deployment & DevOps

### 12.1 Deployment Process

**Frontend Deployment:**
1. Push code to GitHub
2. Vercel auto-deploys from main branch
3. Preview URLs for pull requests
4. Production: https://portfolio-pilot-frontend.vercel.app

**Backend Deployment:**
1. Separate repository for API
2. Vercel deployment
3. Production: https://portfolio-pilot-api.vercel.app

**Database:**
- Hosted on Supabase cloud
- Automatic backups
- Read replicas for scaling

### 12.2 Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://portfolio-pilot-api.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://pksgxrjdqcmdyeqdjdhe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Backend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://pksgxrjdqcmdyeqdjdhe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 12.3 Monitoring
- Vercel Analytics: Page views, performance
- Supabase Dashboard: Database metrics
- Error tracking: Console logs (production: Sentry planned)

---

## 13. Future Roadmap

### Q1 2026 (Post-Hackathon)
- ✨ Payment integration (Stripe)
- ✨ Email verification
- ✨ Success Stories page with real profiles
- ✨ Admin dashboard for moderation
- ✨ Profile verification badges

### Q2 2026
- 🤖 AI features (essay assistant, optimizer)
- 📊 Advanced analytics
- 🎨 Custom themes (5 designs for PRO)
- 📧 Email notifications
- 🔗 Social media sharing

### Q3 2026
- 🏫 School partnerships (NIS, BIL, Miras)
- 🌍 Expand to Central Asia
- 📱 Mobile apps (iOS, Android)
- 🎓 University integrations
- 💬 Messaging between students

### Q4 2026
- 🤝 B2B school licenses
- 📈 Marketing campaign
- 🏆 Feature in success stories
- 💰 Revenue milestone: $10k MRR
- 🚀 Series A fundraising

---

## 14. Team & Contact

**Team Members:**
- [Your Name] - Full Stack Developer
- [Team Member 2] - [Role]
- [Team Member 3] - [Role]

**Contact Information:**
- Email: [team@portfoliopilot.com]
- Website: https://portfolio-pilot-frontend.vercel.app
- GitHub: [Repository URL]

**Mentor/Advisor:**
- [Mentor Name] - [Affiliation]

---

## 15. Conclusion

PortfolioPilot addresses a critical need for Kazakhstan students applying to top universities worldwide. By providing a structured, beautiful, and easy-to-use platform for showcasing achievements, we empower students to present their best selves to admissions committees.

**Key Achievements:**
- ✅ Fully functional CRUDL implementation
- ✅ Modern, responsive UI/UX
- ✅ Scalable architecture
- ✅ Clear path to monetization
- ✅ Ready for AI integration in Final stage

**Impact:**
- 🎓 Helping Kazakhstan students get into MIT, Stanford, Harvard
- 🌍 Expanding educational opportunities
- 💡 Setting new standard for student portfolios
- 📈 Sustainable business model

**Next Steps:**
1. Integrate AI features during Final stage (as assigned)
2. Launch beta with NIS students
3. Collect user feedback and iterate
4. Scale to all Kazakhstan high schools
5. Expand internationally

We are excited to demonstrate PortfolioPilot at INFOMATRIX-ASIA and showcase how technology can transform the college application process for students worldwide.

---

**Thank you for your consideration!**

*PortfolioPilot Team*  
*February 2026*
