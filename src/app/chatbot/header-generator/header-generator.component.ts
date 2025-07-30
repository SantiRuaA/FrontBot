import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { Subject } from 'rxjs';
import { filter, takeUntil, startWith } from 'rxjs/operators';
import { ClearGeneratedItems, AddGeneratedItems } from '../../state/generator/generator.actions';

@Component({
  selector: 'app-headerGenerator',
  standalone: true,
  imports: [],
  templateUrl: './header-generator.component.html',
  styleUrls: ['./header-generator.component.css']
})
export class headerGeneratorComponent implements OnInit, OnDestroy {
  
  public activeTab: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store, 
    private router: Router,
    private actions$: Actions
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      startWith(new NavigationEnd(0, this.router.url, this.router.url)),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url.includes('/normas')) {
        this.activeTab = 'normas';
      } else if (url.includes('/generador')) {
        if (this.activeTab !== 'destruir') {
            this.activeTab = '';
        }
      }
    });

    this.actions$.pipe(
      ofActionSuccessful(AddGeneratedItems),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.activeTab = '';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearItems(): void {
    this.store.dispatch(new ClearGeneratedItems());
    this.activeTab = 'destruir';
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
