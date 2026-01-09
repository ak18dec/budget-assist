# Theme System

## Overview

The theme system provides a centralized, consistent design language across the entire application. It enables easy color customization and maintains a single source of truth for all design tokens.

## Files

### `colors.js`

The main theme configuration file that exports:

- **Color Palette**: Background, text, accent, status, brand, and semantic colors
- **Spacing & Borders**: Radius and border values
- **Shadows**: Drop shadows and inset shadows
- **Typography**: Font family and sizing scale
- **Breakpoints**: Responsive design breakpoints

## Usage

### Import in Components

```javascript
import { colors } from '../theme/colors'
```

### Use Colors

```javascript
const elementStyle = {
  backgroundColor: colors.bg.card,
  color: colors.text.primary,
  boxShadow: shadows.default,
  borderRadius: spacing.radius
}
```

### Use in CSS

```css
/* Reference CSS variables defined in App.css */
.element {
  background: var(--bg);
  color: var(--primary-text);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
}
```

## Color Palette Reference

### Primary Colors
- **Brand Primary**: `#3b82f6` (Blue)
- **Brand Dark**: `#2563eb` (Darker Blue)
- **Brand Light**: `#dbeeff` (Light Blue)

### Status Colors
- **Success**: `#059669` (Green)
- **Danger**: `#dc2626` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Info**: `#2563eb` (Blue)

### Backgrounds
- **Primary**: `#f6f8fb`
- **Card**: `#ffffff`
- **Hover**: `rgba(15,23,42,0.02)`

### Text
- **Primary**: `#0f172a`
- **Muted**: `#6b7280`

## Customization

### Global Color Change

1. Edit `theme/colors.js`:
```javascript
export const colors = {
  brand: {
    primary: '#new-color',
    primaryDark: '#darker-shade',
    primaryLight: '#lighter-shade'
  },
  // ... other colors
}
```

2. Update CSS variables in `App.css`:
```css
:root {
  --brand-primary: #new-color;
  --brand-primary-dark: #darker-shade;
  --brand-primary-light: #lighter-shade;
}
```

3. All components using the color tokens automatically update

### Adding New Colors

1. Add to `colors.js`:
```javascript
colors.custom = {
  primary: '#ffffff',
  secondary: '#f0f0f0'
}
```

2. Add CSS variable to `App.css`:
```css
:root {
  --custom-primary: #ffffff;
  --custom-secondary: #f0f0f0;
}
```

3. Use in components:
```css
.element {
  background: var(--custom-primary);
}
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `12px` | Cards, modals |
| `--radius-sm` | `8px` | Buttons, inputs |
| `--radius-md` | `10px` | Smaller elements |
| `--shadow` | `0 6px 18px rgba(12,15,22,0.06)` | Default shadow |
| `--shadow-light` | `0 2px 8px rgba(12,15,22,0.04)` | Subtle shadow |
| `--font-family` | Inter, system fonts | All text |

## Best Practices

1. **Always use theme values** - Don't hardcode colors
2. **Prefer CSS variables** - Use them in stylesheets
3. **Update centrally** - Change theme once, affects everywhere
4. **Maintain consistency** - Follow the established color palette
5. **Document custom colors** - Add to this file if creating new colors

## Examples

### Change Primary Brand Color to Purple

```javascript
// colors.js
colors.brand = {
  primary: '#a855f7',      // purple-500
  primaryDark: '#9333ea',  // purple-600
  primaryLight: '#f3e8ff'  // purple-100
}
```

Update CSS:
```css
/* App.css */
:root {
  --brand-primary: #a855f7;
  --brand-primary-dark: #9333ea;
  --brand-primary-light: #f3e8ff;
}
```

### Use Theme in Component

```jsx
import { colors, shadows } from '../theme/colors'

function MyCard() {
  return (
    <div style={{
      background: colors.bg.card,
      boxShadow: shadows.default,
      padding: '16px',
      borderRadius: '12px'
    }}>
      Content
    </div>
  )
}
```

### Use Theme in CSS

```css
.card {
  background: var(--card);
  color: var(--primary-text);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}
```
