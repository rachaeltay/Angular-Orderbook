import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OrderbookComponent } from './orderbook.component';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [OrderbookComponent],
  imports: [
    CommonModule, 
    MatTableModule,
    MatSelectModule,
  ]
})
export class OrderbookModule { }
