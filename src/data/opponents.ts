import type { Opponent } from '../types';
import { asset } from './assets';

export const OPPONENTS: Opponent[] = [
  { name: 'Nordvik', strength: 68, crest: asset('images/crest-nordvik.png') },
  { name: 'Solaris', strength: 74, crest: asset('images/crest-solaris.png') },
  { name: 'Baluarte', strength: 71, crest: asset('images/crest-baluarte.png') },
  { name: 'Ironvale', strength: 82, crest: asset('images/crest-ironvale.png') },
  { name: 'Rivamar', strength: 77, crest: asset('images/crest-rivamar.png') },
];
