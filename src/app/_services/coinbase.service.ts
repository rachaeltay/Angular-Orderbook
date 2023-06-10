import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';

interface CoinbaseMessage {
  type: string;
  product_ids: string[];
  channels: string[];
}

export class DisplayOrder {
  price: number;
  size: number;
  asks: boolean;

  constructor(price: number, size: number, asks: boolean) {
    this.price = price;
    this.size = size;
    this.asks = asks;
  }
}

interface Snapshot {
  type: string;
  product_ids: string[];
  asks: number[][];
  bids: number[][];
}

interface Update {
  type: string;
  product_id: string;
  changes: string[][];
  date: string;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class CoinbaseService {
  public baseUrl: string = 'wss://ws-feed.exchange.coinbase.com';
  displayOrder: BehaviorSubject<DisplayOrder[]>;
  public shareOrder: Observable<DisplayOrder[]>;
  subject: WebSocketSubject<any>;
  currentDisplay: DisplayOrder[];
  data: { [action: string]: { [price: number]: DisplayOrder } };
  price: { [action: string]: number[] };

  constructor() {
    this.displayOrder = new BehaviorSubject<DisplayOrder[]>([]);
    this.shareOrder = this.displayOrder.asObservable();
    this.subject = webSocket(this.baseUrl);
    this.currentDisplay = [];
    this.data = { asks: {}, bids: {} };
    this.price = { asks: [], bids: [] };
  }

  public initProduct(product_id: string = 'ETH-USD'): void {
    this.subject = webSocket(this.baseUrl);
    // unsubscribe when destroyed
    this.subject
      .asObservable()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (v) => {
          if (v['type'] == 'snapshot') {
            this.handleSnapshot(v);
          } else if (v['type'] == 'l2update') {
            this.update(v);
          }
        },
        error: (e) => console.error(e)
      });
    this.subscribeProduct(product_id);
  }

  subscribeProduct(product_id: string): void {
    this.send({
      type: 'subscribe',
      product_ids: [product_id],
      channels: ['level2']
    });
  }

  unsubscribeProduct(product_id: string): void {
    this.resetData();
    this.send({
      type: 'unsubscribe',
      product_ids: [product_id],
      channels: ['level2']
    });
  }

  resetData(): void {
    this.data = { asks: [], bids: [] };
    this.price = { asks: [], bids: [] };
    this.subject.unsubscribe();
    this.currentDisplay = [];
    this.displayOrder.next([]);
  }

  send(message: CoinbaseMessage): void {
    this.subject.next(message);
  }

  handleSnapshot(snapshot: Snapshot) {
    this.buildData(snapshot['asks'], 'asks', true);
    this.buildData(snapshot['bids'], 'bids', false);
    this.displayOrder.next(this.currentDisplay);
  }

  buildData(snap: number[][], action: string, actionBoolean: boolean) {
    snap.forEach(
      (v) =>
        (this.data[action][Number(v[0])] = {
          price: Number(v[0]),
          size: Number(v[1]),
          asks: actionBoolean
        })
    );
    snap
      .slice(0, 10)
      .reverse()
      .forEach((v) => {
        this.price[action].push(Number(v[0]));
        this.currentDisplay.push(
          new DisplayOrder(Number(v[0]), Number(v[1]), actionBoolean)
        );
      });
  }

  update(update: Update) {
    const action = update.changes[0][0] == 'sell' ? 'asks' : 'bids';
    const price = Number(update.changes[0][1]);
    const size = Number(update.changes[0][2]);
    // update data
    if (size < 3.5e-7) {
      delete this.data[action][price];
    } else {
      this.data[action][price] = {
        price: price,
        size: size,
        asks: action === 'asks'
      };
    }
    this.displayNewOrder(action);
  }

  displayNewOrder(action: string) {
    const keys: number[] = Object.keys(this.data[action])
      .map(Number)
      .sort((a, b) => {
        return b - a;
      });
    this.price[action] = action == 'asks' ? keys.slice(-10) : keys.slice(0, 10);
    const index = action == 'asks' ? 0 : 10;
    for (let i = 0; i < 10; i++) {
      if (
        this.data[action][this.price[action][i]] !==
        this.currentDisplay[i + index]
      ) {
        this.currentDisplay[i + index] =
          this.data[action][this.price[action][i]];
      }
    }
    this.displayOrder.next(this.currentDisplay);
  }
}
