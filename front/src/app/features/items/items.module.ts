import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsRoutingModule } from './items-routing.module';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { ItemCreateComponent } from './components/item-create/item-create.component';
import { ItemEditComponent } from './components/item-edit/item-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ItemListComponent } from './item-list.component';

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
    MaterialModule,
  ],
})
export class ItemsModule { }
