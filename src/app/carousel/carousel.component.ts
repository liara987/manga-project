import { Component, Input } from '@angular/core';
import { CarouselModule } from '@coreui/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'
import { ButtonComponent } from "../button/button.component";

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
    templateUrl: './carousel.component.html',
    styleUrl: './carousel.component.scss',
    imports: [CarouselModule, RouterModule, CommonModule, ButtonComponent]
})
export class CarouselComponent {
  @Input()
  slides!: typeSlides[];

}
