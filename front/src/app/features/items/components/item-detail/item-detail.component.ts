import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService, Item } from '../../services/item.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
})
export class ItemDetailComponent implements OnInit {
  itemId!: string;
  item: Item = {description: '', photoUrl: '', title: '', photo: ''}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id') as string;
    this.loadItem();
  }

  loadItem(): void {
    this.itemService.getItem(this.itemId).subscribe(
      (data: Item) => {
        this.item = data;
      },
      _error => {
        this.toastr.error('Erro ao carregar item');
        this.router.navigate(['/items']);
      }
    );
  }

  back(): void {
    this.router.navigate(['/items']);
  }

  editItem(): void {
    this.router.navigate(['/items', 'edit', this.itemId]);
  }
}
