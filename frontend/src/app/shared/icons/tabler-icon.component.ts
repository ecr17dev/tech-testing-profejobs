import { Component, Input, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';

export type TablerIconName =
  | 'home'
  | 'book'
  | 'chart-bar'
  | 'lock'
  | 'key'
  | 'settings'
  | 'bell'
  | 'logout'
  | 'arrow-left'
  | 'pin'
  | 'filter'
  | 'download'
  | 'x'
  | 'calendar'
  | 'trending-up'
  | 'check'
  | 'circle-check-filled'
  | 'search'
  | 'user'
  | 'users';

interface IconDef {
  d: string;
  fill?: string;
}

const ICONS: Record<TablerIconName, IconDef[]> = {
  home: [
    { d: 'M5 12l-2 0l9 -9l9 9l-2 0' },
    { d: 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7' },
    { d: 'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6' },
  ],
  book: [
    { d: 'M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0' },
    { d: 'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0' },
    { d: 'M3 6l0 13' },
    { d: 'M12 6l0 13' },
    { d: 'M21 6l0 13' },
  ],
  'chart-bar': [
    { d: 'M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
    { d: 'M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
    { d: 'M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
    { d: 'M4 20h14' },
  ],
  lock: [
    { d: 'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z' },
    { d: 'M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0' },
    { d: 'M8 11v-4a4 4 0 1 1 8 0v4' },
  ],
  key: [
    { d: 'M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z' },
    { d: 'M15 9h.01' },
  ],
  settings: [
    { d: 'M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' },
    { d: 'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' },
  ],
  bell: [
    { d: 'M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6' },
    { d: 'M9 17v1a3 3 0 0 0 6 0v-1' },
  ],
  logout: [
    { d: 'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2' },
    { d: 'M9 12h12l-3 -3' },
    { d: 'M18 15l3 -3' },
  ],
  'arrow-left': [
    { d: 'M5 12l14 0' },
    { d: 'M5 12l6 6' },
    { d: 'M5 12l6 -6' },
  ],
  pin: [
    { d: 'M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4' },
    { d: 'M9 15l-4.5 4.5' },
    { d: 'M14.5 4l5.5 5.5' },
  ],
  filter: [
    { d: 'M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z' },
  ],
  download: [
    { d: 'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2' },
    { d: 'M7 11l5 5l5 -5' },
    { d: 'M12 4l0 12' },
  ],
  x: [
    { d: 'M18 6l-12 12' },
    { d: 'M6 6l12 12' },
  ],
  calendar: [
    { d: 'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z' },
    { d: 'M16 3v4' },
    { d: 'M8 3v4' },
    { d: 'M4 11h16' },
    { d: 'M11 15h1' },
    { d: 'M12 15v3' },
  ],
  'trending-up': [
    { d: 'M3 17l6 -6l4 4l8 -8' },
    { d: 'M14 7l7 0l0 7' },
  ],
  check: [
    { d: 'M5 12l5 5l10 -10' },
  ],
  'circle-check-filled': [
    { d: 'M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z', fill: 'currentColor' },
  ],
  search: [
    { d: 'M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' },
    { d: 'M21 21l-6 -6' },
  ],
  user: [
    { d: 'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' },
    { d: 'M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' },
  ],
  users: [
    { d: 'M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0' },
    { d: 'M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' },
    { d: 'M16 3.13a4 4 0 0 1 0 7.75' },
    { d: 'M21 21v-2a4 4 0 0 0 -3 -3.85' },
  ],
};

@Component({
  selector: 'i-tabler',
  standalone: true,
  imports: [NgClass],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [ngClass]="className"
      aria-hidden="true"
      style="display:inline-block;vertical-align:middle;flex-shrink:0"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      @for (path of paths; track $index) {
        <path [attr.d]="path.d" [attr.fill]="path.fill || 'none'"></path>
      }
    </svg>
  `,
})
export class TablerIconComponent implements OnChanges {
  @Input({ required: true }) name!: TablerIconName;
  @Input() size: number | string = 24;
  @Input() color?: string;
  @Input() className?: string;

  paths: IconDef[] = [];

  ngOnChanges(): void {
    this.paths = ICONS[this.name] ?? [];
  }
}
