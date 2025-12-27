import { Component, ViewEncapsulation } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Menu, MenuModel } from '../../../interface/menu.interface';
import { ProductState } from '../../../../shared/state/product.state';
import { Product } from '../../../../shared/interface/product.interface';
import { BlogState } from '../../../../shared/state/blog.state';
import { Blog, BlogModel } from '../../../../shared/interface/blog.interface';
import { MenuState } from '../../../state/menu.state';
import { GetMenuProducts } from '../../../action/product.action';
import { Router } from '@angular/router';
import { GetSelectedBlogs } from '../../../action/blog.action';
import { MenuService } from '../../../services/menu.service';
import { ThemeOptionState } from '../../../state/theme-option.state';
import { Option } from '../../../interface/theme-option.interface';
import { isCategoryDisabled } from '../../../../shared/utils/category.utils';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuComponent {

  @Select(ProductState.dealProducts) product$: Observable<Product[]>;
  @Select(BlogState.blog) blog$: Observable<BlogModel>;
  @Select(MenuState.menu) menu$: Observable<MenuModel>;
  @Select(ProductState.menuProducts) menuProduct$: Observable<MenuModel>;

  @Select(ThemeOptionState.themeOptions) themeOption$: Observable<Option>;

  public menu: Menu[] = [];
  public products: any[];
  public blogs: Blog[];

  constructor(private store: Store, private router: Router, public menuService: MenuService){
    this.menu$.subscribe(menu => {
      const productIds = Array.from(new Set(this.concatDynamicProductKeys(menu, 'product_ids')));
      if(productIds && productIds.length){
        this.store.dispatch(new GetMenuProducts({ids: productIds?.join()})).subscribe({
          next: (val) => {
            this.products = val.product.menuProducts.slice(0,2);
          }
        })
      }

      const blogIds = Array.from(new Set(this.concatDynamicProductKeys(menu, 'blog_ids')));
      if(blogIds && blogIds.length){
        this.store.dispatch(new GetSelectedBlogs({status: 1, ids: blogIds?.join()})).subscribe({
          next: (val) => {
            this.blogs = val.blog.selectedBlogs.slice(0,2);
          }
        })
      }
    })
  }

  redirect(path:string, menu?: Menu){
    if (!this.isDisabled(menu)) {
      this.router.navigateByUrl(path)
    }
  }

  isDisabled(menu?: Menu): boolean {
    return menu ? isCategoryDisabled(menu.title) : false;
  }

  toggle(menu: Menu){
    // Prevent toggle if menu is disabled
    if (this.isDisabled(menu)) {
      return;
    }
    
    // Close all other menus at the same level before opening this one
    const getAllMenus = (menus: any[]): Menu[] => {
      let result: Menu[] = [];
      menus?.forEach(m => {
        result.push(m);
        if (m.child && m.child.length) {
          result = result.concat(getAllMenus(m.child));
        }
      });
      return result;
    };
    
    // Toggle the clicked menu
    menu.active = !menu.active;
  }

  concatDynamicProductKeys(obj: any, keyName: string) {
    const result: number[] = [];
    function traverse(obj: any) {
      for (const key in obj) {
        if (key === keyName && Array.isArray(obj[key])) {
          result.push(...obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        }else {
          if(key === keyName && obj.product_ids){
            result.push(obj.product_ids)
          };
        }
      }
    }
    traverse(obj);
    return result;
  }
   
}
