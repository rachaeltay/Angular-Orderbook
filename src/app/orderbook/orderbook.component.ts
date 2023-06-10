import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CoinbaseService, DisplayOrder } from '../_services/coinbase.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./orderbook.component.css']
})
export class OrderbookComponent implements OnInit {
  displayTables: DisplayOrder[][];
  displayedColumns: string[] = ['price', 'size'];
  product: string;
  currency: string;
  products: string[];
  selectedProduct: string;

  constructor(
    private coinbaseService: CoinbaseService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    this.displayTables = [];
    this.product = 'ETH';
    this.currency = 'USD';
    this.selectedProduct = 'ETH-USD';
    this.products = ['ETH-USD', 'SOL-USD', 'AAVE-USD'];

  }

  ngOnInit(): void {
    this.coinbaseService.initProduct();
    this.coinbaseService.shareOrder.subscribe((v) => {
      this.displayTables = [v.slice(0, 10), v.slice(-10)];
      this.changeDetectorRefs.detectChanges();
    });
  }

  updateProduct(event: MatSelectChange): void {
    this.coinbaseService.unsubscribeProduct(this.selectedProduct);
    this.coinbaseService.initProduct(event.value);
    this.selectedProduct = event.value;
    [this.product, this.currency] = this.selectedProduct.split('-');
  }
}
