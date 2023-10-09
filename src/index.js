import { HubFactory } from '@hub-fx/core';
import { tap } from 'rxjs/operators';

const hub = HubFactory();

const reducer = (state = 3) => state;

const store$ = hub.store({ reducer });

store$.pipe(tap((number) => console.log(number, 'in tap'))).subscribe((number) => {
	console.log(number, 'in subscribe');
});
