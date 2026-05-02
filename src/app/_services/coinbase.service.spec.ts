import { TestBed } from '@angular/core/testing';

import { CoinbaseService } from './coinbase.service';

describe('CoinbaseService', () => {
  let service: CoinbaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinbaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse an advanced trade level2 snapshot', () => {
    service.handleMessage({
      events: [
        {
          type: 'snapshot',
          product_id: 'ETH-USD',
          updates: [
            {
              side: 'bid',
              price_level: '99',
              new_quantity: '1'
            },
            {
              side: 'ask',
              price_level: '101',
              new_quantity: '2'
            }
          ]
        }
      ]
    });

    expect(service.currentDisplay).toEqual([
      { price: 101, size: 2, asks: true },
      { price: 99, size: 1, asks: false }
    ]);
  });

  it('should apply advanced trade level2 updates and remove empty levels', () => {
    service.handleMessage({
      events: [
        {
          type: 'snapshot',
          product_id: 'ETH-USD',
          updates: [
            {
              side: 'bid',
              price_level: '99',
              new_quantity: '1'
            }
          ]
        },
        {
          type: 'update',
          product_id: 'ETH-USD',
          updates: [
            {
              side: 'bid',
              price_level: '99',
              new_quantity: '0'
            }
          ]
        }
      ]
    });

    expect(service.currentDisplay).toEqual([]);
  });
});
