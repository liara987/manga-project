import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  effect,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
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
  ) {
    // Re-fetch when language changes
    effect(() => {});
  }

  ngOnInit(): void {
    this.i18nService.lang(); // track signal
    this.mangaService.clearCache();
    this.page = 0;
    this.loadSections();
    this.getManga();
    this.getTags();
  } // handled by effect

  getTags() {
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
    const idx = this.activeRatings.indexOf(r);

    if (idx >= 0)
      this.mangaService.contentRatings = this.activeRatings.filter(
        (x) => x !== r,
      );
    else this.mangaService.contentRatings = [...this.activeRatings, r];
    this.mangaService.clearCache();
    this.page = 0;
    this.getManga();
  }

  private mapItems(data: any): { items: typeCard[]; pending: number } {
    const raw = this.mangaService.dedup(data.data ?? []);
    const items: typeCard[] = [];
    let pending = raw.length;
    raw.forEach((mangaItem: any) => {
      const coverId = this.mangaService.getCoverId(mangaItem);
      this.mangaService.getCoverFileName(coverId).subscribe({
        next: (cover: any) => {
          items.push({
            id: mangaItem.id,
            image: this.mangaService.getMangaCover(
              mangaItem.id,
              cover.data?.attributes.fileName,
            ),
            title: this.mangaService.getMangaTitle(mangaItem),
          });
          this.cdr.markForCheck();
        },
        error: () => {
          pending--;
        },
      });
    });
    return { items, pending };
  }

  loadSections(): void {
    this.loadingSection.set(true);
    this.errorSection.set('');

    let done = 0;
    const finish = () => {
      if (++done === 2) {
        this.loadingSection.set(false);
        this.cdr.markForCheck();
      }
    };

    this.mangaService.getPopularMangas().subscribe({
      next: (data: any) => {
        const items: typeCard[] = [];
        const raw = this.mangaService.dedup(data.data ?? []);
        raw.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService.getCoverFileName(coverId).subscribe({
            next: (cover: any) => {
              items.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data?.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.popularMangas.set([...items]);
              this.cdr.markForCheck();
            },
          });
        });
        finish();
      },
      error: () => {
        this.errorSection.set('error');
        finish();
      },
    });

    this.mangaService.getRecentMangas().subscribe({
      next: (data: any) => {
        const items: typeCard[] = [];
        const raw = this.mangaService.dedup(data.data ?? []);
        raw.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService.getCoverFileName(coverId).subscribe({
            next: (cover: any) => {
              items.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data?.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.recentMangas.set([...items]);
              this.cdr.markForCheck();
            },
          });
        });
        finish();
      },
      error: () => {
        this.errorSection.set('error');
        finish();
      },
    });
  }

  getManga(append = false): void {
    this.loading.set(true);
    this.errorMain.set('');
    this.mangaService.getAllMangas(this.page, this.selectedGenres).subscribe({
      next: (mangaData: any) => {
        const newItems: typeCard[] = [];
        const raw = this.mangaService.dedup(mangaData.data ?? []);
        if (raw.length === 0 && !append) {
          this.cardContent.set([]);
          this.loading.set(false);
          this.cdr.markForCheck();
          return;
        }
        raw.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService.getCoverFileName(coverId).subscribe({
            next: (cover: any) => {
              newItems.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data?.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.cardContent.set(
                append ? [...this.cardContent(), ...newItems] : [...newItems],
              );
              this.cdr.markForCheck();
            },
          });
        });
      },
      error: () => {
        this.errorMain.set('error');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      complete: () => {
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
