import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardComponent, typeCard } from '../card/card.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { GoToTopComponent } from '../go-to-top/go-to-top.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { GetMangaService } from '../services/getManga.service';
import { I18nService } from '../services/i18n.service';

const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Thriller',
  'Psychological',
  'Supernatural',
  'Isekai',
];

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
  page = 0;
  allGenres = GENRES;
  selectedGenres: string[] = [];
  showFilters = false;

  constructor(
    private mangaService: GetMangaService,
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSections();
    this.getManga();
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  loadSections(): void {
    // Popular
    this.mangaService.getPopularMangas().subscribe({
      next: (data: any) => {
        const items: typeCard[] = [];
        data.data.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService
            .getCoverFileName(coverId)
            .subscribe((cover: any) => {
              items.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.popularMangas.set([...items]);
              this.cdr.markForCheck();
            });
        });
      },
    });

    // Recent
    this.mangaService.getRecentMangas().subscribe({
      next: (data: any) => {
        const items: typeCard[] = [];
        data.data.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService
            .getCoverFileName(coverId)
            .subscribe((cover: any) => {
              items.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.recentMangas.set([...items]);
              this.cdr.markForCheck();
            });
        });
      },
      complete: () => {
        this.loadingSection.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  getManga(append = false): void {
    this.loading.set(true);
    this.mangaService.getAllMangas(this.page).subscribe({
      next: (mangaData: any) => {
        const newItems: typeCard[] = [];
        mangaData.data.forEach((mangaItem: any) => {
          const coverId = this.mangaService.getCoverId(mangaItem);
          this.mangaService
            .getCoverFileName(coverId)
            .subscribe((cover: any) => {
              newItems.push({
                id: mangaItem.id,
                image: this.mangaService.getMangaCover(
                  mangaItem.id,
                  cover.data.attributes.fileName,
                ),
                title: this.mangaService.getMangaTitle(mangaItem),
              });
              this.cardContent.set(
                append ? [...this.cardContent(), ...newItems] : [...newItems],
              );
              this.cdr.markForCheck();
            });
        });
      },
      complete: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  showMore(): void {
    this.page += 28;
    this.getManga(true);
  }

  toggleGenre(genre: string): void {
    const idx = this.selectedGenres.indexOf(genre);
    if (idx >= 0) this.selectedGenres.splice(idx, 1);
    else this.selectedGenres.push(genre);
  }

  isSelectedGenre(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  clearGenres(): void {
    this.selectedGenres = [];
  }

  trackById(_: number, item: typeCard): string {
    return item.id;
  }
}
