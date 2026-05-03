import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal, HostListener } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';
import { GoToTopComponent } from '../go-to-top/go-to-top.component';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-read-chapter',
  standalone: true,
  imports: [CommonModule, RouterModule, GoToTopComponent],
  templateUrl: './read-chapter.component.html',
  styleUrl: './read-chapter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadChapterComponent implements OnInit {
  images = signal<string[]>([]);
  chapterList = signal<any[]>([]);
  id_chapter = '';
  id_manga = '';
  lang = '';
  chapterNumber: number = 1;
  focusMode = signal(false);
  showChapterList = signal(false);
  loading = signal(true);

  constructor(
    public location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private mangaService: GetMangaService,
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      this.id_chapter = param['id_chapter'];
      this.id_manga = param['id_manga'];
      this.lang = param['language'];
      this.chapterNumber = +param['chapter_number'];
      this.loadImages();
      this.loadChapterList();
    });
  }

  t(key: string): string { return this.i18nService.t(key); }

  loadImages(): void {
    this.loading.set(true);
    this.images.set([]);
    this.mangaService.getChapterImageData(this.id_chapter).subscribe({
      next: (data: any) => {
        const imgs = data.chapter.data.map((img: string) =>
          this.mangaService.getChapterImage(data.chapter.hash, img)
        );
        this.images.set(imgs);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  loadChapterList(): void {
    const volumeChapters: any[][] = [];
    this.mangaService.getAllChapter(this.id_manga, this.lang).subscribe({
      next: (data: any) => {
        Object.keys(data.volumes).forEach(vol => {
          volumeChapters.push(Object.values(data.volumes[vol].chapters));
        });
      },
      complete: () => {
        const flat: any[] = [];
        volumeChapters.forEach(chapters => chapters.forEach((c: any) => flat.push(c)));
        this.chapterList.set(flat);
        this.cdr.markForCheck();
      }
    });
  }

  navigateTo(chapterId: string, others: string[], chapterNumber: number): void {
    const id = others?.length > 0 ? others[0] : chapterId;
    const url = `${id}/${this.id_manga}/${chapterNumber}/${this.lang}`;
    this.router.navigateByUrl(`/refreshChapter/${url}`, { skipLocationChange: true })
      .then(() => this.router.navigate([`/chapter/${url}`]));
    window.scrollTo(0, 0);
    this.showChapterList.set(false);
  }

  prev(): void {
    const next = this.chapterNumber - 1;
    const ch = this.chapterList().find(c => +c.chapter === next);
    if (ch) this.navigateTo(ch.id, ch.others || [], next);
  }

  next(): void {
    const next = this.chapterNumber + 1;
    const ch = this.chapterList().find(c => +c.chapter === next);
    if (ch) this.navigateTo(ch.id, ch.others || [], next);
  }

  hasPrev(): boolean { return this.chapterList().some(c => +c.chapter === this.chapterNumber - 1); }
  hasNext(): boolean { return this.chapterList().some(c => +c.chapter === this.chapterNumber + 1); }

  toggleFocus(): void { this.focusMode.update(v => !v); }
  toggleChapterList(): void { this.showChapterList.update(v => !v); }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'f' || event.key === 'F') this.toggleFocus();
    if (event.key === 'Escape') { this.focusMode.set(false); this.showChapterList.set(false); }
  }

  trackByIndex(index: number): number { return index; }
}
