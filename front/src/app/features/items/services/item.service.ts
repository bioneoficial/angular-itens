import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  _id?: string;
  title: string;
  description: string;
  photoUrl: string;
  photo: string;
}

export interface GetItemsResponse {
  items: Item[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = 'http://localhost:3000/items';

  constructor(private http: HttpClient) { }

  getItems(): Observable<GetItemsResponse> {
    return this.http.get<GetItemsResponse>(this.apiUrl);
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  createItem(data: FormData): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, data);
  }

  updateItem(id: string, data: any): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, data);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
