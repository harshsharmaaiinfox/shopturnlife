import { Component, Input } from '@angular/core';
import { Option } from '../../../../shared/interface/theme-option.interface';
import { Footer } from '../../../../shared/interface/theme.interface';

@Component({
  selector: 'app-basic-footer',
  templateUrl: './basic-footer.component.html',
  styleUrls: ['./basic-footer.component.scss']
})
export class BasicFooterComponent {

  @Input() data: Option | null;
  @Input() footer: Footer;

  public active: { [key: string]: boolean } = {
    categories: true,
    useful_link: true,
    help_center: true,
    legal_policies: true,
    more_about: true // Default to expanded
  };

  // Default help center links if none are configured
  public defaultHelpCenterLinks = [
    {
      id: 1,
      name: 'Profile',
      value: '/account/dashboard'
    },
    {
      id: 2,
      name: 'Cart',
      value: '/cart'
    },
    {
      id: 3,
      name: 'My Order',
      value: '/account/order'
    }
  ];

  toggle(value: string){
    this.active[value] = !this.active[value];
  }

  // Method to get help center links with fallback
  getHelpCenterLinks() {
    return this.data?.footer?.help_center?.length
      ? this.data.footer.help_center
      : this.defaultHelpCenterLinks;
  }

  // Method to get useful links with fallback
  getUsefulLinks() {
    return this.data?.footer?.useful_link?.length
      ? this.data.footer.useful_link
      : [];
  }
}
