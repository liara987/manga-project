import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { MangaDetailComponent } from './manga-detail.component';

describe('MangaDetailComponent', () => {
  let component: MangaDetailComponent;
  let fixture: ComponentFixture<MangaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MangaDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '',
              },
            },
          },
        },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MangaDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
