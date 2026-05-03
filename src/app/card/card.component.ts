import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ButtonFavoriteComponent } from '../button-favorite/button-favorite.component';
import { FavoritesService } from '../services/favorites.service';

export interface typeCard {
  id: string;
  image: string;
  title: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ButtonFavoriteComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() cardContent!: typeCard;

  constructor(public favoritesService: FavoritesService) {}

  toggleFav(card: typeCard): void {
    this.favoritesService.toggle(card);
  }
}
