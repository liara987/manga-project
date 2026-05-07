import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent, typeCard } from './card.component';
import { FavoritesService } from '../services/favorites.service';

const card: typeCard = { id: 'manga-1', image: '/cover/manga-1.jpg', title: 'One Piece' };

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let favoritesService: FavoritesService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [FavoritesService],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.cardContent = card;
    favoritesService = TestBed.inject(FavoritesService);
    fixture.detectChanges();
  });

  it('should create with the given cardContent', () => {
    expect(component).toBeTruthy();
    expect(component.cardContent).toEqual(card);
  });

  it('should render the manga title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('One Piece');
  });

  it('should toggle the favorite when toggleFav is called', () => {
    expect(favoritesService.isFavorite(card.id)).toBeFalse();
    component.toggleFav(card);
    expect(favoritesService.isFavorite(card.id)).toBeTrue();
    component.toggleFav(card);
    expect(favoritesService.isFavorite(card.id)).toBeFalse();
  });

  it('should delegate toggleFav to the favorites service', () => {
    spyOn(favoritesService, 'toggle');
    component.toggleFav(card);
    expect(favoritesService.toggle).toHaveBeenCalledWith(card);
  });
});
