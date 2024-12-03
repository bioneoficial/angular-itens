import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  {
    path: 'items',
    loadChildren: () => import('./features/items/items.module').then(m => m.ItemsModule),
  },
  { path: '**', redirectTo: '/items' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
