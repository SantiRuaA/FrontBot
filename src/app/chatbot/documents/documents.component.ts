import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ticket {
  id: number;
  title: string;
  description: string;
  createdDate: string;
  tags: { text: string; class: string }[];
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {

  allTickets: Ticket[] = [];

  paginatedTickets: Ticket[] = [];
  
  currentPage = 1;
  itemsPerPage = 2; 
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    // Llenamos el array con 10 tickets de ejemplo
    for (let i = 1; i <= 10; i++) {
      this.allTickets.push({
        id: i,
        title: `Ticket de Ejemplo #${i}`,
        description: `Esta es la descripción para el ticket número ${i}. Contenido de ejemplo...`,
        createdDate: `1${i} de julio de 2025`,
        tags: [{ text: 'Soporte', class: 'is-info' }, { text: 'Urgente', class: 'is-warning' }]
      });
    }

    this.totalPages = Math.ceil(this.allTickets.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTickets = this.allTickets.slice(startIndex, endIndex);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}