import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../../../shared/classes/product';
import { CartItem } from '../../../../shared/classes/cart-item';
import { ProductsService } from '../../../../shared/services/products.service';
import { WishlistService } from '../../../../shared/services/wishlist.service';
import { CartService } from '../../../../shared/services/cart.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-product-col-left',
  templateUrl: './product-col-left.component.html',
  styleUrls: ['./product-col-left.component.scss']
})
export class ProductColLeftComponent implements OnInit {

  public product            :   Product = {};
  public products           :   Product[] = [];
  public cartItems          :   Observable<CartItem[]> = of([]);
  public shoppingCartItems  :   CartItem[] = [];
  public counter            :   number = 1; 
  public selectedSize       :   any = '';
  public screenWidth       
  public slideRightNavConfig
  
  //Get Product By Id
  constructor(private route: ActivatedRoute, private router: Router, private toastrService: ToastrService,
    public productsService: ProductsService, private wishlistService: WishlistService,
    private cartService: CartService) {
      this.route.params.subscribe(params => {
        const id = +params['id'];
        this.productsService.getProduct(id).subscribe(product => this.product = product)
      });
      this.onResize();
  }

  ngOnInit() {
    this.productsService.getProducts().subscribe(product => this.products = product);
    this.cartItems = this.cartService.getItems();
    this.cartItems.subscribe(shoppingCartItems => this.shoppingCartItems = shoppingCartItems);
  }
  
  public slideRightConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: '.slider-right-nav'
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth > 576) {
         return this.slideRightNavConfig = { 
            vertical: true,
            verticalSwiping: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            asNavFor: '.product-right-slick',
            arrows: false,
            infinite: true,
            dots: false,
            centerMode: false,
            focusOnSelect: true
        }
     } else {
        return this.slideRightNavConfig = { 
            vertical: false,
            verticalSwiping: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            asNavFor: '.product-right-slick',
            arrows: false,
            infinite: true,
            centerMode: false,
            dots: false,
            focusOnSelect: true,
            responsive: [
                  {
                      breakpoint: 576,
                      settings: {
                          slidesToShow: 3,
                          slidesToScroll: 1
                      }
                  }
            ]
        }
     }

  }

  public increment() { 
      this.counter += 1;
  }

  public decrement() {
      if(this.counter >1){
          this.counter -= 1;
      }
  }

  // If item is aleready added
  public hasItem(product: Product): boolean {
    const item = this.shoppingCartItems.find(item => item.product.id === product.id);
    return item !== undefined;
  }

  // Add to cart
  public addToCart(product: Product, quantity) {
    if (quantity == 0) return false;
    if (this.hasItem(product)) {
        var item = this.shoppingCartItems.filter(item => item.product.id === product.id)[0];
        const index = this.shoppingCartItems.indexOf(item);
        let qty = this.shoppingCartItems[index].quantity + parseInt(quantity);
        let stock = this.shoppingCartItems[index].product.stock;
        if(stock < qty) {
           this.toastrService.error('You can not add more items than available. In stock '+ stock +' items.'); // toasr services
        } else {
           this.cartService.addToCart(product, parseInt(quantity));
           this.toastrService.success('This product has been added to cart.');
        }
    } else {
      if(product.stock < quantity) {
        this.toastrService.error('You can not add more items than available. In stock '+ product.stock +' items.'); // toasr services
      } else {
        this.cartService.addToCart(product, parseInt(quantity));
        this.toastrService.success('This product has been added to cart.');
      }
    }
  }

  // Add to cart
  public buyNow(product: Product, quantity) {
     if (quantity > 0) 
       this.cartService.addToCart(product,parseInt(quantity));
       this.router.navigate(['/home/checkout']);
  }

  // Add to wishlist
  public addToWishlist(product: Product) {
     this.wishlistService.addToWishlist(product);
  }
  
  // Change size variant
  public changeSizeVariant(variant) {
     this.selectedSize = variant;
  }

}
