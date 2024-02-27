import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { CarouselComponent } from "./carousel/carousel.component";
import { typeSlides } from "./carousel/carousel.component";
import { CarouselModule } from '@coreui/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    NavbarComponent,
    CarouselComponent,
    CarouselModule
  ]
})
export class AppComponent {
  title = 'manga-project';
  slides: typeSlides[] = new Array(3).fill({ id: -1, src: '', title: '', subtitle: '' });

  constructor() { }

  ngOnInit(): void {
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
