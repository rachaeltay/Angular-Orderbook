import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable } from 'rxjs';

type OrderSide = 'asks' | 'bids';

const MINIMUM_VISIBLE_SIZE = 3.5e-7;

interface CoinbaseMessage {
  type: string;
  product_ids: string[];
  channel: string;
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

interface CoinbaseLevel2Message {
  events?: CoinbaseLevel2Event[];
}

interface CoinbaseLevel2Event {
  type: string;
  product_id: string;
  updates: CoinbaseLevel2Update[];
}

interface CoinbaseLevel2Update {
  side: string;
  price_level: string;
  new_quantity: string;
}

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class CoinbaseService {
  public readonly baseUrl: string = 'wss://advanced-trade-ws.coinbase.com';
  private readonly displayOrder: BehaviorSubject<DisplayOrder[]>;
  public shareOrder: Observable<DisplayOrder[]>;
  subject?: WebSocketSubject<any>;
  currentDisplay: DisplayOrder[];
  data: Record<OrderSide, { [price: number]: DisplayOrder }>;
  price: Record<OrderSide, number[]>;

  constructor() {
    this.displayOrder = new BehaviorSubject<DisplayOrder[]>([]);
    this.shareOrder = this.displayOrder.asObservable();
    this.currentDisplay = [];
    this.data = { asks: {}, bids: {} };
    this.price = { asks: [], bids: [] };
  }

  public initProduct(product_id: string = 'ETH-USD'): void {
    this.closeConnection();
    this.resetData();
    this.subject = webSocket(this.baseUrl);
    this.subject
      .asObservable()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (v) => {
          this.handleMessage(v);
        },
        error: (e) => console.error(e)
      });
    this.subscribeProduct(product_id);
  }

  subscribeProduct(product_id: string): void {
    this.send({
      type: 'subscribe',
      product_ids: [product_id],
      channel: 'level2'
    });
  }

  unsubscribeProduct(product_id: string): void {
    this.send({
      type: 'unsubscribe',
      product_ids: [product_id],
      channel: 'level2'
    });
    this.closeConnection();
    this.resetData();
  }

  resetData(): void {
    this.data = { asks: {}, bids: {} };
    this.price = { asks: [], bids: [] };
    this.currentDisplay = [];
    this.displayOrder.next([]);
  }

  send(message: CoinbaseMessage): void {
    this.subject?.next(message);
  }

  closeConnection(): void {
    if (!this.subject || this.subject.closed) {
      return;
    }
    this.subject.complete();
  }

  handleMessage(message: CoinbaseLevel2Message): void {
    message.events?.forEach((event) => {
      if (!event.updates) {
        return;
      }

      if (event.type === 'snapshot') {
        this.handleSnapshot(event);
      } else if (event.type === 'update') {
        this.update(event);
      }
    });
  }

  handleSnapshot(snapshot: CoinbaseLevel2Event): void {
    snapshot.updates.forEach((update) => this.applyUpdate(update));
    this.displayOrderbook();
  }

  applyUpdate(update: CoinbaseLevel2Update): void {
    const action = this.getOrderSide(update.side);
    if (!action) {
      return;
    }

    const price = Number(update.price_level);
    const size = Number(update.new_quantity);
    if (!Number.isFinite(price) || !Number.isFinite(size)) {
      return;
    }

    if (size < MINIMUM_VISIBLE_SIZE) {
      delete this.data[action][price];
    } else {
      this.data[action][price] = {
        price: price,
        size: size,
        asks: action === 'asks'
      };
    }
  }

  update(update: CoinbaseLevel2Event): void {
    update.updates.forEach((levelUpdate) => this.applyUpdate(levelUpdate));
    this.displayOrderbook();
  }

  displayOrderbook(): void {
    this.currentDisplay = [];
    this.displayOrders('asks');
    this.displayOrders('bids');
    this.displayOrder.next(this.currentDisplay);
  }

  displayOrders(action: OrderSide): void {
    const prices: number[] = Object.keys(this.data[action])
      .map(Number)
      .sort((a, b) => {
        return b - a;
      });

    this.price[action] =
      action === 'asks' ? prices.slice(-10).reverse() : prices.slice(0, 10);
    for (let i = 0; i < 10; i++) {
      const order = this.data[action][this.price[action][i]];
      if (order) {
        this.currentDisplay.push(order);
      }
    }
  }

  private getOrderSide(side: string): OrderSide | undefined {
    if (side === 'bid') {
      return 'bids';
    }

    if (side === 'ask' || side === 'offer') {
      return 'asks';
    }

    return undefined;
  }
}
