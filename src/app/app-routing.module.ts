import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderbookComponent } from './orderbook/orderbook.component';

const routes: Routes = [
  { path: '', redirectTo: 'orderbook', pathMatch: 'full' },
  {
    path: 'orderbook',
    component: OrderbookComponent,
    data: { title: 'Orderbook' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
