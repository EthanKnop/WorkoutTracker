import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { SettingsService } from './settings.service';
import { Machine } from 'src/models/machine';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  isAddingNewMachine: boolean = false;
  machines: WritableSignal<Machine[]> = signal([]);

  loadingMachines: WritableSignal<number[]> = signal([]);

  constructor(private http: HttpClient, private settingsService: SettingsService) { 
    this.getMachines();
  }

  newWeight(machineId: number, weight: number) {
    const apiUrl = `http://${this.settingsService.url}:3000/new-weight`;
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

    this.loadingMachine(machineId);
    this.http.post(apiUrl, { machineId, weight, date }).subscribe(() => {
      this.getMachine(machineId);
    });
  }

  private loadingMachine(machineId: number) {
    this.loadingMachines.update((ids) => {
      if (!ids.includes(machineId)) {
        return ids.concat(machineId);
      }
      return ids;
    });
  }

  private doneLoadingMachine(machineId: number) {
    this.loadingMachines.update((ids) => {
      return ids.filter((id) => id !== machineId);
    });
  }

  getMachine(machineId: number) {
    const apiUrl = `http://${this.settingsService.url}:3000/get-machine`;
    this.http.post<Machine>(apiUrl, { machineId }).subscribe((machine) => {
      this.doneLoadingMachine(machineId);
      if (machine) {
        this.machines.update((machines) => {
          const index = machines.findIndex((m) => m.id === machine.id);
          if (index === -1) {
            return machines.concat(machine);
          } else {
            machines[index] = machine;
          }

          return machines;
        });
      }
    });
  }

  addNewMachine(name: string, type: string) {
    this.isAddingNewMachine = false;
    const apiUrl = `http://${this.settingsService.url}:3000/new-machine`;
    this.http.post<Machine>(apiUrl, { name, type }).subscribe((machine) => {
      this.machines.update((machines) => machines.concat(machine));
    });
  }

  private getMachines() {
    const apiUrl = `http://${this.settingsService.url}:3000/machines`;
    this.http.get<Machine[]>(apiUrl).subscribe((machines) => {
      this.machines.set(machines);
    });
  }

}
