import { Component, computed, ElementRef, QueryList, signal, Signal, ViewChild, ViewChildren, WritableSignal } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { Machine } from 'src/models/machine';
import { MachineService } from '../services/machine.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('machineNameInput') machineNameInput!: ElementRef;
  @ViewChild('machineSearch') machineSearch!: ElementRef;
  @ViewChildren('machineTypeInput') machineTypeInputs!: QueryList<ElementRef>;

  isFiltersOpen = false;
  machineFilter: WritableSignal<string> = signal('');
  machineSort: WritableSignal<string> = signal('Name');
  machineSortAsc: WritableSignal<boolean> = signal(true);

  newMachineName = '';
  newMachineType = '';

  filteredMachines: Signal<Machine[]> = computed(() => {
    if (this.machineFilter() === '') {
      return this.getSortedMachines();
    }
    return this.getSortedMachines().filter((machine) => 
      machine.name.toLowerCase().includes(this.machineFilter().toLowerCase()) || machine.type.toLowerCase().includes(this.machineFilter().toLowerCase())
    );
  });

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

  clearSearchTerm() {
    this.machineFilter.set('');
    this.machineSearch.nativeElement.value = '';
    this.machineNameInput.nativeElement.focus();
  }

  isNewMachineDisabled(name: string): boolean {
    return name === '' || this.getSelectedMachineType() === '';
  }

  getSortedMachines(): Machine[] {
    let machines = this.machineService.machines();

    if (this.machineSort() === 'Name') {
      machines.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.machineSort() === 'Type') {
      machines.sort((a, b) => a.type.localeCompare(b.type));
    } else if (this.machineSort() === 'Last Used') {
      machines.sort((a, b) => {
        const lastUsedA = a.data.length > 0 ? new Date(a.data[a.data.length - 1].date) : new Date(0);
        const lastUsedB = b.data.length > 0 ? new Date(b.data[b.data.length - 1].date) : new Date(0);
        return lastUsedB.getTime() - lastUsedA.getTime(); // Sort descending by date
      });
    }
    if (!this.machineSortAsc()) {
      machines.reverse();
    }
    return machines;
  }

}
