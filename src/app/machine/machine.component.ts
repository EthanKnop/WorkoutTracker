import { Component, computed, ElementRef, Input, Signal, SimpleChanges, ViewChild } from '@angular/core';
import { Machine } from 'src/models/machine';
import { MachineService } from '../services/machine.service';
import { EChartsCoreOption } from 'echarts/core';

@Component({
  selector: 'app-machine',
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss']
})
export class MachineComponent {

  @ViewChild('machineContainer') machineContainer: ElementRef | undefined;
  @ViewChild('actionContainer') actionContainer: ElementRef | undefined;
  @ViewChild('weightTextarea') weightTextarea: ElementRef | undefined;
  @Input() machine: Machine = new Machine(0, '', [], '');

  latestWeightValue = '';
  daysSinceLastWeight = '';
  isLoading: Signal<boolean> = computed(() => this.machineService.loadingMachines().includes(this.machine.id));
  private swipeCoord?: [number, number];

  cardColor = '';

  chartOption: EChartsCoreOption = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      data: [],
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        data: [],
        type: 'line',
        showSymbol: false,
        smooth: true,
        areaStyle: {
          // color: {
          //   type: 'linear',
          //   x: 0,
          //   y: 0,
          //   x2: 0,
          //   y2: 1,
          //   colorStops: [
          //     { offset: 0, color: 'rgba(255, 165, 0, 0.9)' }, // Top color
          //     { offset: 1, color: 'rgba(255, 165, 0, 0.2)' }  // Bottom color
          //   ]
          // }
        },
        itemStyle: {
          // color: '#F39E60', // Palette 1
          color: '#FFE6A5',
        },
        lineStyle: {
          width: 5,
        },
      },
    ],
    grid: {
      left: 0,
      right: 0,
      top: '43%',
      bottom: 0,
    },
    animation: false,
    silent: true,
  };

  constructor(private machineService: MachineService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['machine']) {

      switch (this.machine.type) {
        case 'Arms':
          // this.cardColor = '#E16A54'; // Palette 1
          this.cardColor = '#8ABFA3';
          break;
        case 'Legs':
          // this.cardColor = '#7C444F'; // Palette 1
          this.cardColor = '#605678';
          break;
        case 'Other':
          // this.cardColor = '#9F5255'; // Palette 1
          this.cardColor = '#FFBF61';
          break;
        default:
          this.cardColor = '#000000';
      }

      this.getLatestWeight();
      this.updateChart();
    }
  }

  private updateChart() {
    const dates = this.machine ? this.machine.data.map(entry => entry.date) : [];
    const weights = this.machine ? this.machine.data.map(entry => entry.weight) : [];

    this.chartOption = {
      ...this.chartOption,
      xAxis: {
        ...(this.chartOption['xAxis'] as object),
        data: dates,
      },
      series: [
        {
          ...(this.chartOption['series'] as any)[0],
          data: weights,
        },
      ],
    };
  }

  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    const time = new Date().getTime();
    const machineContainer = this.machineContainer!!.nativeElement;
    const actionContainer = this.actionContainer!!.nativeElement;
  
    if (when === 'start') {
      this.swipeCoord = coord;

      machineContainer.classList.add('moving');
      actionContainer.classList.add('moving');

    } else if (when === 'end') {

      if (actionContainer.style.opacity == '1') {
        console.log('swipe action');
        this.newWeight();
      }

      machineContainer.classList.remove('moving');
      machineContainer.style.transform = '';
      actionContainer.classList.remove('moving');
      actionContainer.style.opacity = 0;

    } else if (when === 'move') {
      const deltaX = coord[0] - this.swipeCoord!![0];
      const deltaY = coord[1] - this.swipeCoord!![1];
  
      // Check if the movement is more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {

        e.preventDefault();

        if(deltaX < 0) {
          machineContainer.style.transform = `translateX(${deltaX}px)`;
          actionContainer.style.transform = `translateX(${deltaX/2}px)`;

          // Adjust the opacity of the action container based on the distance swiped
          if (Math.abs(deltaX) > 30) {
            const adjustedDeltaX = Math.abs(deltaX) - 30;
            const opacity = Math.min(adjustedDeltaX / 150, 1);
            actionContainer.style.opacity = (opacity * opacity).toString();
          } else {
            actionContainer.style.opacity = '0';
          }
        }
      }
    }
  }

  onDivFocus() {
    const div = this.weightTextarea!!.nativeElement;
    const divWeightNumberOnly = div.innerText.replace(/\D/g, '');
    div.innerText = divWeightNumberOnly;
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel!!.removeAllRanges();
    sel!!.addRange(range);
  }

  onDivBlur(): void {
    const div = this.weightTextarea!!.nativeElement;
    div.innerText = this.latestWeightValue;
  }

  newWeight(): void {
    const div = this.weightTextarea!!.nativeElement;
    let weightText = div.innerText;

    if (weightText !== 'None') {
      let newValue = 0;

      if (weightText === this.latestWeightValue) {
        newValue = parseInt(weightText.replace(' lbs', ''));
      } else {
        newValue = parseInt(weightText);
      }

      this.weightTextarea!!.nativeElement.blur();
      this.machineService.newWeight(this.machine.id, newValue);
    }
  }

  onDivKeydown(event: KeyboardEvent): void {
    // Allow only numeric keys, backspace, delete, arrow keys, and tab
    if (event.key === 'Enter') {
      this.newWeight();
    }
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      event.preventDefault();
    }
  }

  private getLatestWeight() {
    if (this.machine.data.length === 0) {
      this.latestWeightValue = 'None';
      this.daysSinceLastWeight = '';

      if (this.weightTextarea) {
        this.weightTextarea.nativeElement.innerText = '';
      }

      return;
    }
    const latestData = this.machine.data[this.machine.data.length - 1];
    this.latestWeightValue = latestData.weight.toString() + ' lbs';
    this.getDaysSince(latestData.date);

    if (this.weightTextarea) {
      this.weightTextarea.nativeElement.innerText = this.latestWeightValue;
      console.log('Weight Textarea:', this.weightTextarea.nativeElement.innerText);
      console.log('Latest Weight:', this.latestWeightValue);
    }
  }

  private getDaysSince(date: string) {
    // date parameter is in the format 'YYYY-MM-DD'
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    const dateParts = date.split('-');
    const todayParts = today.split('-');

    if (date === today) {
      this.daysSinceLastWeight = 'Today';
    } else {
      const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      const todayObj = new Date(parseInt(todayParts[0]), parseInt(todayParts[1]) - 1, parseInt(todayParts[2]));
  
      const diff = Math.abs(todayObj.getTime() - dateObj.getTime());
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
  
      const daysSince = diffDays === 1 ? 'Yesterday' : `${diffDays} days`;
      this.daysSinceLastWeight = ['Yesterday', 'Today'].includes(daysSince) ? daysSince : `${daysSince} ago`;
    }
  }

}
