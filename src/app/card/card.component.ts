import { Component, Input } from '@angular/core';

export interface typeCard {
  id: string;
  image: string;
  title: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input()
  cardContent!: typeCard;
}
