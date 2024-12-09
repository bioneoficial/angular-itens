import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsRoutingModule } from './items-routing.module';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { ItemCreateComponent } from './components/item-create/item-create.component';
import { ItemEditComponent } from './components/item-edit/item-edit.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    ItemListComponent,
    ItemDetailComponent,
    ItemCreateComponent,
    ItemEditComponent,
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
  ],
})
export class ItemsModule { }
