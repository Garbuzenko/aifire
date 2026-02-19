# Business Features Documentation

## Profession Analysis Censorship
- **Goal**: Prevent profanity and non-professional inputs from being processed as valid professions.
- **Mechanism**: The AI analyzes the input to check if it is a valid profession or business activity.
- **Criteria**:
  - Must be a profession or a recognized branch of a profession.
  - Must NOT be related to politics.
  - Must NOT be related to religion.
  - Must NOT contain profanity or offensive language (Mat).
  - Must NOT be related to sex or adult themes.
- **Action**: If the input fails these checks, it is marked as `is_censored = true` in the database.
- **Database**: A column `is_censored` (BOOLEAN) is added to the `profession_analysis` table.

## Individual Profession Analysis Page
- **Goal**: Allow users to share and view specific profession analysis results.
- **Mechanism**:
  - Each profession analysis is stored in the database with a unique ID.
  - A dynamic route `/profession/[id]` is created to display the analysis.
  - A "Share" button is added to copy the link to the analysis.
  - The number of views (`request_count`) is displayed on the page and incremented on each visit.

## Profession Analysis Redirect
- **Goal**: Improve user experience and shareability by redirecting users to a dedicated result page after analysis.
- **Mechanism**:
  - After a successful analysis, the user is automatically redirected to `/profession/[id]`.
  - The analysis result is fetched from the database using the unique ID.
  - If the analysis fails to save or retrieve an ID, the result is displayed on the main page as a fallback.

## Language Selection
- **Goal**: Allow users to select their preferred language from a comprehensive list.
- **Mechanism**:
  - A modal window displays all available languages.
  - A search bar is provided to filter languages by name or code.
  - The language list is fetched from the `/api/languages` endpoint, which returns a list of all supported languages with their flags.

## Automated Health Checks
- **Goal**: Ensure key system components are operational immediately after startup.
- **Mechanism**:
  - Runs automatically if `autorun_tests=true` in `.env`.
  - Checks database connectivity and table existence.
  - Verifies the Language API endpoint (`/api/languages`) availability.
  - Logs results to console and critical errors to `temp/errors/errorlog.txt`.

## Profession Graveyard and Top Survivors
- **Goal**: Engage users by displaying lists of high-risk and low-risk professions on the main page.
- **Mechanism**:
  - Fetches the top 5 professions with the highest risk percentage (`risk_percentage` DESC) and the top 5 with the lowest risk percentage (`risk_percentage` ASC).
  - Displays these lists as "🔥 Top Risk Today" and "🛡️ Top Safety" on the main page.
  - Each profession links to its detailed analysis page.
  - Only non-censored professions (`is_censored = false`) are included.

## SEO Improvements
- **Goal**: Enhance search engine visibility and social sharing.
- **Mechanism**:
  - **Dynamic Sitemap**: `sitemap.xml` is automatically generated, including all supported locales and recent profession analysis pages.
  - **Robots.txt**: `robots.txt` is dynamically generated to guide crawlers.
  - **Metadata**: Enhanced metadata including Open Graph and Twitter Card tags for better social sharing previews.
  - **Canonical URLs**: Added canonical tags to prevent duplicate content issues across locales.
  - **Manifest**: Added `manifest.json` for PWA support.
  - **Locales**: Centralized locale configuration in `src/locales.ts` to support all available languages.
