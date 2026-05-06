import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonFavoriteComponent } from './button-favorite.component';

describe('ButtonFavoriteComponent', () => {
  let component: ButtonFavoriteComponent;
  let fixture: ComponentFixture<ButtonFavoriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonFavoriteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonFavoriteComponent);
    component = fixture.componentInstance;
    component.cardContent = {
      id: 'manga-1',
      image: '/cover/manga-1.jpg',
      title: 'One Piece',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
