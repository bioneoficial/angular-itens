import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import {  Router } from '@angular/router';
import { ItemService, GetItemsResponse } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

class MockItemService {
  getItems() {
    return of({
      items: [
        { _id: '1', title: 'Item 1', description: 'Description 1', photoUrl: '', photo: ''},
        { _id: '2', title: 'Item 2', description: 'Description 2', photoUrl: '', photo: '', __v: 0 }
      ],
      meta: { totalItems: 2 }
    } as GetItemsResponse);
  }

  deleteItem(_id: string) {
    return of({});
  }
}

class MockToastrService {
  success(_message: string, _title?: string, _override?: any) {}
  error(_message: string, _title?: string, _override?: any) {}
}

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let itemService: ItemService;
  let toastr: ToastrService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemListComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ItemService, useClass: MockItemService },
        { provide: ToastrService, useClass: MockToastrService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    itemService = TestBed.inject(ItemService);
    toastr = TestBed.inject(ToastrService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items correctly', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.totalItems).toBe(2);
  });

  it('should apply filter correctly', () => {
    const event = { target: { value: 'Item 1' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('item 1');
  });

  it('should delete an item successfully', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    const spyDeleteItem = spyOn(itemService, 'deleteItem').and.returnValue(of(void 0));
    const spyToastr = spyOn(toastr, 'success');
    const spyLoadItems = spyOn(component, 'loadItems');

    component.deleteItem('1');
    tick();

    expect(spyDeleteItem).toHaveBeenCalledWith('1');
    expect(spyToastr).toHaveBeenCalledWith('Item excluído com sucesso');
    expect(spyLoadItems).toHaveBeenCalled();
  }));

  it('should handle error when loading items', () => {
    spyOn(itemService, 'getItems').and.returnValue(
      throwError({ error: { message: 'Erro ao carregar itens' } })
    );
    const spyToastr = spyOn(toastr, 'error');

    component.loadItems();
    fixture.detectChanges();

    expect(spyToastr).toHaveBeenCalledWith('Erro ao carregar itens');
  });

  it('should handle error when deleting an item', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(itemService, 'deleteItem').and.returnValue(
      throwError({ error: { message: 'Erro ao excluir item' } })
    );
    const spyToastr = spyOn(toastr, 'error');

    component.deleteItem('1');
    tick();

    expect(spyToastr).toHaveBeenCalledWith('Erro ao excluir item');
  }));

  it('should paginate correctly', () => {
    component.pageSize = 5;
    const pageEvent = { pageIndex: 1, pageSize: 5, length: 2 } as unknown as PageEvent;
    component.onPageChange(pageEvent);
    expect(component.pageSize).toBe(5);
  });
});
