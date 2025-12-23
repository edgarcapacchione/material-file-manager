import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private open: boolean = true;
  private subject = new Subject<void>();

  observer = this.subject.asObservable();

  toggle(nextVal?: boolean): void {
    this.subject.next();
    if (nextVal != undefined) {
      this.setOpen(nextVal);
    }
  }

  isOpen(): boolean {
    return this.open;
  }
  
  setOpen(value: boolean) {
    this.open = value;
  }
}
