import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Item, ItemService } from './services/item.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items: MatTableDataSource<Item> = new MatTableDataSource<Item>();
  displayedColumns: string[] = ['title', 'description', 'actions'];
  totalItems = 0;
  pageSize = 10;

  constructor(private itemService: ItemService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe(
      data => {
        this.items.data = data;
        this.totalItems = data.length;
      },
      error => {
        this.toastr.error('Erro ao carregar itens');
      }
    );
  }

  deleteItem(id: string): void {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      this.itemService.deleteItem(id).subscribe(
        () => {
          this.toastr.success('Item excluído com sucesso');
          this.loadItems();
        },
        error => {
          this.toastr.error('Erro ao excluir item');
        }
      );
    }
  }

  onPageChange(event): void {
      console.log(event);
  }
}
