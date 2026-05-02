import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoinbaseService, DisplayOrder } from '../_services/coinbase.service';
import { OrderbookComponent } from './orderbook.component';

describe('OrderbookComponent', () => {
  let component: OrderbookComponent;
  let fixture: ComponentFixture<OrderbookComponent>;
  let orderSubject: BehaviorSubject<DisplayOrder[]>;
  let coinbaseService: {
    shareOrder: ReturnType<BehaviorSubject<DisplayOrder[]>['asObservable']>;
    initProduct: jest.Mock;
    unsubscribeProduct: jest.Mock;
  };

  beforeEach(async () => {
    orderSubject = new BehaviorSubject<DisplayOrder[]>([]);
    coinbaseService = {
      shareOrder: orderSubject.asObservable(),
      initProduct: jest.fn(),
      unsubscribeProduct: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [OrderbookComponent],
      imports: [MatSelectModule, MatTableModule, BrowserAnimationsModule],
      providers: [
        {
          provide: CoinbaseService,
          useValue: coinbaseService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise with the default product', () => {
    expect(component.selectedProduct).toEqual('ETH-USD');
    expect(coinbaseService.initProduct).toHaveBeenCalledWith();
  });

  it('should split incoming orders into ask and bid tables', () => {
    orderSubject.next([
      new DisplayOrder(101, 2, true),
      new DisplayOrder(99, 1, false)
    ]);

    expect(component.displayTables).toEqual([
      [new DisplayOrder(101, 2, true)],
      [new DisplayOrder(99, 1, false)]
    ]);
  });
});
