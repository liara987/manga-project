import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoToTopComponent } from './go-to-top.component';

describe('GoToTopComponent', () => {
  let component: GoToTopComponent;
  let fixture: ComponentFixture<GoToTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoToTopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
