import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardComponent, typeCard } from '../card/card.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { GoToTopComponent } from '../go-to-top/go-to-top.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ContentRating, GetMangaService } from '../services/getManga.service';
import { I18nService } from '../services/i18n.service';

interface GenreItem {
  id: string;
  name: string;
}

const ALL_RATINGS: ContentRating[] = ['safe', 'suggestive', 'erotica'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    CarouselComponent,
    CardComponent,
    GoToTopComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  cardContent = signal<typeCard[]>([]);
  popularMangas = signal<typeCard[]>([]);
  recentMangas = signal<typeCard[]>([]);
  loading = signal(false);
  loadingSection = signal(true);
  errorMain = signal('');
  errorSection = signal('');
  allGenres = signal<GenreItem[]>([]);

  page = 0;
  selectedGenres: string[] = [];
  showFilters = false;
  allRatings = ALL_RATINGS;

  constructor(
    private mangaService: GetMangaService,
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.mangaService.clearCache();
    this.page = 0;
    this.loadSections();
    this.getManga();
    this.getTags();
  }

  getTags(): void {
    this.mangaService.getTags().subscribe((res) => {
      const genres = res.data
        .filter((tag: any) => ['genre', 'theme'].includes(tag.attributes.group))
        .map((tag: any) => ({
          id: tag.id,
          name: tag.attributes.name.en,
        }));
      this.allGenres.set(genres);
    });
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  get activeRatings(): ContentRating[] {
    return this.mangaService.contentRatings;
  }

  isRatingActive(r: ContentRating): boolean {
    return this.activeRatings.includes(r);
  }

  toggleRating(r: ContentRating): void {
    const isActive = this.activeRatings.includes(r);
    this.mangaService.contentRatings = isActive
      ? this.activeRatings.filter((x) => x !== r)
      : [...this.activeRatings, r];
    this.mangaService.clearCache();
    this.page = 0;
    this.getManga();
  }

  loadSections(): void {
    this.loadingSection.set(true);
    this.errorSection.set('');

    forkJoin({
      popular: this.mangaService.getPopularMangas(),
      recent: this.mangaService.getRecentMangas(),
    }).subscribe({
      next: ({ popular, recent }) => {
        const popularRaw = this.mangaService.dedup(popular.data ?? []);
        const recentRaw = this.mangaService.dedup(recent.data ?? []);

        forkJoin({
          popularCards: this.mangaService.buildCards(popularRaw),
          recentCards: this.mangaService.buildCards(recentRaw),
        }).subscribe({
          next: ({ popularCards, recentCards }) => {
            this.popularMangas.set(popularCards);
            this.recentMangas.set(recentCards);
            this.loadingSection.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorSection.set('error');
            this.loadingSection.set(false);
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.errorSection.set('error');
        this.loadingSection.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  getManga(append = false): void {
    this.loading.set(true);
    this.errorMain.set('');

    this.mangaService.getAllMangas(this.page, this.selectedGenres).subscribe({
      next: (mangaData: any) => {
        const raw = this.mangaService.dedup(mangaData.data ?? []);

        if (raw.length === 0 && !append) {
          this.cardContent.set([]);
          this.loading.set(false);
          this.cdr.markForCheck();
          return;
        }

        this.mangaService.buildCards(raw).subscribe({
          next: (newItems) => {
            // Fix: snapshot existing cards before appending to prevent
            // duplicate renders when cover responses arrive out of order.
            this.cardContent.set(
              append ? [...this.cardContent(), ...newItems] : newItems,
            );
            this.loading.set(false);
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMain.set('error');
            this.loading.set(false);
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.errorMain.set('error');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.cardContent.set([]);
    this.mangaService.clearCache();
    this.getManga();
  }

  showMore(): void {
    this.page += 35;
    this.getManga(true);
  }

  toggleGenre(id: string): void {
    const idx = this.selectedGenres.indexOf(id);
    if (idx >= 0) this.selectedGenres.splice(idx, 1);
    else this.selectedGenres.push(id);
  }

  isSelectedGenre(id: string): boolean {
    return this.selectedGenres.includes(id);
  }

  clearGenres(): void {
    this.selectedGenres = [];
  }

  trackById(_: number, item: typeCard): string {
    return item.id;
  }
}
