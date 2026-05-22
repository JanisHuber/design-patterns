export enum ParkingEventType {
  Enter,
  Exit,
}

export interface ParkingEvent {
  type: ParkingEventType;
  lotName: string;
  occupied: number;
  capacity: number;
}

export interface Subscriber {
  update(event: ParkingEvent): void;
}

export interface Publisher {
  subscribe(subscriber: Subscriber): void;
  unsubscribe(subscriber: Subscriber): void;
}

export class ParkingLot implements Publisher {
  public occupied: number = 0;
  private subscribers: Subscriber[] = [];

  constructor(
    public name: string,
    public capacity: number,
  ) {}

  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe(subscriber: Subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  private notify(type: ParkingEventType) {
    const event: ParkingEvent = {
      type: type,
      lotName: this.name,
      occupied: this.occupied,
      capacity: this.capacity,
    };
    for (const subscriber of this.subscribers) {
      subscriber.update(event);
    }
  }

  enter() {
    if (!this.isFull()) {
      this.occupied++;
      this.notify(ParkingEventType.Enter);
    } else {
      throw new Error(`the parking lot is full`);
    }
  }

  exit() {
    if (!this.isEmpty()) {
      this.occupied--;
      this.notify(ParkingEventType.Exit);
    } else {
      throw new Error(`the parking lot is empty`);
    }
  }

  isFull() {
    return this.occupied == this.capacity;
  }

  isEmpty() {
    return this.occupied == 0;
  }
}

export class Display implements Subscriber {
  update(event: ParkingEvent) {
    const action = event.type === ParkingEventType.Enter
      ? "A car entered"
      : "A car left";
    console.log(
      `${action} the lot ${event.lotName}: ${event.occupied}/${event.capacity} occupied.`,
    );
  }
}
