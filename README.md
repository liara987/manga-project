# MangaProject

MangaProject is a web application for discovering, saving, and reading manga using data from the [MangaDex API](https://api.mangadex.org/docs/). The project is built with Angular 17, standalone components, lazy-loaded routes, responsive SCSS, and integrations with manga, cover, chapter, and reader image endpoints.

## What The Project Does

- Displays a home page with a featured manga carousel.
- Lists popular manga ordered by follower count.
- Lists recently updated manga.
- Displays a general manga grid with incremental loading through the "Show More" button.
- Allows users to search manga by title from the navigation bar.
- Shows search results with cover images, titles, and direct navigation to details.
- Filters manga by genres and themes from MangaDex.
- Filters content by rating: `safe`, `suggestive`, and `erotica`.
- Removes duplicate results by title before rendering lists.
- Displays a detail page with cover, background image, title, description, status, year, type, and genres.
- Lists the available chapters for a manga.
- Filters chapters by translation language.
- Sorts chapters in ascending or descending order.
- Includes pagination for chapter lists.
- Shows flags and formatted language names for chapter languages.
- Opens a chapter reader with real MangaDex pages.
- Allows navigation to the previous and next chapters.
- Includes a side panel with the chapter list while reading.
- Includes focus mode in the reader, hiding controls for immersive reading.
- Allows exiting focus mode by click, `F`, or `Escape`.
- Supports reader keyboard shortcuts: left arrow, right arrow, `F`, and `Escape`.
- Allows returning from the reader to the manga detail page.
- Includes a global go-to-top button.
- Allows users to add and remove favorite manga.
- Persists favorites in `localStorage`.
- Displays a dedicated favorites page.
- Shows the favorites count in the navbar.
- Supports light and dark themes.
- Persists the selected theme in `localStorage`.
- Uses the system preference as the initial theme when no saved choice exists.
- Includes a translatable interface for English, Portuguese, Spanish, French, and Japanese.
- Persists the selected language in `localStorage`.
- Adapts MangaDex queries to the language selected in the app.
- Uses in-memory cache with TTL to reduce repeated requests.
- Reuses in-flight requests with `shareReplay`.
- Uses a local proxy to access MangaDex and cover/page images during development.
- Uses responsive layouts for desktop and mobile.
- Includes a mobile menu, mobile search, and compact controls for smaller screens.

## Main Screens

### Home

The home screen focuses on discovery and navigation:

- automatic carousel with featured manga;
- horizontal sections for popular and recently updated manga;
- general manga grid;
- filters by genre, theme, and content rating;
- incremental loading with "Show More";
- loading, error, and empty states.

### Search

Search is available in the navbar and uses `debounceTime(300)` with `distinctUntilChanged` to avoid excessive requests. After typing at least 2 characters, the app queries MangaDex, shows up to 8 results, and allows opening the detail page directly.

### Manga Details

The detail page displays:

- cover and background based on the manga image;
- title, description, status, year, type, and genres;
- add/remove favorite button;
- available chapter languages;
- paginated chapter list;
- ascending/descending sorting;
- direct link to read each chapter.

### Chapter Reader

The reader loads pages through MangaDex's `at-home/server` endpoint and builds the final image URLs. It includes:

- previous/next navigation;
- side chapter list;
- focus mode;
- back-to-details button;
- keyboard shortcuts;
- centered page layout.

### Favorites

The favorites page displays manga saved locally. Users can open each manga detail page or remove items from the list. Data is persisted in `localStorage` under the `manga-favorites` key.

## Technologies Used

- **Angular 17.1**: main application framework.
- **Angular Standalone Components**: components without `NgModule`.
- **Angular Router**: navigation between home, favorites, details, and reader pages.
- **Component Lazy Loading**: route-based on-demand loading.
- **HashLocationStrategy**: hash-based URLs for easier static hosting.
- **Angular Signals**: reactive state in components and services.
- **ChangeDetectionStrategy.OnPush**: more efficient rendering.
- **RxJS**: search flow, cache, shared requests, and asynchronous streams.
- **HttpClient**: communication with MangaDex.
- **SCSS**: global styles, themes, and responsive component styling.
- **Bootstrap 5 / CoreUI**: visual foundation and UI utilities.
- **CoreUI Icons**: icon package available in the project.
- **iso-639-1**: support for language names/codes.
- **localStorage**: persistence for theme, language, and favorites.
- **Karma + Jasmine**: Angular testing stack.

## MangaDex Integration

The app consumes MangaDex through two paths configured in the local proxy:

- `/api` points to `https://api.mangadex.org`
- `/cover` points to `https://uploads.mangadex.org`

Main resources used:

- `/manga` for listing, search, popular, and recent manga;
- `/manga/tag` for genres and themes;
- `/cover/:id` to retrieve cover file data;
- `/chapter?manga=:id` for paginated chapters;
- `/manga/:id/aggregate` for the aggregated chapter list in the reader;
- `/at-home/server/:chapterId` for chapter page data.

## Application Routes

| Route                                                             | Screen                       |
| ----------------------------------------------------------------- | ---------------------------- |
| `/`                                                               | Home                         |
| `/home`                                                           | Home                         |
| `/favorites`                                                      | Favorites                    |
| `/manga/:id`                                                      | Manga details                |
| `/manga/:id/:title/:image`                                        | Details with navigation data |
| `/manga/:title/:image`                                            | Details by title/image       |
| `/refreshManga/:id/:title/:image`                                 | Internal details refresh     |
| `/chapter/:id_chapter/:id_manga/:chapter_number/:language`        | Chapter reader               |
| `/refreshChapter/:id_chapter/:id_manga/:chapter_number/:language` | Internal reader refresh      |

## Main Structure

```text
src/app
  app.config.ts
  app.routes.ts
  navbar/
  home/
  carousel/
  card/
  manga-detail/
  read-chapter/
  favorites/
  button-favorite/
  go-to-top/
  pipe/
    formatLanguage.pipe.ts
    showFlag.pipe.ts
  services/
    getManga.service.ts
    favorites.service.ts
    theme.service.ts
    i18n.service.ts
```

## How To Run

Install dependencies:

```bash
npm install
```

Start the development server with proxy:

```bash
npm start
```

Open the app in the browser using the address shown by Angular CLI, usually:

```text
http://localhost:4200/
```

## Available Scripts

```bash
npm start
```

Runs `ng serve --proxy-config proxy.conf.json`.

```bash
npm run build
```

Generates the production build in `dist/manga-project`.

```bash
npm test
```

Runs tests with Karma and Jasmine.

```bash
npm run watch
```

Runs build in watch mode for development.

## Notes

- The proxy is important during development to avoid CORS issues and to send the `Referer` expected by MangaDex services.
- Favorites, theme, and language are saved only in the user's browser.
- The project depends on MangaDex API and MangaDex upload server availability to load lists, covers, and pages.

## Contact

- [LinkedIn](https://www.linkedin.com/in/liara-programadora/)
- [YouTube](https://www.youtube.com/channel/UCkjlpKaG0SUeCQso6Lt2gbg)
