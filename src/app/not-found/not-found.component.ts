import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    document.body.classList.add('not-found-background');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('not-found-background');
  }
}
