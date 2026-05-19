# Project Requirements Document: Smart Leads Dashboard

## 1. Executive Summary
Smart Leads Dashboard is a premium, high-converting MERN-stack SaaS platform designed for professional sales teams to manage, track, and analyze lead pipelines with high-end visual hierarchy and data readability.

## 2. Product Vision & Goals
- **Core Value Proposition:** Provide a "single pane of glass" for sales operations.
- **Primary Goals:**
    - High data scannability via semantic status mapping.
    - Seamless transition between high-level analytics and granular lead details.
    - Professional, corporate aesthetic supporting both Light and Dark modes.

## 3. Target Audience
- Sales Managers (monitoring team performance).
- Sales Representatives (managing daily lead interactions).
- Revenue Operations (analyzing conversion data).

## 4. Feature Requirements

### 4.1. Leads Management
- **Centralized Lead Grid:** A spacious data matrix for Name, Email, Status (New, Contacted, Qualified, Lost), Source, and Creation Date.
- **Lead Detail View:** Comprehensive profile view including contact info, company details, activity timeline, and quick actions (Message, Archive, Move to Pipeline).
- **Filtering & Search:** Global search with multi-select filters for Status, Source, and Date ranges.

### 4.2. Analytics & Reporting
- **Performance Overview:** Real-time tracking of Total Leads, Conversion Rate, and Revenue Growth.
- **Visualizations:** Lead volume over time (Bar charts), Lead source distribution (Donut/Pie charts), and Pipeline stage funnels.
- **Performance Insights:** AI-driven or rule-based insights (e.g., "Summer Growth campaign outperforming projections").

### 4.3. Pipeline Operations
- **Status Transitions:** Ability to move leads through custom pipeline stages.
- **Action Triggers:** Export to CSV, bulk updates, and individual lead messaging.

## 5. Design & User Experience

### 5.1. Visual Identity (Precision Metric)
- **Typography:** Inter/Geist sans-serif stack for readability.
- **Grid System:** Strict 4px/8px baseline grid (Tailwind spacing scale).
- **Theming:**
    - **Light Mode:** Slate-50 background, White surfaces, Indigo-600 accents.
    - **Dark Mode:** Midnight Slate (#0B0F19) background, Slate-800 surfaces, Indigo-500 accents.

### 5.2. Semantic System
- **Status Badges:** 
    - New: Blue
    - Contacted: Amber
    - Qualified: Emerald
    - Lost: Rose
- **Source Badges:** Website (Teal), Instagram (Purple), Referral (Cyan).

## 6. Technical Specifications (Proposed)
- **Frontend:** React.js, Tailwind CSS, Framer Motion (for transitions).
- **Backend:** Node.js, Express.
- **Database:** MongoDB.
- **State Management:** TanStack Query or Redux Toolkit.

## 7. Roadmap & Future Scope
- **Phase 1 (Current):** Dashboard, Leads Grid, Lead Details, Analytics.
- **Phase 2:** Pipeline Kanban view, Team Settings, Integration with CRM/Social.
- **Phase 3:** Automated lead scoring and email sequence automation.