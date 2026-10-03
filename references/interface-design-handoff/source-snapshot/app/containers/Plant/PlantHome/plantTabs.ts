export type PlantTab = {
  id: string;
  label: string;
};

export const EQUIPMENT_TAB_ID = 'equipment';

export const CONTROL_TAB_ID = 'control';

export const PLANT_TABS: PlantTab[] = [
  { id: '', label: 'Overview' },
  { id: 'trends', label: 'Trends' },
  { id: 'events', label: 'Events' },
  { id: EQUIPMENT_TAB_ID, label: 'Equipment' },
  { id: CONTROL_TAB_ID, label: 'Control' },
];

export const ROUTE_TAB_INDEX: Record<string, number> = {
  'routes/_.microgrids.$plantId._index': 0,
  'routes/_.microgrids.$plantId.trends': 1,
  'routes/_.microgrids.$plantId.events': 2,
  'routes/_.microgrids.$plantId.equipment': 3,
  'routes/_.microgrids.$plantId.control': 4,
  'routes/_.microgrids.$plantId.$inverterID.metrics._index': 3,
  'routes/_.microgrids.$plantId.$inverterID.configuration._index': 3,
};

export const activeTabIndexFromMatches = (routeIds: string[]): number => {
  for (let i = routeIds.length - 1; i >= 0; i--) {
    const index = ROUTE_TAB_INDEX[routeIds[i]];
    if (index !== undefined) return index;
  }
  return 0;
};

export const SHARED_TAB_PARAMS = ['from', 'to', 'utility_id'] as const;

export const tabSearch = (params: URLSearchParams): string => {
  const kept = new URLSearchParams();
  for (const key of SHARED_TAB_PARAMS) {
    const value = params.get(key);
    if (value !== null) kept.set(key, value);
  }
  return kept.toString();
};

type ShellRevalidationArgs = {
  currentPlantId: string | undefined;
  nextPlantId: string | undefined;
  currentSearch: URLSearchParams;
  nextSearch: URLSearchParams;
  formAction: string | undefined;
};

export const shellNeedsRevalidation = ({
  currentPlantId,
  nextPlantId,
  currentSearch,
  nextSearch,
  formAction,
}: ShellRevalidationArgs): boolean => {
  if (formAction) return true;
  if (currentPlantId !== nextPlantId) return true;
  return ['from', 'to'].some((key) => currentSearch.get(key) !== nextSearch.get(key));
};
