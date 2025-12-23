import { Injectable } from '@angular/core';
import { BackendService } from '../common/backend.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowseService {

  private mode!: string;
  private currentPath: string = '';
  private history: string[] = [''];
  private historyPointer: number = 0;
  private isBrowsingBackOrForward: boolean = false;
  private clipboard: string[] = [];
  // observable files list from backend
  private filesObserver = new BehaviorSubject<any[]>([]);
  private files$: Observable<any[]> = this.filesObserver.asObservable();
  // observable selected files list
  private selectedObserver = new BehaviorSubject<number[]>([]);
  private selected$: Observable<number[]> = this.selectedObserver.asObservable();
  // observe when data is arrived from backend
  public filesChangedObserver = new BehaviorSubject<boolean>(false);

  constructor(private backend: BackendService) {}

  init(): void {
    this.setMode();
    this.updateCurrentPath(this.currentPath);
  }

  refresh(): void {
    this.clearSelected();
    this.clearClipboard();
    this.updateCurrentPath(this.currentPath);
  }

  private updateCurrentPath(value: string): void {
    this.currentPath = value;
    this.backend.ls(value).subscribe(res => {
      this.filesObserver.next(res);
      this.filesChangedObserver.next(true);
    });
  }

  setMode(value: string = 'list'): void { // TODO: default view value 
    this.mode = value;
  }

  getMode(): string {
    return this.mode;
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getFiles(): any[] {
    return this.filesObserver.value;
  }

  getFilesObservable(): Observable<any[]> {
    return this.files$;
  }

  getSelectedObservable(): Observable<number[]> {
    return this.selected$;
  }

  getBreadcrumb(): string[] {
    return this.currentPath.split('/');
  }

  getHistory(): string[] {
    return this.history;
  }

  getHistoryPointer(): number {
    return this.historyPointer;
  }

  getSelected(): number[] {
    return this.selectedObserver.value;
  }

  getClipboard(): string[] {
    return this.clipboard;
  }

  addToClipboard(value: string) {
    this.clipboard.push(value);
  }

  isSelected(id: number): boolean {
    return this.getSelected().some(i => id == i);
  }

  selectElement(id: number): void {
    this.selectedObserver.next(this.getSelected().concat(id));
  }

  unselectElement(id: number): void {
    this.selectedObserver.next(this.getSelected().filter(i => i != id));
  }

  selectAll(): void {
    this.selectedObserver.next(this.getFiles().map(f => f.id));
  }

  getItemAbsolutePath(elementName: string): string {
    return `${this.getCurrentPath()}/${elementName}`;
  }

  clearSelected(): void {
    this.selectedObserver.next([]);
  }

  clearClipboard(): void {
    this.clipboard = [];
  }
  
  clearHistory(): void {
    this.history = [''];
    this.historyPointer = 0;
  }

  browseUp(elementName: string): void {
    if (this.isBrowsingBackOrForward) {
      this.history = this.history.slice(0, this.historyPointer + 1);
      this.historyPointer = this.history.length - 1;
      this.isBrowsingBackOrForward = false;
    }
    this.browse('up', `${this.currentPath}/${elementName}`);
  }

  browseTo(path: string): void {
    this.browse('to', path);
  }

  browseBack(): void {
    this.browse('back');
  }

  browseForward(): void {
    this.browse('forward');
  }

  private browse(how: string, where: string = ''): void {
    this.clearSelected();
    this.isBrowsingBackOrForward = how == 'back' || how == 'forward';
    switch (how) {
      case 'back':
      case 'forward':
        how == 'back' ? this.historyPointer-- : this.historyPointer++;
        this.updateCurrentPath(this.history[this.historyPointer]);
        break;
      case 'up':
      case 'to':
        this.updateCurrentPath(where);
        this.history.push(this.currentPath);
        this.historyPointer = this.history.length - 1;
        break;
      default:
        break;
    }
  }

  clean(): void {
    this.currentPath = '';
    this.filesObserver.next([]);
    this.clearSelected();
    this.clearHistory();
    this.clearClipboard();
  }

}
