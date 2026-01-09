# Frontend Architecture & Design System

## Overview

The frontend has been refactored to follow modern best practices with a centralized design system, modular components, and organized styling architecture.

---

## Project Structure

```
frontend/src/
├── App.jsx                    # Main app component
├── App.css                    # Global styles & CSS variables
├── main.jsx                   # Entry point
├── theme/                     # Design system (NEW)
│   └── colors.js             # Centralized color palette & design tokens
├── components/
│   ├── Sidebar.jsx
│   ├── Sidebar.css            # Component-specific styles (NEW)
│   ├── ChatPanel.jsx
│   ├── ChatPanel.css
│   ├── Dashboard.jsx
│   ├── Dashboard.css
│   ├── Topbar.jsx
│   ├── Topbar.css
│   ├── SummaryCards.jsx
│   ├── SummaryCards.css
│   ├── TransactionForm.jsx
│   ├── TransactionForm.css
│   ├── TransactionList.jsx
│   ├── TransactionList.css
│   ├── FinancialChart.jsx
│   ├── FinancialChart.css
│   ├── PieChart.jsx
│   ├── PieChart.css
│   ├── RecentTransactions.jsx
│   ├── RecentTransactions.css
│   ├── SavingsList.jsx
│   ├── SavingsList.css
│   ├── SavingsPie.jsx
│   └── SavingsPie.css
```

---

## Design System

### Color Palette (`theme/colors.js`)

The color palette is centralized in `theme/colors.js` and exports:

#### Background Colors
```javascript
colors.bg.primary      // #f6f8fb - Main background
colors.bg.card         // #ffffff - Card background
colors.bg.hover        // rgba(15,23,42,0.02) - Hover state
colors.bg.hoverLight   // rgba(15,23,42,0.03) - Light hover
```

#### Text Colors
```javascript
colors.text.primary    // #0f172a - Primary text
colors.text.muted      // #6b7280 - Secondary/muted text
```

#### Accent Colors
```javascript
colors.accent.start    // #6EE7B7 - Gradient start
colors.accent.end      // #3B82F6 - Gradient end
```

#### Status Colors
```javascript
colors.status.success  // #059669 - Success/positive
colors.status.danger   // #dc2626 - Error/negative
colors.status.warning  // #f59e0b - Warning
colors.status.info     // #2563eb - Information
```

#### Brand Colors
```javascript
colors.brand.primary       // #3b82f6
colors.brand.primaryDark   // #2563eb
colors.brand.primaryLight  // #dbeeff
```

### CSS Variables (`App.css`)

All colors are also available as CSS variables for easy access in stylesheets:

```css
--bg: #f6f8fb
--card: #ffffff
--muted: #6b7280
--accent-start: #6EE7B7
--accent-end: #3B82F6
--primary-text: #0f172a
--radius: 12px
--shadow: 0 6px 18px rgba(12,15,22,0.06)
```

---

## Styling Architecture

### Global Styles (`App.css`)

Contains:
- CSS variable definitions (`:root`)
- Reset and base styles
- Utility classes (`.card`, `.muted`, `.button`, etc.)
- Layout classes (`.app-container`)
- Responsive design breakpoints
- Accessibility styles (focus states)

**Usage:**
```jsx
// In any component
<div className="card">
  <h3>Title</h3>
  <p className="muted">Description</p>
</div>
```

### Component Styles

Each component has its own CSS file with **component-scoped classes**:

```
ComponentName.jsx      // React component
ComponentName.css      # Component-specific styles
```

**Example:** `Sidebar.jsx` + `Sidebar.css`
- All styles use descriptive class names: `.sidebar`, `.nav-item`, `.brand-row`
- Styles are scoped to avoid conflicts
- Only import the CSS file in its component

---

## How to Use the Design System

### 1. Using Colors in CSS

```css
/* Reference CSS variables */
.my-element {
  background: var(--bg);
  color: var(--primary-text);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
}
```

### 2. Using Colors in JavaScript

```jsx
import { colors } from './theme/colors'

function MyComponent() {
  return (
    <div style={{
      background: colors.bg.card,
      color: colors.text.primary
    }}>
      Content
    </div>
  )
}
```

### 3. Changing Theme Colors

To change the color palette application-wide:

1. Edit `/src/theme/colors.js`
2. Update the color values in the object
3. All components automatically use the new colors

**Example:** Change primary brand color from blue to purple
```javascript
// theme/colors.js
colors.brand.primary = '#a855f7'  // purple-500
colors.brand.primaryDark = '#9333ea'  // purple-600
colors.brand.primaryLight = '#f3e8ff'  // purple-100
```

---

## Component Structure

### Modular & Reusable Components

Each component follows these principles:

