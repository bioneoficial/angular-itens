import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService, Item } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html',
  styleUrls: ['./item-edit.component.css'],
})
export class ItemEditComponent implements OnInit {
  editForm: FormGroup;
  itemId: string = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private toastr: ToastrService
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      removeImage: [false],
    });
  }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id') as string;
    this.loadItem();
  }

  loadItem(): void {
    this.itemService.getItem(this.itemId).subscribe(
      (item: Item) => {
        this.editForm.patchValue({
          title: item.title,
          description: item.description,
        });
      },
      _error => {
        this.toastr.error('Erro ao carregar item');
        this.router.navigate(['/items']);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onRemoveImageChange(event: any): void {
    const checked = event.target.checked;
    this.editForm.patchValue({ removeImage: checked });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const { title, description, removeImage } = this.editForm.value;
    const updateData: any = { title, description };

    if (removeImage) {
      updateData.removeImage = true;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (removeImage) {
        formData.append('removeImage', 'true');
      }
      formData.append('file', this.selectedFile);

      this.itemService.updateItem(this.itemId, formData).subscribe(
        (_updatedItem) => {
          this.toastr.success('Item atualizado com sucesso');
          this.router.navigate(['/items']);
        },
        _error => {
          this.toastr.error('Erro ao atualizar item');
        }
      );
    } else {
      this.itemService.updateItem(this.itemId, updateData).subscribe(
        (_updatedItem) => {
          this.toastr.success('Item atualizado com sucesso');
          this.router.navigate(['/items']);
        },
        _error => {
          this.toastr.error('Erro ao atualizar item');
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/items']);
  }

  get titleControl(): FormControl | null {
    return this.editForm.get('title') as FormControl;
  }

  get descriptionControl(): FormControl | null {
    return this.editForm.get('description') as FormControl;
  }
}
