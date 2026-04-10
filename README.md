# Travel Inspiration Hub

Travel Inspiration Hub is a responsive vanilla JavaScript web app for discovering destinations, viewing live destination context, comparing trip ideas, and saving favorites.

## Project Scope

- HTML, CSS, and vanilla JavaScript only
- Responsive layout with accessible controls and semantic markup
- CSS animation for card reveal and interaction feedback
- Dynamic destination details powered by external APIs
- Favorites, recent searches, and flight comparison saved in local storage

## External Data Sources

- Teleport API for city imagery and urban area scores
- REST Countries API for country facts
- Wikipedia REST API for destination summaries

## Flight Search Note

The app includes a fully operational browser-side flight comparison engine. A live Skyscanner integration is not included in this frontend-only build because Skyscanner access requires authenticated server-side infrastructure. The current route planner keeps the project functional while preserving the proposal structure for a later backend upgrade.

## Commands

- `npm run start` starts the Vite development server.
- `npm run lint` checks the JavaScript files with ESLint.
- `npm run build` builds the production bundle.
- `npm run format` formats project files with Prettier.



