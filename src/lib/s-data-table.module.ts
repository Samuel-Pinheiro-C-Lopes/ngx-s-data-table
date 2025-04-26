import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Component
import { DataTableComponent } from './component/data-table.component';

@NgModule({
  declarations: [
    DataTableComponent
  ],
  imports: [
    CommonModule, FormsModule
  ],
  providers: undefined,
  exports: [
    DataTableComponent
  ],
})
export class DataTableModule { }
