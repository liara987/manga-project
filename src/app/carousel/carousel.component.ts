import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { GetMangaService } from '../services/getManga.service';

interface Slide {
  id: string;
  mangaId: string;
  title: string;
  subtitle: string;
  bg: string;
  cover: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit, OnDestroy {
  slides = signal<Slide[]>([]);
  currentIndex = signal(0);
  private timer: any;

  private FEATURED = [
    {
      title: 'One Piece',
      bg: '../assets/images/slide1.webp',
      logo: '../assets/images/logo1.webp',
    },
    {
      title: 'Solo Leveling',
      bg: '../assets/images/slide2.webp',
      logo: '../assets/images/logo2.webp',
    },
    {
      title: 'Shangri-la Frontier',
      bg: '../assets/images/slide3.webp',
      logo: '../assets/images/logo3.png',
    },
  ];

  constructor(
    private mangaService: GetMangaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.FEATURED.forEach((feat, i) => {
      this.mangaService.getMangaByTitle(feat.title).subscribe({
        next: (data: any) => {
          const item = data.data[0];
          if (!item) return;

          const coverId = this.mangaService.getCoverId(item);

          this.mangaService
            .getCoverFileName(coverId)
            .subscribe((cover: any) => {
              const fileName = cover.data.attributes.fileName;

              const mangaId = cover.data.relationships.find(
                ({ type }: any) => type === 'manga',
              ).id;

              const slide: Slide = {
                id: item.id,
                mangaId,
                title: feat.title,
                subtitle:
                  (
                    item.attributes.description?.en ||
                    item.attributes.description[0]
                  ).slice(0, 160) + '…',
                bg: feat.bg,
                cover: this.mangaService.getMangaCover(mangaId, fileName),
              };

              const current = [...this.slides()];
              current[i] = slide;
              this.slides.set([...current.filter(Boolean)]);
              this.cdr.markForCheck();
            });
        },
      });
    });
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      this.next();
      this.cdr.markForCheck();
    }, 5000);
  }

  next(): void {
    this.currentIndex.update(
      (i) => (i + 1) % Math.max(1, this.slides().length),
    );
  }
  prev(): void {
    this.currentIndex.update(
      (i) => (i - 1 + this.slides().length) % this.slides().length,
    );
  }
  goTo(i: number): void {
    this.currentIndex.set(i);
    clearInterval(this.timer);
    this.startTimer();
  }
}
