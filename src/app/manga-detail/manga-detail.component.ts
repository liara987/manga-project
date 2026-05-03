import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ChangeFormatLanguagePipe } from '../pipe/formatLanguage.pipe';
import { ShowFlagPipe } from '../pipe/showFlag.pipe';
import { FavoritesService } from '../services/favorites.service';
import { GetMangaService } from '../services/getManga.service';
import { I18nService } from '../services/i18n.service';

export interface typeDetailManga {
  id: string;
  title: string;
  image: string;
  description: string;
  type: string;
  genre: string[];
  yearLauch: string;
  status: string;
}

@Component({
  selector: 'app-manga-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    ShowFlagPipe,
    ChangeFormatLanguagePipe,
  ],
  templateUrl: './manga-detail.component.html',
  styleUrl: './manga-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MangaDetailComponent implements OnInit {
  mangaDetail = signal<typeDetailManga>({
    id: '',
    title: '',
    image: '',
    description: '',
    type: '',
    genre: [],
    yearLauch: '',
    status: '',
  });
  chapterList = signal<any[]>([]);
  genreList = signal<string[]>([]);
  languageList = signal<string[]>([]);
  loadingData = signal(true);
  loadingChapters = signal(true);
  orderAsc = signal(true);
  codeLanguage = '';
  page = 0;

  constructor(
    private route: ActivatedRoute,
    private mangaService: GetMangaService,
    public favoritesService: FavoritesService,
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const title = this.route.snapshot.paramMap.get('title') || '';
    const image = this.route.snapshot.paramMap.get('image') || '';

    this.mangaDetail.update((d) => ({ ...d, id, title, image }));
    if (id) {
      this.loadById(id, title, image);
    } else {
      this.loadByTitle(title, image);
    }
  }

  t(key: string): string {
    return this.i18nService.t(key);
  }

  private loadById(id: string, title: string, image: string): void {
    this.mangaService.getMangaByTitle(title).subscribe({
      next: (data: any) => {
        const item = data.data.find((m: any) => m.id === id) ?? data.data[0];
        this.processDetail(item, image);
      },
    });
  }

  private loadByTitle(title: string, image: string): void {
    this.mangaService.getMangaByTitle(title).subscribe({
      next: (data: any) => {
        if (data.data[0]) this.processDetail(data.data[0], image);
      },
    });
  }

  private processDetail(item: any, image: string): void {
    const genres = item.attributes.tags.map((t: any) => t.attributes.name.en);
    this.genreList.set(genres);
    this.languageList.set(item.attributes.availableTranslatedLanguages || []);
    this.mangaDetail.set({
      id: item.id,
      title: this.mangaService.getMangaTitle(item),
      image,
      description: item.attributes.description?.en || '',
      type: item.type,
      genre: genres,
      yearLauch: item.attributes.year,
      status: item.attributes.status,
    });
    this.loadingData.set(false);
    this.cdr.markForCheck();
    this.loadChapters(item.id);
  }

  loadChapters(id: string, lang?: string): void {
    this.loadingChapters.set(true);
    this.mangaService
      .getMangaChapterList(
        id,
        this.page,
        this.orderAsc() ? 'asc' : 'desc',
        lang,
      )
      .subscribe({
        next: (data: any) => {
          this.chapterList.set(data.data);
          this.loadingChapters.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  toggleOrder(): void {
    this.orderAsc.update((v) => !v);
    this.page = 0;
    this.loadChapters(this.mangaDetail().id, this.codeLanguage || undefined);
  }

  setLanguage(lang: string): void {
    this.codeLanguage = lang;
    this.page = 0;
    this.loadChapters(this.mangaDetail().id, lang || undefined);
  }

  nextPage(): void {
    this.page += 28;
    this.loadChapters(this.mangaDetail().id, this.codeLanguage || undefined);
  }
  prevPage(): void {
    if (this.page >= 28) {
      this.page -= 28;
      this.loadChapters(this.mangaDetail().id, this.codeLanguage || undefined);
    }
  }

  toggleFav(): void {
    const d = this.mangaDetail();
    this.favoritesService.toggle({ id: d.id, title: d.title, image: d.image });
  }

  isFav(): boolean {
    return this.favoritesService.isFavorite(this.mangaDetail().id);
  }

  trackById(_: number, item: any): string {
    return item.id;
  }
}
