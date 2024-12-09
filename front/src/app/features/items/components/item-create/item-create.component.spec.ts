import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ItemCreateComponent } from './item-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

class MockItemService {
  createItem(_formData: FormData) {
    return of({
      title: 'Teste',
      description: 'Descrição de teste',
      photoUrl: '',
      photo: '',
      _id: '12345',
      __v: 0
    });
  }
}

class MockToastrService {
  success(_message: string, _title?: string, _override?: any) {}
  error(_message: string, _title?: string, _override?: any) {}
  _warning(_message: string, _title?: string, _override?: any) {}
}

class MockRouter {
  navigate(_commands: any[]) {}
}

describe('ItemCreateComponent', () => {
  let component: ItemCreateComponent;
  let fixture: ComponentFixture<ItemCreateComponent>;
  let itemService: ItemService;
  let toastr: ToastrService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemCreateComponent],
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        MatButtonModule
      ],
      providers: [
        { provide: ItemService, useClass: MockItemService },
        { provide: ToastrService, useClass: MockToastrService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCreateComponent);
    component = fixture.componentInstance;
    itemService = TestBed.inject(ItemService);
    toastr = TestBed.inject(ToastrService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('o formulário deve ser inválido quando vazio', () => {
    expect(component.createForm.valid).toBeFalsy();
  });

  it('o título deve ser válido', () => {
    const title = component.createForm.controls['title'];
    expect(title.valid).toBeFalsy();

    let errors = title.errors || {};
    expect(errors['required']).toBeTruthy();

    title.setValue('ab');
    errors = title.errors || {};
    expect(errors['minlength']).toBeTruthy();

    title.setValue('a'.repeat(51));
    errors = title.errors || {};
    expect(errors['maxlength']).toBeTruthy();

    title.setValue('Título Válido');
    errors = title.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeFalsy();
    expect(errors['maxlength']).toBeFalsy();
  });

  it('a descrição deve ser válida', () => {
    const description = component.createForm.controls['description'];
    expect(description.valid).toBeFalsy();

    let errors = description.errors || {};
    expect(errors['required']).toBeTruthy();

    description.setValue('a'.repeat(9));
    errors = description.errors || {};
    expect(errors['minlength']).toBeTruthy();

    description.setValue('a'.repeat(201));
    errors = description.errors || {};
    expect(errors['maxlength']).toBeTruthy();

    description.setValue('Descrição Válida com mais de 10 caracteres.');
    errors = description.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeFalsy();
    expect(errors['maxlength']).toBeFalsy();
  });

  it('deve atribuir o arquivo selecionado', () => {
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
  });

  it('deve chamar createItem com FormData quando um arquivo é selecionado', () => {
    const spyCreateItem = spyOn(itemService, 'createItem').and.callThrough();
    const spyToastr = spyOn(toastr, 'success');
    const spyRouter = spyOn(router, 'navigate');

    component.createForm.controls['title'].setValue('Título Teste');
    component.createForm.controls['description'].setValue('Descrição Teste válida.');

    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    component.selectedFile = file;

    component.onSubmit();

    expect(spyCreateItem).toHaveBeenCalled();
    const formData = spyCreateItem.calls.mostRecent().args[0];
    expect(formData instanceof FormData).toBeTrue();
    expect(formData.get('title')).toBe('Título Teste');
    expect(formData.get('description')).toBe('Descrição Teste válida.');
    expect(formData.get('file')).toBe(file);

    expect(spyToastr).toHaveBeenCalledWith('Item criado com sucesso');
    expect(spyRouter).toHaveBeenCalledWith(['/items']);
  });

  it('deve chamar createItem com FormData quando nenhum arquivo é selecionado', () => {
    const spyCreateItem = spyOn(itemService, 'createItem').and.callFake((_formData: FormData) => {
      return of({
        title: 'Teste',
        description: 'Descrição de teste',
        photoUrl: '',
        photo: '',
        _id: '12345',
        __v: 0
      });
    });
    const spyToastr = spyOn(toastr, 'success');
    const spyRouter = spyOn(router, 'navigate');

    component.createForm.controls['title'].setValue('Título Teste');
    component.createForm.controls['description'].setValue('Descrição Teste válida.');

    component.selectedFile = null;

    component.onSubmit();

    expect(spyCreateItem).toHaveBeenCalled();

    expect(spyToastr).toHaveBeenCalledWith('Item criado com sucesso');
    expect(spyRouter).toHaveBeenCalledWith(['/items']);
  });

  it('deve exibir mensagens de erro quando createItem falha', fakeAsync(() => {
    const spyCreateItem = spyOn(itemService, 'createItem').and.returnValue(
      throwError({
        error: {
          message: [
            'O título deve ter entre 3 e 50 caracteres',
            'A descrição deve ter entre 10 e 200 caracteres'
          ]
        }
      })
    );
    const spyToastr = spyOn(toastr, 'error');

    component.createForm.controls['title'].setValue('Título Válido');
    component.createForm.controls['description'].setValue('Descrição Válida com mais de 10 caracteres.');

    component.selectedFile = null;

    component.onSubmit();
    tick();

    expect(spyCreateItem).toHaveBeenCalled();

    expect(spyToastr).toHaveBeenCalledWith(
      'O título deve ter entre 3 e 50 caracteres<br>A descrição deve ter entre 10 e 200 caracteres',
      '',
      { enableHtml: true }
    );
  }));

  it('deve navegar para /items ao clicar em cancelar', () => {
    const spyRouter = spyOn(router, 'navigate');

    component.cancel();

    expect(spyRouter).toHaveBeenCalledWith(['/items']);
  });
});
