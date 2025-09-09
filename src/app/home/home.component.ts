import { Component, computed, ElementRef, QueryList, signal, Signal, ViewChild, ViewChildren, WritableSignal } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { Machine } from 'src/models/machine';
import { MachineService } from '../services/machine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  filteredMachines: Signal<Machine[]> = computed(() => {
    if (this.machineFilter() === '') {
      return this.machineService.machines();
    }
    return this.machineService.machines().filter((machine) => 
      machine.name.toLowerCase().includes(this.machineFilter().toLowerCase()) || machine.type.toLowerCase().includes(this.machineFilter().toLowerCase())
    );
  });
  machineFilter: WritableSignal<string> = signal('');

  newMachineName = '';
  newMachineType = '';

  @ViewChild('machineNameInput') machineNameInput!: ElementRef;
  @ViewChildren('machineTypeInput') machineTypeInputs!: QueryList<ElementRef>;

  constructor(public settingsService: SettingsService, public machineService: MachineService) {}

  getSelectedMachineType(): string {
    for (let input of this.machineTypeInputs) {
      if (input.nativeElement.checked) {
        return input.nativeElement.value;
      }
    }
    return '';
  }

  searchTerm(event: any) {
    this.machineFilter.set(event.target.value === undefined ? '' : event.target.value);
  }

  isNewMachineDisabled(name: string): boolean {
    return name === '' || this.getSelectedMachineType() === '';
  }

}
