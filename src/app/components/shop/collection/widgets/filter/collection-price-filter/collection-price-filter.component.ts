import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent {

  @Input() filter: Params;

  public prices = [
    {
      id: 1,
      price: 500,
      text: 'Under',
      value: '0-500'
    },
    {
      id: 2,
      price: 800,
      text: 'Under',
      value: '0-800'
    },
    {
      id: 3,
      price: 1000,
      text: 'Under',
      value: '0-1000'
    },
    {
      id: 4,
      price: 1500,
      text: 'Under',
      value: '0-1500'
    },
    {
      id: 5,
      price: 2000,
      text: 'Under',
      value: '0-2000'
    }
  ]

  public selectedPrices: string[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnChanges() {
    this.selectedPrices = this.filter['price'] ? this.filter['price'].split(',') : [];
  }

  togglePriceFilter(value: string) {
    const index = this.selectedPrices.indexOf(value);

    if (index !== -1) {
      // Remove if already selected
      this.selectedPrices.splice(index, 1);
    } else {
      // Add if not selected
      this.selectedPrices.push(value);
    }

    this.applyFilter();
  }

  applyFilter() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: this.selectedPrices.length ? this.selectedPrices?.join(",") : null,
        page: 1
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    });
  }

  // check if the item are selected
  checked(item: string){
    if(this.selectedPrices?.indexOf(item) != -1){
      return true;
    }
    return false;
  }

}
