import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemService, Item, GetItemsResponse } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  displayedColumns: string[] = ['title', 'description', 'actions'];
  dataSource = new MatTableDataSource<Item>(this.items);
  totalItems = 0;
  pageSize = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private itemService: ItemService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems().subscribe(
      (data: GetItemsResponse) => {
        this.dataSource.data = data.items;
        this.totalItems = data.meta.totalItems;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      _error => {
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
        _error => {
          this.toastr.error('Erro ao excluir item');
        }
      );
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }
}
