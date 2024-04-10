import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MangaDetailComponent } from './manga-detail.component';

describe('MangaDetailComponent', () => {
  let component: MangaDetailComponent;
  let fixture: ComponentFixture<MangaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MangaDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MangaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
