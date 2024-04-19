import { Component, Input } from '@angular/core';
import { CarouselModule } from '@coreui/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'
import { ButtonComponent } from "../button/button.component";
import { GetMangaService } from '../services/getManga.service';

export interface typeSlides {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  logo: string;
  cover: any;
}
@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  imports: [
    CarouselModule,
    RouterModule,
    CommonModule,
    ButtonComponent
  ]
})
export class CarouselComponent {
  slides: typeSlides[] = new Array(3).fill(
    {
      id: '',
      src: '',
      title: '',
      subtitle: '',
      logo: '',
      cover: ''
    });
  constructor(private mangaService: GetMangaService) { }

  ngOnInit() {
    this.slides[0] = {
      id: '',
      src: '../assets/images/slide1.webp',
      title: '',
      subtitle: '',
      logo: '../assets/images/logo1.webp',
      cover: ''
    }

    this.slides[1] = {
      id: '',
      src: '../assets/images/slide2.webp',
      title: '',
      subtitle: '',
      logo: '../assets/images/logo2.webp',
      cover: ''
    }

    this.slides[2] = {
      id: '',
      src: '../assets/images/slide3.webp',
      title: '',
      subtitle: '',
      logo: '../assets/images/logo3.png',
      cover: ''
    }

    this.setTitleAndCover('One Piece', 0)
    this.setTitleAndCover('Solo Leveling', 1)
    this.setTitleAndCover('Shangri-la Frontier', 2)
  }

  setTitleAndCover(title: string, index: number) {
    this.slides[index].title = title

    this.mangaService.getMangaByTitle(title).subscribe((mangaByTitle) => {
      this.slides[index].id = this.mangaService.getCoverId(mangaByTitle.data[0])
      this.slides[index].subtitle = mangaByTitle.data[0].attributes.description.en

      this.mangaService.getCoverFileName(this.slides[index].id).subscribe((cover: any) => {
        const coverFileName = cover.data.attributes.fileName
        const coverId = cover.data.relationships.find(({ type }: any) => type === 'manga').id
        this.slides[index].cover = this.mangaService.getMangaCover(coverId, coverFileName)
      })
    })
  }
}
