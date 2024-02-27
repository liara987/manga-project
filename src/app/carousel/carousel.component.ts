import { Component, Input } from '@angular/core';
import { CarouselModule } from '@coreui/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'

export interface typeSlides {
  id: number;
  src: string;
  title: string;
  subtitle: string;
  logo: string;
}
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule, RouterModule, CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {
  @Input()
  slides!: typeSlides[];

}
