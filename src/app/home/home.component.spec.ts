import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { GetMangaService } from '../services/getManga.service';
import { HomeComponent } from './home.component';

const makeCard = (id: string) => ({
  id,
  title: `Manga ${id}`,
  image: `/cover/${id}.jpg`,
});

function makeMangaServiceSpy() {
  return jasmine.createSpyObj<GetMangaService>(
    'GetMangaService',
    [
      'clearCache',
      'getTags',
      'getAllMangas',
      'getPopularMangas',
      'getRecentMangas',
      'dedup',
      'buildCards',
      'getCoverId',
      'getCoverFileName',
      'getMangaCover',
      'getMangaTitle',
    ],
    {
      contentRatings: ['safe'],
    },
  );
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mangaService: jasmine.SpyObj<GetMangaService>;

  const defaultTagsResponse = { data: [] };
  const defaultMangaResponse = { data: [] };

  beforeEach(async () => {
    mangaService = makeMangaServiceSpy();
    mangaService.getTags.and.returnValue(of(defaultTagsResponse));
    mangaService.getAllMangas.and.returnValue(of(defaultMangaResponse));
    mangaService.getPopularMangas.and.returnValue(of(defaultMangaResponse));
    mangaService.getRecentMangas.and.returnValue(of(defaultMangaResponse));
    mangaService.dedup.and.callFake((items: any[]) => items);
    mangaService.buildCards.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GetMangaService, useValue: mangaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  // ─── Initialization ──────────────────────────────────────────────────────────

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should clear cache and reset page on init', () => {
    fixture.detectChanges();
    expect(mangaService.clearCache).toHaveBeenCalled();
    expect(component.page).toBe(0);
  });

  it('should call loadSections, getManga, and getTags on init', () => {
    fixture.detectChanges();
    expect(mangaService.getPopularMangas).toHaveBeenCalled();
    expect(mangaService.getRecentMangas).toHaveBeenCalled();
    expect(mangaService.getAllMangas).toHaveBeenCalled();
    expect(mangaService.getTags).toHaveBeenCalled();
  });

  // ─── Loading states ──────────────────────────────────────────────────────────

  it('should set loading to false after getManga completes with empty data', () => {
    fixture.detectChanges();
    expect(component.loading()).toBeFalse();
  });

  it('should set loadingSection to false after section data loads', () => {
    fixture.detectChanges();
    expect(component.loadingSection()).toBeFalse();
  });

  // ─── Tags ────────────────────────────────────────────────────────────────────

  it('should populate allGenres from genre and theme tags', () => {
    mangaService.getTags.and.returnValue(
      of({
        data: [
          { id: 'g1', attributes: { group: 'genre', name: { en: 'Action' } } },
          { id: 't1', attributes: { group: 'theme', name: { en: 'School' } } },
          { id: 'f1', attributes: { group: 'format', name: { en: 'Long' } } },
        ],
      }),
    );
    fixture.detectChanges();
    expect(component.allGenres()).toEqual([
      { id: 'g1', name: 'Action' },
      { id: 't1', name: 'School' },
    ]);
  });

  // ─── getManga – success ──────────────────────────────────────────────────────

  it('should populate cardContent with resolved cards', () => {
    const cards = [makeCard('1'), makeCard('2')];
    mangaService.getAllMangas.and.returnValue(
      of({ data: [{ id: '1' }, { id: '2' }] }),
    );
    mangaService.buildCards.and.returnValue(of(cards));

    fixture.detectChanges();
    expect(component.cardContent()).toEqual(cards);
  });

  it('should set cardContent to empty array when API returns no items and append is false', () => {
    mangaService.getAllMangas.and.returnValue(of({ data: [] }));
    fixture.detectChanges();
    expect(component.cardContent()).toEqual([]);
    expect(component.loading()).toBeFalse();
  });

  // ─── getManga – error ────────────────────────────────────────────────────────

  it('should set errorMain and clear loading on getAllMangas failure', () => {
    mangaService.getAllMangas.and.returnValue(
      throwError(() => new Error('network')),
    );
    fixture.detectChanges();
    expect(component.errorMain()).toBe('error');
    expect(component.loading()).toBeFalse();
  });

  // ─── Sections – error ────────────────────────────────────────────────────────

  it('should set errorSection and clear loadingSection when popular or recent fetch fails', () => {
    mangaService.getPopularMangas.and.returnValue(
      throwError(() => new Error('fail')),
    );
    fixture.detectChanges();
    expect(component.errorSection()).toBe('error');
    expect(component.loadingSection()).toBeFalse();
  });

  // ─── Sections – content ──────────────────────────────────────────────────────

  it('should populate popularMangas and recentMangas after both sections load', () => {
    const popular = [makeCard('p1')];
    const recent = [makeCard('r1')];

    mangaService.getPopularMangas.and.returnValue(of({ data: [{ id: 'p1' }] }));
    mangaService.getRecentMangas.and.returnValue(of({ data: [{ id: 'r1' }] }));
    mangaService.buildCards.and.callFake((items: any[]) =>
      of(items.map((i) => makeCard(i.id))),
    );

    fixture.detectChanges();
    expect(component.popularMangas()).toEqual(popular);
    expect(component.recentMangas()).toEqual(recent);
  });

  // ─── showMore / pagination ───────────────────────────────────────────────────

  it('should increment page by 35 and append results on showMore', () => {
    const page1Cards = [makeCard('1')];
    const page2Cards = [makeCard('2')];

    mangaService.getAllMangas.and.returnValues(
      of({ data: [{ id: '1' }] }),
      of({ data: [{ id: '2' }] }),
    );
    mangaService.buildCards.and.returnValues(of(page1Cards), of(page2Cards));

    fixture.detectChanges(); // initial load
    expect(component.cardContent()).toEqual(page1Cards);

    component.showMore();
    fixture.detectChanges();

    expect(component.page).toBe(35);
    // Should contain both pages without duplicates from prior page
    expect(component.cardContent()).toEqual([...page1Cards, ...page2Cards]);
  });

  it('should not duplicate existing cards when showMore is called', () => {
    const page1Cards = [makeCard('1'), makeCard('2')];
    const page2Cards = [makeCard('3')];

    mangaService.getAllMangas.and.returnValues(
      of({ data: [{ id: '1' }, { id: '2' }] }),
      of({ data: [{ id: '3' }] }),
    );
    mangaService.buildCards.and.returnValues(of(page1Cards), of(page2Cards));

    fixture.detectChanges();
    component.showMore();
    fixture.detectChanges();

    expect(component.cardContent().length).toBe(3);
    const ids = component.cardContent().map((c) => c.id);
    expect(ids).toEqual(['1', '2', '3']);
  });

  // ─── Filters ─────────────────────────────────────────────────────────────────

  it('should toggle genre selection', () => {
    component.toggleGenre('g1');
    expect(component.isSelectedGenre('g1')).toBeTrue();

    component.toggleGenre('g1');
    expect(component.isSelectedGenre('g1')).toBeFalse();
  });

  it('should clear all selected genres', () => {
    component.toggleGenre('g1');
    component.toggleGenre('g2');
    component.clearGenres();
    expect(component.selectedGenres).toEqual([]);
  });

  it('should reset page and clear cards on applyFilters', () => {
    component.page = 70;
    component.cardContent.set([makeCard('x')]);
    fixture.detectChanges();

    component.applyFilters();

    expect(component.page).toBe(0);
    expect(mangaService.clearCache).toHaveBeenCalledTimes(2); // init + applyFilters
    expect(mangaService.getAllMangas).toHaveBeenCalledWith(0, []);
  });

  // ─── Content rating ──────────────────────────────────────────────────────────

  it('should add a rating to the active set when it is not already active', () => {
    (mangaService as any).contentRatings = ['safe'];
    component.toggleRating('suggestive');
    expect(mangaService.contentRatings).toContain('suggestive');
  });

  it('should remove a rating from the active set when it is already active', () => {
    (mangaService as any).contentRatings = ['safe', 'suggestive'];
    component.toggleRating('suggestive');
    expect(mangaService.contentRatings).not.toContain('suggestive');
  });

  it('should reset page and re-fetch manga on rating toggle', () => {
    component.page = 35;
    (mangaService as any).contentRatings = ['safe'];
    component.toggleRating('erotica');
    expect(component.page).toBe(0);
    expect(mangaService.clearCache).toHaveBeenCalled();
    expect(mangaService.getAllMangas).toHaveBeenCalledWith(0, []);
  });

  // ─── trackById ───────────────────────────────────────────────────────────────

  it('should return the id for trackById', () => {
    expect(component.trackById(0, makeCard('abc'))).toBe('abc');
  });
});
