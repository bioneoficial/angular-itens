import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-create',
  templateUrl: './item-create.component.html',
  styleUrls: ['./item-create.component.css'],
})
export class ItemCreateComponent implements OnInit {
  createForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private itemService: ItemService,
    private toastr: ToastrService
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const { title, description } = this.createForm.value;

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', this.selectedFile);

      this.itemService.createItem(formData).subscribe(
        _createdItem => {
          this.toastr.success('Item criado com sucesso');
          this.router.navigate(['/items']);
        },
        _error => {
          this.toastr.error('Erro ao criar item');
        }
      );
    } else {
      const createData = { title, description, photo: '', photoUrl: '' };
      this.itemService.createItem(createData).subscribe(
        _createdItem => {
          this.toastr.success('Item criado com sucesso');
          this.router.navigate(['/items']);
        },
        _error => {
          this.toastr.error('Erro ao criar item');
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/items']);
  }

  get titleControl(): FormControl {
    return this.createForm.get('title') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.createForm.get('description') as FormControl;
  }
}
