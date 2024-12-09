import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { ItemCreateComponent } from './components/item-create/item-create.component';
import { ItemEditComponent } from './components/item-edit/item-edit.component';

const routes: Routes = [
  { path: '', component: ItemListComponent },
  { path: 'create', component: ItemCreateComponent },
  { path: 'edit/:id', component: ItemEditComponent },
  { path: ':id', component: ItemDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsRoutingModule { }
