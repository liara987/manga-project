import { Location } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { GetMangaService } from '../services/getManga.service';
import { I18nService } from '../services/i18n.service';
import { ReadChapterComponent } from './read-chapter.component';

describe('ReadChapterComponent', () => {
  let component: ReadChapterComponent;
  let router: jasmine.SpyObj<Router>;
  let mangaService: jasmine.SpyObj<GetMangaService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', [
      'navigate',
      'navigateByUrl',
    ]);
    router.navigate.and.returnValue(Promise.resolve(true));
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    mangaService = jasmine.createSpyObj<GetMangaService>('GetMangaService', [
      'getChapterImageData',
      'getChapterImage',
      'getAllChapter',
    ]);
    cdr = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', [
      'markForCheck',
    ]);

    component = new ReadChapterComponent(
      {} as Location,
      router,
      {} as ActivatedRoute,
      mangaService,
      { t: (key: string) => key } as I18nService,
      cdr,
    );
  });

  it('should navigate back to manga details with title and image when available', () => {
    component.id_manga = 'manga-1';
    component.title = 'One Piece';
    component.image = '/cover/one-piece.jpg';

    component.goToDetails();

    expect(router.navigate).toHaveBeenCalledWith([
      '/manga',
      'manga-1',
      'One Piece',
      '/cover/one-piece.jpg',
    ]);
  });

  it('should navigate back to manga details using only the manga id as fallback', () => {
    component.id_manga = 'manga-1';

    component.goToDetails();

    expect(router.navigate).toHaveBeenCalledWith(['/manga', 'manga-1']);
  });

  it('should not navigate to details when manga id is missing', () => {
    component.goToDetails();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should load chapter images and build final page URLs', () => {
    mangaService.getChapterImageData.and.returnValue(
      of({
        chapter: {
          hash: 'chapter-hash',
          data: ['page-1.jpg', 'page-2.jpg'],
        },
      }),
    );
    mangaService.getChapterImage.and.callFake(
      (hash: string, image: string) => `/cover/data/${hash}/${image}`,
    );

    component.id_chapter = 'chapter-1';
    component.loadImages();

    expect(mangaService.getChapterImageData).toHaveBeenCalledWith('chapter-1');
    expect(component.images()).toEqual([
      '/cover/data/chapter-hash/page-1.jpg',
      '/cover/data/chapter-hash/page-2.jpg',
    ]);
    expect(component.loading()).toBeFalse();
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('should flatten aggregate chapter data into chapterList', () => {
    mangaService.getAllChapter.and.returnValue(
      of({
        volumes: {
          '1': {
            chapters: {
              '1': { id: 'chapter-1', chapter: '1' },
              '2': { id: 'chapter-2', chapter: '2' },
            },
          },
          '2': {
            chapters: {
              '3': { id: 'chapter-3', chapter: '3' },
            },
          },
        },
      }),
    );

    component.id_manga = 'manga-1';
    component.lang = 'en';
    component.loadChapterList();

    expect(component.chapterList()).toEqual([
      { id: 'chapter-1', chapter: '1' },
      { id: 'chapter-2', chapter: '2' },
      { id: 'chapter-3', chapter: '3' },
    ]);
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('should navigate to another chapter preserving details query params', async () => {
    spyOn(window, 'scrollTo');
    component.id_manga = 'manga-1';
    component.lang = 'pt-br';
    component.title = 'One Piece';
    component.image = '/cover/one-piece.jpg';

    component.navigateTo('chapter-1', ['scanlation-chapter'], 7);
    await Promise.resolve();

    expect(router.navigateByUrl).toHaveBeenCalledWith(
      '/refreshChapter/scanlation-chapter/manga-1/7/pt-br',
      { skipLocationChange: true },
    );
    expect(router.navigate).toHaveBeenCalledWith(
      ['/chapter', 'scanlation-chapter', 'manga-1', 7, 'pt-br'],
      {
        queryParams: {
          title: 'One Piece',
          image: '/cover/one-piece.jpg',
        },
      },
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(component.showChapterList()).toBeFalse();
  });

  it('should navigate to previous and next chapters when available', () => {
    spyOn(component, 'navigateTo');
    component.chapterNumber = 2;
    component.chapterList.set([
      { id: 'chapter-1', chapter: '1', others: [] },
      { id: 'chapter-3', chapter: '3', others: ['chapter-3-alt'] },
    ]);

    component.prev();
    component.next();

    expect(component.navigateTo).toHaveBeenCalledWith('chapter-1', [], 1);
    expect(component.navigateTo).toHaveBeenCalledWith(
      'chapter-3',
      ['chapter-3-alt'],
      3,
    );
  });

  it('should report whether previous and next chapters exist', () => {
    component.chapterNumber = 5;
    component.chapterList.set([
      { id: 'chapter-4', chapter: '4' },
      { id: 'chapter-6', chapter: '6' },
    ]);

    expect(component.hasPrev()).toBeTrue();
    expect(component.hasNext()).toBeTrue();

    component.chapterList.set([{ id: 'chapter-5', chapter: '5' }]);

    expect(component.hasPrev()).toBeFalse();
    expect(component.hasNext()).toBeFalse();
  });

  it('should toggle focus mode and chapter list visibility', () => {
    component.toggleFocus();
    component.toggleChapterList();

    expect(component.focusMode()).toBeTrue();
    expect(component.showChapterList()).toBeTrue();

    component.toggleFocus();
    component.toggleChapterList();

    expect(component.focusMode()).toBeFalse();
    expect(component.showChapterList()).toBeFalse();
  });
});
