import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NavbarComponent } from './navbar.component';
import { GetMangaService } from '../services/getManga.service';

const makeCard = (id: string, title = `Manga ${id}`) => ({
  id, title, image: `/cover/${id}.jpg`,
});

const makeMangaItem = (id: string, title = `Manga ${id}`) => ({
  id,
  attributes: { title: { en: title } },
});

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mangaService: jasmine.SpyObj<GetMangaService>;

  beforeEach(async () => {
    mangaService = jasmine.createSpyObj<GetMangaService>('GetMangaService', [
      'getMangaByTitle',
      'dedup',
      'buildCards',
      'getCoverId',
      'getCoverFileName',
      'getMangaCover',
      'getMangaTitle',
    ]);
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    mangaService.dedup.and.callFake((items) => items);
    mangaService.buildCards.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GetMangaService, useValue: mangaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── performSearch ───────────────────────────────────────────────────────────

  it('should populate listResult and set showResults true when search finds cards', fakeAsync(() => {
    const cards = [makeCard('1'), makeCard('2')];
    mangaService.getMangaByTitle.and.returnValue(of({ data: [makeMangaItem('1'), makeMangaItem('2')] }));
    mangaService.buildCards.and.returnValue(of(cards));

    component.performSearch('Naruto');
    tick();
    fixture.detectChanges();

    expect(component.listResult).toEqual(cards);
    expect(component.showResults).toBeTrue();
  }));

  it('should set showResults false when search returns no results', fakeAsync(() => {
    mangaService.getMangaByTitle.and.returnValue(of({ data: [] }));
    mangaService.buildCards.and.returnValue(of([]));

    component.performSearch('xyznotfound');
    tick();

    expect(component.listResult).toEqual([]);
    expect(component.showResults).toBeFalse();
  }));

  it('should limit search results to 8 items', fakeAsync(() => {
    const rawItems = Array.from({ length: 12 }, (_, i) => makeMangaItem(`${i}`));
    mangaService.getMangaByTitle.and.returnValue(of({ data: rawItems }));
    mangaService.dedup.and.callFake((items) => items);
    mangaService.buildCards.and.callFake((items) =>
      of(items.map((i: any) => makeCard(i.id))),
    );

    component.performSearch('test');
    tick();

    expect(mangaService.buildCards).toHaveBeenCalledWith(
      jasmine.arrayWithExactContents(rawItems.slice(0, 8)),
    );
  }));

  it('should deduplicate search results before building cards', fakeAsync(() => {
    const raw = [makeMangaItem('1'), makeMangaItem('2')];
    const deduped = [makeMangaItem('1')];
    mangaService.getMangaByTitle.and.returnValue(of({ data: raw }));
    mangaService.dedup.and.returnValue(deduped);

    component.performSearch('test');
    tick();

    expect(mangaService.dedup).toHaveBeenCalledWith(raw);
    expect(mangaService.buildCards).toHaveBeenCalledWith(deduped);
  }));

  // ─── onSearchInput ───────────────────────────────────────────────────────────

  it('should debounce search input and not search for strings shorter than 2 chars', fakeAsync(() => {
    component.onSearchInput('a');
    tick(350);
    expect(mangaService.getMangaByTitle).not.toHaveBeenCalled();
  }));

  it('should trigger search after debounce for strings of 2+ chars', fakeAsync(() => {
    mangaService.buildCards.and.returnValue(of([]));
    component.onSearchInput('Na');
    tick(350);
    expect(mangaService.getMangaByTitle).toHaveBeenCalledWith('Na');
  }));

  // ─── clearSearch ─────────────────────────────────────────────────────────────

  it('should clear search state on clearSearch', () => {
    component.mangaTitle = 'test';
    component.listResult = [makeCard('1')];
    component.showResults = true;

    // Provide a mock searchInput to avoid null ref
    component.searchInput = { nativeElement: { focus: jasmine.createSpy('focus') } } as any;
    component.clearSearch();

    expect(component.mangaTitle).toBe('');
    expect(component.listResult).toEqual([]);
    expect(component.showResults).toBeFalse();
  });

  // ─── onMangaClick ────────────────────────────────────────────────────────────

  it('should clear search state after a manga is selected', () => {
    component.listResult = [makeCard('1')];
    component.mangaTitle = 'test';
    component.showResults = true;
    component.isSearchOpen = true;

    component.onMangaClick(makeCard('1'));

    expect(component.listResult).toEqual([]);
    expect(component.mangaTitle).toBe('');
    expect(component.showResults).toBeFalse();
    expect(component.isSearchOpen).toBeFalse();
  });

  // ─── toggleMenu / toggleSearch ───────────────────────────────────────────────

  it('should toggle isMenuOpen', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should toggle isSearchOpen', fakeAsync(() => {
    component.searchInput = { nativeElement: { focus: jasmine.createSpy('focus') } } as any;
    expect(component.isSearchOpen).toBeFalse();
    component.toggleSearch();
    tick(150);
    expect(component.isSearchOpen).toBeTrue();
  }));

  // ─── trackById ───────────────────────────────────────────────────────────────

  it('should return the id for trackById', () => {
    expect(component.trackById(0, { id: 'xyz' })).toBe('xyz');
  });
});
