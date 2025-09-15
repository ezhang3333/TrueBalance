# TrueBalance Design Guidelines

## Design Approach
**Selected Approach**: Reference-Based (Productivity Category)
**Primary References**: Mint, YNAB, Personal Capital - clean, trustworthy financial interfaces
**Design Philosophy**: Professional, secure, and data-focused with emphasis on clarity and trust

## Core Design Elements

### A. Color Palette
**Primary Colors (Dark Mode)**:
- Background: 220 15% 8% (deep navy-gray)
- Surface: 220 12% 12% (elevated surfaces)
- Primary: 210 100% 60% (trustworthy blue)
- Text Primary: 0 0% 95% (near white)
- Text Secondary: 0 0% 70% (muted gray)

**Primary Colors (Light Mode)**:
- Background: 0 0% 98% (clean white)
- Surface: 220 20% 96% (subtle gray)
- Primary: 210 100% 50% (professional blue)
- Text Primary: 220 15% 15% (dark gray)
- Text Secondary: 220 10% 45% (medium gray)

**Accent Colors**:
- Success: 142 76% 36% (income green)
- Warning: 38 92% 50% (alert orange)
- Expense: 0 84% 60% (expense red)

### B. Typography
**Font Families**: Inter (primary), JetBrains Mono (numbers/data)
**Hierarchy**:
- Headings: Inter 600-700 (24px-32px)
- Body: Inter 400 (16px)
- Data/Numbers: JetBrains Mono 500 (14px-16px)
- Captions: Inter 400 (14px)

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16
**Grid**: 12-column responsive grid with consistent gutters
**Container**: Max-width of 1200px with responsive padding

### D. Component Library

**Dashboard Components**:
- Account summary cards with balance displays
- Transaction lists with categorization badges
- Monthly spending charts (bar/line charts)
- Category breakdown pie charts
- Quick filter chips for date ranges and categories

**Navigation**:
- Sidebar navigation (collapsible on mobile)
- Top header with user menu and notifications
- Breadcrumb navigation for deep sections

**Forms & Inputs**:
- Clean input fields with subtle borders
- Category selection dropdowns with color coding
- Date range pickers for filtering
- Search bars with autocomplete

**Data Displays**:
- Transaction tables with sortable columns
- Balance cards with trend indicators
- Category spending progress bars
- Monthly comparison charts

**Authentication**:
- Centered login/register forms
- Minimal, professional styling
- Clear error states and validation

### E. Financial Data Visualization
- Use consistent color coding for expense categories
- Implement subtle animations for chart transitions
- Ensure accessibility with high contrast ratios
- Display monetary values with proper formatting ($1,234.56)

## Key Design Principles
1. **Trust & Security**: Clean, professional appearance that instills confidence
2. **Data Clarity**: Clear hierarchy and typography for financial information
3. **Responsive Design**: Seamless experience across desktop, tablet, and mobile
4. **Accessibility**: WCAG 2.1 AA compliance with proper contrast ratios
5. **Performance**: Optimized for fast loading of financial data

## Images
No hero images required. Focus on clean iconography using Heroicons for:
- Category icons (food, transportation, entertainment, etc.)
- Account type indicators (checking, savings, credit)
- Navigation and action icons
- Status indicators for transactions

The design emphasizes data visualization over decorative imagery, maintaining a professional financial application aesthetic.