import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FavoritesService } from '../services/favorites.service';
import { typeCard } from '../card/card.component';

@Component({
  selector: 'app-button-favorite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-favorite.component.html',
  styleUrl: './button-favorite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonFavoriteComponent {
  @Input() cardContent!: typeCard;

  @Output() toggle = new EventEmitter<typeCard>();

  constructor(public favoritesService: FavoritesService) {}

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggle.emit(this.cardContent);
  }
}