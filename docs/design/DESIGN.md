# Design System Strategy: The Radiant Intelligence

This design system is a high-end, editorial-inspired framework for an AI-powered interface. It moves beyond the clinical "chatbot" aesthetic into a space of "The Digital Concierge." By blending the patriotic vibrancy of the Philippines with a sophisticated, layered white-space strategy, we create an environment that feels authoritative yet warmly accessible.

---

## 1. Creative North Star: "The Luminous Curator"
The goal is to evoke the feeling of a sun-drenched, professional studio. We reject the "boxed-in" layout of traditional SaaS. Instead, we use **Intentional Asymmetry** and **Tonal Depth** to guide the user’s eye. The interface should feel like fine stationery—premium, tactile, and thoughtfully composed. We break the grid by allowing AI-generated content to "float" on elevated glass layers, while secondary controls remain grounded in the surface tiers.

---

## 2. Color & Surface Theory

The palette is rooted in the Filipino flag but interpreted through a luxury lens. We prioritize "Light & Bright" by using high-key neutrals, saving the vibrant primaries for moments of high intent.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. We define boundaries exclusively through:
1.  **Background Shifts:** Moving from `surface` (#f9f9fb) to `surface-container-low` (#f3f3f5).
2.  **Shadow Depth:** Using elevation to imply a boundary.
3.  **Negative Space:** Utilizing the `12` (3rem) or `16` (4rem) spacing tokens to create mental groupings.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass.
*   **Base Layer:** `surface` for the overall application backdrop.
*   **Mid-Ground:** `surface-container` for the main chat feed or content areas.
*   **High-Ground:** `surface-container-lowest` (#ffffff) for active input fields or primary cards. This creates a "pop" against the slightly grayer background without needing a stroke.

### The "Glass & Gradient" Rule
To elevate the AI experience, use **Glassmorphism** for floating sidebars or modal overlays.
*   **Token:** `surface-container-low` at 80% opacity with a `20px` backdrop-blur.
*   **Signature Texture:** Use a subtle linear gradient for Primary CTAs (Royal Blue `primary` to `primary_container`) to add "soul" and dimension.

---

## 3. Typography: The Editorial Voice

We utilize a dual-font pairing to distinguish between "System" and "Content."

*   **Display & Headlines (Plus Jakarta Sans):** This is our "Editorial" voice. Its wider stance and modern apertures feel premium. Use `display-lg` for welcome states with `tight` letter-spacing (-0.02em) to create a signature high-end look.
*   **Body & UI (Inter):** Our "Functional" voice. Inter is used for chat bubbles and labels to ensure maximum legibility at small sizes.

**Hierarchy Tip:** Always skip a weight or size when moving from a headline to a sub-head to create "High-Contrast" scaling. For example, pair a `headline-lg` (Bold) directly with a `body-md` (Regular) for an assertive, clean look.

---

## 4. Elevation & Depth

We avoid the "flat" look by utilizing Tonal Layering.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on top of a `surface-container-high` section. The subtle delta in hex codes creates a natural, sophisticated lift.
*   **Ambient Shadows:** For floating elements (like an AI suggestion toast), use the following:
    *   **Blur:** `24px` to `40px`
    *   **Opacity:** 4% of `on-surface` (#1a1c1d).
    *   **Tint:** The shadow should not be gray; it should be a deep navy-tinted shadow to harmonize with the `primary` blue.
*   **Ghost Border Fallback:** If a border is required for accessibility (e.g., high-contrast mode), use `outline-variant` at 15% opacity. Never use 100% opacity borders.

---

## 5. Components

### The AI Input Field
*   **Base:** `surface-container-lowest` (#ffffff).
*   **Corner Radius:** `xl` (1.5rem) for an approachable, pill-like feel.
*   **Elevation:** Use an Ambient Shadow rather than a border.
*   **Accent:** A subtle Sun Yellow (`tertiary_fixed`) glow on focus to symbolize "Intellectual Spark."

### Chat Bubbles (Cards & Lists)
*   **User Bubbles:** `primary_container` with `on_primary` text. Use `lg` (1rem) corner radius, but keep the bottom-right corner `sm` (0.25rem) to indicate directionality.
*   **AI Responses:** No bubble background. Use `surface` and distinguish the area through a `6` (1.5rem) left-padding margin and a Royal Blue `primary` vertical accent line (2px wide) on the far left. **Forbid dividers.** Use vertical white space (`8` - 2rem) between turns.

### Buttons & Chips
*   **Primary Button:** Gradient of `primary` to `primary_container`. Text: `on_primary`. Radius: `md`.
*   **Selection Chips:** Use `tertiary_fixed` (Sun Yellow) for selected states to provide a vibrant, warm "Sunlight" accent that contrasts against the blue/white tech aesthetic.

### Additional: "The Insight Card"
For RAG-sourced data, use a "Frosted Glass" card with a `secondary` (Scarlet Red) top-border (3px) to indicate high-importance reference material. This incorporates the final flag color in a disciplined, professional way.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding (e.g., more padding on the left than the right) for headline sections to create an editorial feel.
*   **Do** use `surface-bright` for the main workspace to keep the "Light and Bright" promise.
*   **Do** rely on the `20` (5rem) spacing token to separate major functional groups.

### Don't:
*   **Don't** use black (#000000). Always use `on-surface` (#1a1c1d) for text to maintain a premium, softened contrast.
*   **Don't** use standard "Drop Shadows." If it looks like a 2010 Photoshop effect, it’s too heavy. It must look like ambient light.
*   **Don't** use icons with heavy fills. Use light, 1.5pt stroke-based icons to match the airiness of the typography.