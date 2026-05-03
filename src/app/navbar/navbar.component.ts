import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FavoritesService } from '../services/favorites.service';
import { GetMangaService } from '../services/getManga.service';
import { AppLanguage, I18nService } from '../services/i18n.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush = 2
})
export class NavbarComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('resultsDropdown') resultsDropdown!: ElementRef;

  showResults = false;
  mangaTitle = '';
  listResult: { id: string; title: string; image: string }[] = [];
  isMenuOpen = false;
  isSearchOpen = false;
  private searchSubject = new Subject<string>();
  favCount = computed(() => this.favoritesService.favorites().length);
  currentTheme = computed(() => this.themeService.theme());
  currentLang = computed(() => this.i18nService.lang());

  appLangs: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private mangaService: GetMangaService,
    public themeService: ThemeService,
    public favoritesService: FavoritesService,
    public i18nService: I18nService,
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((title) => {
        if (title.trim().length >= 2) this.performSearch(title);
        else this.listResult = [];
      });
  }

  ngAfterViewInit(): void {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (
        this.resultsDropdown &&
        !this.resultsDropdown.nativeElement.contains(e.target)
      ) {
        this.listResult = [];
        this.showResults = false;
      }
    });
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.mangaTitle = '';
    this.listResult = [];
    this.showResults = false;
    this.searchInput.nativeElement.focus();
  }

  performSearch(title: string): void {
    this.mangaService.getMangaByTitle(title).subscribe({
      next: (mangaData: any) => {
        this.listResult = [];
        mangaData.data.slice(0, 8).forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService
            .getCoverFileName(coverId)
            .subscribe((cover: any) => {
              const fileName = cover.data.attributes.fileName;
              const mangaID = cover.data.relationships.find(
                ({ type }: any) => type === 'manga',
              ).id;
              this.listResult.push({
                id: mangaItem.id,
                title: this.mangaService.getMangaTitle(mangaItem),
                image: this.mangaService.getMangaCover(mangaID, fileName),
              });
              this.showResults = true;
            });
        });
      },
    });
  }

  onMangaClick(item: { id: string; title: string; image: string }): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/manga', item.id, item.title, item.image]);
    });
    this.listResult = [];
    this.mangaTitle = '';
    this.showResults = false;
    this.isSearchOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
  setLang(lang: AppLanguage): void {
    this.i18nService.setLang(lang);
  }
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen)
      setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
  }
  trackById(_: number, item: any): string {
    return item.id;
  }
}
