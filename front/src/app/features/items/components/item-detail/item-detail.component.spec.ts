import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemDetailComponent } from './item-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemService, Item } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

class MockItemService {
  getItem(_id: string) {
    return of({
      _id: '12345',
      title: 'Teste',
      description: 'Descrição de teste',
      photoUrl: '',
      photo: '',
      __v: 0
    } as Item);
  }
}

class MockToastrService {
  success(_message: string, _title?: string, _override?: any) {}
  error(_message: string, _title?: string, _override?: any) {}
}

describe('ItemDetailComponent', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;
  let itemService: ItemService;
  let toastr: ToastrService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemDetailComponent],
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule
      ],
      providers: [
        { provide: ItemService, useClass: MockItemService },
        { provide: ToastrService, useClass: MockToastrService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '12345' } } } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    itemService = TestBed.inject(ItemService);
    toastr = TestBed.inject(ToastrService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os detalhes do item corretamente', () => {
    expect(component.item).toEqual({
      _id: '12345',
      title: 'Teste',
      description: 'Descrição de teste',
      photoUrl: '',
      photo: '',
      __v: 0
    } as Item);
  });

  it('deve exibir "Carregando item..." quando o item não está carregado', () => {
    component.item = undefined as any;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const noItemDiv = compiled.querySelector('.no-item');
    expect(noItemDiv?.textContent).toContain('Carregando item...');
  });

  it('deve exibir mensagem de erro e navegar para /items quando o carregamento do item falha', () => {
    spyOn(itemService, 'getItem').and.returnValue(
      throwError({ error: { message: 'Erro ao carregar item' } })
    );
    const spyToastr = spyOn(toastr, 'error');
    const routerSpy = spyOn(router, 'navigate');

    component.loadItem();
    fixture.detectChanges();

    expect(spyToastr).toHaveBeenCalledWith('Erro ao carregar item');

    expect(routerSpy).toHaveBeenCalledWith(['/items']);
  });

  it('deve navegar para /items quando back() é chamado', () => {
    const routerSpy = spyOn(router, 'navigate');

    component.back();

    expect(routerSpy).toHaveBeenCalledWith(['/items']);
  });

  it('deve navegar para /items/edit/:id quando editItem() é chamado', () => {
    const routerSpy = spyOn(router, 'navigate');

    component.editItem();

    expect(routerSpy).toHaveBeenCalledWith(['/items', 'edit', '12345']);
  });

  it('deve renderizar os detalhes do item quando está disponível', () => {
    component.item = {
      _id: '12345',
      title: 'Título Teste',
      description: 'Descrição Teste válida',
      photoUrl: 'https://via.placeholder.com/150',
      photo: '',
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('mat-card-title')?.textContent;
    const description = compiled.querySelector('mat-card-subtitle')?.textContent;
    const image = compiled.querySelector('img');

    expect(title).toContain('Título Teste');
    expect(description).toContain('Descrição Teste válida');
    expect(image?.getAttribute('src')).toBe('https://via.placeholder.com/150');
  });

  it('deve navegar para /items/edit/:id quando o botão "Editar" é clicado', () => {
    const routerSpy = spyOn(router, 'navigate');

    component.editItem();

    expect(routerSpy).toHaveBeenCalledWith(['/items', 'edit', '12345']);
  });

  it('deve navegar para /items quando o botão "Voltar" é clicado', () => {
    const routerSpy = spyOn(router, 'navigate');

    component.back();

    expect(routerSpy).toHaveBeenCalledWith(['/items']);
  });

  it('deve chamar loadItem no ngOnInit', () => {
    const spyLoadItem = spyOn(component, 'loadItem').and.callThrough();

    component.ngOnInit();

    expect(spyLoadItem).toHaveBeenCalled();
  });

  it('deve carregar o item corretamente via ItemService', () => {
    const mockItem: Item = {
      _id: '12345',
      title: 'Título Mockado',
      description: 'Descrição Mockada',
      photoUrl: 'https://via.placeholder.com/150',
      photo: '',
    };

    spyOn(itemService, 'getItem').and.returnValue(of(mockItem));

    component.loadItem();
    fixture.detectChanges();

    expect(component.item).toEqual(mockItem);
  });

  it('deve exibir a mensagem de erro no template quando ocorre um erro ao carregar o item', () => {
    spyOn(itemService, 'getItem').and.returnValue(
      throwError({ error: { message: 'Erro ao carregar item' } })
    );
    const spyToastr = spyOn(toastr, 'error');
    const routerSpy = spyOn(router, 'navigate');

    component.loadItem();
    fixture.detectChanges();

    expect(spyToastr).toHaveBeenCalledWith('Erro ao carregar item');

    expect(routerSpy).toHaveBeenCalledWith(['/items']);

    const compiled = fixture.nativeElement as HTMLElement;
    const noItemDiv = compiled.querySelector('.no-item');
    expect(noItemDiv).toBeNull();
  });

  it('deve exibir mat-toolbar e mat-card no template quando o item está disponível', () => {
    component.item = {
      _id: '12345',
      title: 'Título Teste',
      description: 'Descrição Teste válida',
      photoUrl: 'https://via.placeholder.com/150',
      photo: '',
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toolbar = compiled.querySelector('mat-toolbar');
    const card = compiled.querySelector('mat-card');

    expect(toolbar).toBeTruthy();
    expect(card).toBeTruthy();
  });
});
