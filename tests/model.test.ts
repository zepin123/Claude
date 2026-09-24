import {describe,expect,it} from 'vitest';
import {demoData,nextOccurrence,snoozeTime,taskDraft} from '../lib/day/model';
import {findAvailableTimeSlots,mergeEvents} from '../lib/day/integrations';
describe('lógica central',()=>{
 it('genera una sola siguiente ocurrencia estable',()=>{const task={...taskDraft(),date:'2026-09-14',recurrence:'daily' as const};expect(nextOccurrence(task,'2026-09-14')).toBe('2026-09-15')});
 it('pospone un recordatorio una hora',()=>{expect(snoozeTime(60,new Date('2026-09-14T10:00:00Z'))).toBe('2026-09-14T11:00:00.000Z')});
 it('encuentra huecos sin chocar con eventos',()=>{const event={...demoData().events[0],start_at:new Date('2026-09-14T14:00:00').toISOString(),end_at:new Date('2026-09-14T15:00:00').toISOString()};const slots=findAvailableTimeSlots({date:'2026-09-14',duration:60,existingEvents:[event],preferredHours:{start:'13:00',end:'16:00'},stepMinutes:60});expect(slots).toHaveLength(2)});
 it('evita duplicados de eventos externos',()=>{const event=demoData().events[0];expect(mergeEvents([{...event,external_id:'abc',source:'google_external'}],[{...event,id:'otro',external_id:'abc',source:'google_external'}])).toHaveLength(1)});
});
