import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderbookComponent } from './orderbook.component';

import { CoinbaseService } from '../_services/coinbase.service';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';

describe('OrderbookComponent', () => {
  let component: OrderbookComponent;
  let fixture: ComponentFixture<OrderbookComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSelectModule,
        MatTableModule,
        BrowserAnimationsModule,
      ],
      providers: [CoinbaseService]
    })
  );

  it('initialise with the correct product', () => {
    fixture.componentInstance.selectedProduct = 'ETH-USD';
    expect(fixture.componentInstance.selectedProduct).toEqual('ETH-USD');
  });

  it('should be created', () => {
    const service: CoinbaseService = TestBed.get(CoinbaseService);
    expect(service).toBeTruthy();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderbookComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
