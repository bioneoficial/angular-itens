import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemEditComponent } from './item-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemService } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

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

  updateItem(id: string, data: any) {
    return of({
      _id: '12345',
      title: data.title || 'Título Atualizado',
      description: data.description || 'Descrição Atualizada',
      photoUrl: data.file ? 'https://via.placeholder.com/150' : '',
      photo: '',
      __v: 0
    } as Item);
  }
}

class MockToastrService {
  success(_message: string, _title?: string, _override?: any) {}
  error(_message: string, _title?: string, _override?: any) {}
  _warning(_message: string, _title?: string, _override?: any) {}
}

describe('ItemEditComponent', () => {
  let component: ItemEditComponent;
  let fixture: ComponentFixture<ItemEditComponent>;
  let itemService: ItemService;
  let toastr: ToastrService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemEditComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatToolbarModule,
        MatIconModule
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
    fixture = TestBed.createComponent(ItemEditComponent);
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
    expect(component.editForm.value.title).toBe('Teste');
    expect(component.editForm.value.description).toBe('Descrição de teste');
  });

  it('deve navegar para /items ao clicar em cancelar', () => {
    const routerSpy = spyOn(router, 'navigate');

    component.cancel();

    expect(routerSpy).toHaveBeenCalledWith(['/items']);
  });

  it('deve atribuir o arquivo selecionado', () => {
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
  });

  it('deve chamar updateItem com dados corretos quando nenhum arquivo é selecionado', () => {
    const spyUpdateItem = spyOn(itemService, 'updateItem').and.callThrough();
    const spyToastr = spyOn(toastr, 'success');
    const spyRouter = spyOn(router, 'navigate');

    component.editForm.controls['title'].setValue('Título Atualizado');
    component.editForm.controls['description'].setValue('Descrição Atualizada.');

    component.onSubmit();

    expect(spyUpdateItem).toHaveBeenCalledWith('12345', {
      title: 'Título Atualizado',
      description: 'Descrição Atualizada.'
    });

    expect(spyToastr).toHaveBeenCalledWith('Item atualizado com sucesso');
    expect(spyRouter).toHaveBeenCalledWith(['/items']);
  });

  it('deve chamar updateItem com FormData quando um arquivo é selecionado', () => {
    const spyUpdateItem = spyOn(itemService, 'updateItem').and.callFake((id: string, data: any) => {
      expect(id).toBe('12345');
      expect(data instanceof FormData).toBeTrue();
      expect(data.get('title')).toBe('Título com Arquivo');
      expect(data.get('description')).toBe('Descrição com arquivo.');
      expect(data.get('file') instanceof File).toBeTrue();
      expect(data.get('file')?.name).toBe('example.png');
      return of({
        _id: '12345',
        title: 'Título com Arquivo',
        description: 'Descrição com arquivo.',
        photoUrl: 'https://via.placeholder.com/150',
        photo: '',
        __v: 0
      } as Item);
    });
    const spyToastr = spyOn(toastr, 'success');
    const spyRouter = spyOn(router, 'navigate');

    component.editForm.controls['title'].setValue('Título com Arquivo');
    component.editForm.controls['description'].setValue('Descrição com arquivo.');

    component.selectedFile = new File(['dummy content'], 'example.png', { type: 'image/png' });

    component.onSubmit();

    expect(spyUpdateItem).toHaveBeenCalled();

    expect(spyToastr).toHaveBeenCalledWith('Item atualizado com sucesso');
    expect(spyRouter).toHaveBeenCalledWith(['/items']);
  });

  it('deve atualizar o controle removeImage quando o checkbox é alterado', () => {
    const event = { target: { checked: true } };
    component.onRemoveImageChange(event);

    expect(component.editForm.value.removeImage).toBeTrue();
  });

  it('deve chamar updateItem com removeImage quando checkbox está ativo e nenhum arquivo é selecionado', () => {
    const spyUpdateItem = spyOn(itemService, 'updateItem').and.callFake((id: string, data: any) => {
      expect(id).toBe('12345');
      expect(data).toEqual({
        title: 'Título para Remover Imagem',
        description: 'Descrição para remover imagem.',
        removeImage: true
      });
      return of({
        _id: '12345',
        title: 'Título para Remover Imagem',
        description: 'Descrição para remover imagem.',
        photoUrl: '',
        photo: '',
        __v: 0
      } as Item);
    });
    const spyToastr = spyOn(toastr, 'success');
    const spyRouter = spyOn(router, 'navigate');

    component.editForm.controls['title'].setValue('Título para Remover Imagem');
    component.editForm.controls['description'].setValue('Descrição para remover imagem.');

    component.editForm.controls['removeImage'].setValue(true);

    component.selectedFile = null;

    component.onSubmit();

    expect(spyUpdateItem).toHaveBeenCalled();

    expect(spyToastr).toHaveBeenCalledWith('Item atualizado com sucesso');
    expect(spyRouter).toHaveBeenCalledWith(['/items']);
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
});
