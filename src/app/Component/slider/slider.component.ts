import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
export interface Slide {
  imageUrl: string;
  captionTitle: string;
  captionText: string;
}

@Component({
  selector: 'app-slider',
  imports: [RouterLink],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
  cliced() {
    throw new Error('Method not implemented.');
  }
  constructor() { }

  slides: Slide[] = [
    {
      imageUrl: '../../../assets/images/couch.png',
      captionTitle: 'Modern Comfort',
      captionText: 'Timeless Couch Designs'
    },
    {
      imageUrl: '../../../assets/images/product-1.png',
      captionTitle: 'Premium Collection',
      captionText: 'Elevate Your Living Space'
    },
    {
      imageUrl: '../../../assets/images/product-2.png',
      captionTitle: 'Crafted for Luxury',
      captionText: 'Experience True Comfort'
    }
  ];

}
