import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BrowseService } from '../browse/browse.service';

import DragSelect from 'dragselect';

@Injectable({
  providedIn: 'root'
})
export class DragselectService {

  private DOM: Document = inject(DOCUMENT);
  private dragSelect?: DragSelect;
  private destroy$ = new Subject<void>();

  public ctrlPressed: boolean = false;
  public shiftPressed: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private browseService: BrowseService) { }

  init(): void {
    this.ctrlPressed = false;
    this.browseService.filesChangedObserver
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.initDragSelect());
    this.destroy$ = new Subject<void>();
  }

  stop(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dropDragSelect();
  }

  private initDragSelect(): void {
    // evita l'errore 'document not defined'
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // droppo la vecchia
    this.dropDragSelect();
    // e ricreo la nuova (il timeout serve a dare il tempo alla UI di renderizzare i file -- dom.queryselectorall(...))
    setTimeout(() => {
      // init DS object
      switch (this.browseService.getMode()) {
        case 'grid': this.initObject('.grid-item');
          break;
        case 'list': this.initObject('.list-item');
          break;
        case 'tree': this.initObject('.tree-item');
          break;
      }
      // init DS events
      this.subscribeEvents();
    }, 100);
  }

  private initObject(className: string): void {
    switch (this.browseService.getMode()) {
      case 'list':
        const $selector = <any>this.DOM.createElement('div');
        $selector.style.position = 'absolute';
        $selector.style.pointerEvents = 'none';
        this.dragSelect = new DragSelect({
          selectables: <any>this.DOM.querySelectorAll(className),
          area: <any>this.DOM.getElementById('outlet'),
          draggability: false,
          multiSelectToggling: false,
          multiSelectKeys: [],
          selector: $selector
        });
        break;
      case 'grid':
      case 'tree':
        this.dragSelect = new DragSelect({
          selectables: <any>this.DOM.querySelectorAll(className),
          area: <any>this.DOM.getElementById('outlet'),
          draggability: false,
          multiSelectToggling: false,
          multiSelectKeys: []
        });
        break;
    }
  }

  private subscribeEvents(): void {
    this.dragSelect?.subscribe('DS:end', (e) => {
      if (!this.ctrlPressed) {
        this.browseService.clearSelected();
      }
      if (e.items.length > 0) {
        if (e.items.length > 1) {
          e.items.forEach(e => this.handleSelection(e));
        } else {
          this.handleSelection(e.items[0]);
        }
      }
    });
  }

  private dropDragSelect(): void {
    setTimeout(() => {
      if (!!this.dragSelect) {
        this.dragSelect.stop();
        this.dragSelect = undefined;
      }
    }, 100);
  }

  private handleSelection(element: any): void {
    if (this.ctrlPressed && this.browseService.isSelected(parseInt(element.id))) {
      this.browseService.unselectElement(parseInt(element.id));
      this.dragSelect?.removeSelection(element);
    } else {
      this.browseService.selectElement(parseInt(element.id));
    }
  }
}
