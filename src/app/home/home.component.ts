import { Component } from '@angular/core';
import { typeSlides } from "../carousel/carousel.component";
import { typeCard } from "../card/card.component";
import { HttpClient } from '@angular/common/http';
import { GetMangaService } from '../services/getManga.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CarouselComponent } from "../carousel/carousel.component";
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    CarouselComponent,
    CardComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  cardContent: Array<typeCard> = [];
  slides: typeSlides[] = new Array(3).fill({ id: -1, src: '', title: '', subtitle: '' });
  test: any;
  fileName!: string;
  coverId!: string;
  image!: string;
  mangaID!: string;

  constructor(private http: HttpClient, private mangaService: GetMangaService) { }

  ngOnInit(): void {
    this.setCarouselItens()

    this.mangaService.getAllMangas().subscribe((mangaData: any) => {
      mangaData.data.forEach((mangaItem: any) => {

        this.coverId = this.getCoverId(mangaItem).id
        this.mangaService.getCoverFileName(this.coverId).subscribe((cover: any) => {
          this.fileName = cover.data.attributes.fileName
          this.mangaID = cover.data.relationships.find(({ type }: any) => type === 'manga').id
          this.setCardContent(mangaItem.id, this.getMangaCover(this.mangaID, this.fileName), mangaItem.attributes.title.en)
        });

      });
    });
  }

  setCardContent(id: string, image: string, title: string) {
    this.cardContent.push({
      id: id,
      image: image,
      title: title
    })
  }

  getCoverId(mangaItem: any) {
    const coverID = mangaItem.relationships.find(({ type }: any) => type === 'cover_art')
    return coverID
  }

  getCoverFileName(coverId: string) {

  }

  getMangaCover(id_cover_art: string, file_name: string) {
    const BASE_IMAGE_URL = 'https://uploads.mangadex.org'
    return (`${BASE_IMAGE_URL}/covers/${id_cover_art}/${file_name}.256.jpg`)
    // https://uploads.mangadex.org/covers/idManga/file_name.png
  }

  setCarouselItens() {
    this.slides[0] = {
      id: 0,
      src: '../assets/images/slide1.webp',
      title: 'First slide',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non curabitur gravida arcu ac tortor dignissim. In dictum non consectetur a erat nam at lectus urna.',
      logo: '../assets/images/logo1.webp'
    };
    this.slides[1] = {
      id: 1,
      src: '../assets/images/slide2.webp',
      title: 'Second slide',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non curabitur gravida arcu ac tortor dignissim. In dictum non consectetur a erat nam at lectus urna.',
      logo: '../assets/images/logo2.webp'
    }
    this.slides[2] = {
      id: 2,
      src: '../assets/images/slide3.webp',
      title: 'Third slide',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non curabitur gravida arcu ac tortor dignissim. In dictum non consectetur a erat nam at lectus urna.',
      logo: '../assets/images/logo3.png'
    }
  }
}