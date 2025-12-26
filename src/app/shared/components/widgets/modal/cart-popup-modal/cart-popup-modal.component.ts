import { Component, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store, Select } from '@ngxs/store';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClearCart, DeleteCart, UpdateCart } from '../../../../action/cart.action';
import { CartState } from '../../../../state/cart.state';
import { SettingState } from '../../../../state/setting.state';
import { Cart, CartAddOrUpdate } from '../../../../interface/cart.interface';
import { Values } from '../../../../interface/setting.interface';
import { VariationModalComponent } from '../variation-modal/variation-modal.component';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-cart-popup-modal',
  templateUrl: './cart-popup-modal.component.html',
  styleUrls: ['./cart-popup-modal.component.scss']
})
export class CartPopupModalComponent implements OnDestroy {

  @ViewChild("cartPopupModal", { static: false }) cartPopupModal: TemplateRef<string>;
  @ViewChild("variationModal", { static: false }) VariationModal: VariationModalComponent;

  @Select(CartState.cartItems) cartItem$: Observable<Cart[]>;
  @Select(CartState.cartTotal) cartTotal$: Observable<number>;
  @Select(SettingState.setting) setting$: Observable<Values>;

  public closeResult: string;
  public modalOpen: boolean = false;
  public shippingFreeAmt: number = 0;
  public cartTotal: number = 0;
  public shippingCal: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private store: Store,
    public cartService: CartService,
    private router: Router
  ) {
    // Calculation - using combineLatest to avoid nested subscriptions
    combineLatest([this.cartTotal$, this.setting$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([total, setting]) => {
        this.shippingFreeAmt = setting?.general?.min_order_free_shipping || 0;
        this.cartTotal = total || 0;
        if(this.shippingFreeAmt > 0) {
          this.shippingCal = (this.cartTotal * 100) / this.shippingFreeAmt;
          if(this.shippingCal > 100) {
            this.shippingCal = 100;
          }
        } else {
          this.shippingCal = 0;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async openModal() {
    try {
      if (!this.cartPopupModal) {
        console.error('Cart popup modal template not found');
        return;
      }
      this.modalOpen = true;
      this.modalService.open(this.cartPopupModal, {
        ariaLabelledBy: 'cart-popup-modal',
        centered: true,
        windowClass: 'theme-modal cart-popup-modal',
        size: 'lg'
      }).result.then((result) => {
        this.modalOpen = false;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.modalOpen = false;
      });
    } catch (error) {
      console.error('Error opening cart popup modal:', error);
      this.modalOpen = false;
    }
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  updateQuantity(item: Cart, qty: number) {
    const params: CartAddOrUpdate = {
      id: item?.id,
      product_id: item?.product?.id,
      product: item?.product ? item?.product : null,
      variation_id: item?.variation_id ? item?.variation_id : null,
      variation: item?.variation ? item?.variation : null,
      quantity: qty
    }
    this.store.dispatch(new UpdateCart(params));
    this.cartService.updateQty();
  }

  delete(id: number) {
    this.store.dispatch(new DeleteCart(id));
  }

  clearCart() {
    this.store.dispatch(new ClearCart());
  }

  navigateToCart() {
    this.modalService.dismissAll();
    this.router.navigate(['/cart']);
  }

  navigateToCheckout() {
    this.modalService.dismissAll();
    this.router.navigate(['/checkout']);
  }
}

