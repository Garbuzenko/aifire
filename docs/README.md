# Will AI Take My Job? - Project Documentation

## Business Logic Overview

This application is a multilingual web tool designed to help users assess the risk of their profession being automated by Artificial Intelligence.

### Key Features

1.  **AI Risk Analysis**:
    *   Users input their job title.
    *   The system uses the DeepSeek LLM API to analyze the profession.
    *   It provides a "Risk Score" (0-100%), a verdict, reasoning, safe skills (hard to automate), and tasks at risk.

2.  **Multilingual Support**:
    *   The site supports 7 languages: English, Russian, Spanish, German, French, Chinese, and Japanese.
    *   Language selection is handled via URL path prefixes (e.g., `/en`, `/ru`) and a custom Language Switcher component.
    *   The list of supported languages is served via an internal API endpoint (`/api/languages`).

3.  **User Interface**:
    *   Minimalist, high-contrast dark mode design.
    *   Interactive animations using Framer Motion.
    *   Integrated AI Widget (from `hero.ai-stickers.ru`) for visual engagement.
    *   AI Founders logo link added to the top right corner for community access.
    *   **Footer**: Includes "Powered by AI Founders" branding with a gradient effect, links to the Telegram community, and a dynamic copyright year.

### Technical Architecture

*   **Framework**: Next.js 16 (App Router)
*   **Styling**: Tailwind CSS v4
*   **Internationalization**: `next-intl` with middleware for routing.
*   **AI Integration**: OpenAI SDK configured for DeepSeek API.
*   **Database**: MySQL (via `mysql2`) for caching analysis results and tracking request counts.
*   **Error Logging**: Server errors are logged to `temp/errors/errorlog.txt`.