1. **Single Responsibility** - One main purpose
2. **Props-Based** - Accepts data via props
3. **Isolated Styles** - Component CSS file only
4. **No Global Dependencies** - Uses shared tokens via CSS variables

### Example Component Structure

```jsx
// ChatPanel.jsx
import React, { useState } from 'react'
import axios from 'axios'
import './ChatPanel.css'  // Import component styles

export default function ChatPanel() {
  const [text, setText] = useState('')
  
  return (
    <div className="chat-panel">
      <h3>Assistant</h3>
      <div className="chat-window">
        {/* content */}
      </div>
      <div className="chat-input-container">
        <input 
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="button">Send</button>
      </div>
    </div>
  )
}
```

```css
/* ChatPanel.css */
.chat-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-window {
  min-height: 240px;
  max-height: 480px;
  overflow: auto;
  padding: 12px;
  background: linear-gradient(
    180deg,
    rgba(250, 250, 255, 0.6),
    rgba(250, 250, 255, 0.9)
  );
  border-radius: var(--radius-sm);
}

.chat-message {
  padding: 8px 10px;
  border-radius: 10px;
  margin: 6px 0;
}
```

---

## CSS Naming Conventions

### Class Naming Pattern

```
.{ComponentName}-{element}-{state}
```

**Examples:**
- `.chat-panel` - Main container
- `.chat-window` - Sub-element
- `.chat-message` - Content element
- `.chat-input` - Form input
- `.chat-message.user` - State variant

### Utility Classes (Global)

Used across components:
- `.card` - Card container
- `.muted` - Muted text
- `.button` - Action button
- `.icon-btn` - Icon button

---

## Color Change Guide

### Scenario 1: Change Primary Brand Color

**File:** `theme/colors.js`

```javascript
colors.brand.primary = '#ec4899'      // pink-500
colors.brand.primaryDark = '#be185d'  // pink-700
colors.brand.primaryLight = '#fce7f3' // pink-100
```

**CSS Variable** in `App.css`:
```css
:root {
  --brand-primary: #ec4899;
  --brand-primary-dark: #be185d;
  --brand-primary-light: #fce7f3;
}
```

### Scenario 2: Change Background Color

**File:** `App.css`

```css
:root {
  --bg: #f9fafb;  /* Change from #f6f8fb */
}
```

### Scenario 3: Add New Color

1. Add to `theme/colors.js`:
```javascript
colors.custom = {
  newColor: '#ffffff'
}
```

2. Add CSS variable to `App.css`:
```css
:root {
  --custom-new: #ffffff;
}
```

3. Use in components:
```css
.my-element {
  background: var(--custom-new);
}
```

---

## Best Practices

### ✅ Do's

- Use CSS variables for colors in stylesheets
- Keep component styles in their own CSS files
- Use semantic class names
- Reuse global utility classes (`.card`, `.button`, `.muted`)
- Import component CSS in the component file

### ❌ Don'ts

- Don't hardcode colors in components
- Don't use inline styles for colors (use CSS variables)
- Don't mix global and component-specific styles
- Don't create duplicate color definitions
- Don't use `!important` flags

---

## Responsive Design

Media queries are defined in `theme/colors.js`:

```javascript
breakpoints: {
  mobile: '640px',
  tablet: '768px',
  desktop: '900px',
}
```

Usage in components:

```css
@media (max-width: 900px) {
  .app-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
}
```

---

## File Organization Summary

| File/Folder | Purpose |
|---|---|
| `App.jsx` | Root component |
| `App.css` | Global styles & CSS variables |
| `theme/colors.js` | Color palette & design tokens |
| `components/*.jsx` | React components |
| `components/*.css` | Component-specific styles |

---

## Quick Reference

### Add a New Component

1. Create `components/MyComponent.jsx`
2. Create `components/MyComponent.css`
3. Import CSS in component: `import './MyComponent.css'`
4. Use CSS variables for colors
5. Add to `App.jsx`

### Update Brand Colors

Edit `App.css` `:root` variables:
```css
--brand-primary: #new-color;
--brand-primary-dark: #darker-shade;
--accent-start: #gradient-start;
--accent-end: #gradient-end;
```

### Change Typography

Add to `theme/colors.js`:
```javascript
typography: {
  fontSize: { /* values */ },
  fontWeight: { /* values */ },
  fontFamily: "new-font-family"
}
```

---

## Future Enhancements

Potential improvements for the design system:

1. **Dark Mode Support** - Add `:root[data-theme="dark"]` variants
2. **Spacing Scale** - Centralize spacing values in `theme/colors.js`
3. **Component Library** - Build reusable component library with Storybook
4. **Animation System** - Define keyframes and transitions in theme
5. **Typography Scale** - Standardize font sizes and weights
