import {EventEmitter} from 'events';
import {StrictEventEmitter} from "nest-emitter";
import {Period} from "../database/entity/period.entity";

interface AppEvents {
    periods: Period[];
}

export type MyEventEmitter = StrictEventEmitter<EventEmitter, AppEvents>;
