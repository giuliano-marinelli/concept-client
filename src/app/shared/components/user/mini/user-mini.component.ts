import { Component, Input } from '@angular/core';

import { User } from '../../../entities/user.entity';

@Component({
  selector: 'user-mini',
  templateUrl: './user-mini.component.html',
  styleUrl: './user-mini.component.scss'
})
export class UserMiniComponent {
  @Input() user!: User;
}
