export type SearchMode = 'performers' | 'coaches' | 'teams';

export interface SearchFilters {
	// Performer filters
	openToBookOpeners?: boolean;
	lookingForTeam?: boolean;
	lookingForCoach?: boolean;
	// Coach filters
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForWorkshops?: boolean;
	// Team filters
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
}

let _query = $state('');
let _mode = $state<SearchMode>('performers');
let _filters = $state<SearchFilters>({});
let _loading = $state(false);

export const searchStore = {
	get query() {
		return _query;
	},
	get mode() {
		return _mode;
	},
	get filters() {
		return _filters;
	},
	get loading() {
		return _loading;
	},

	setQuery(query: string) {
		_query = query;
	},

	setMode(mode: SearchMode) {
		_mode = mode;
		_filters = {}; // reset filters when switching modes
	},

	setFilters(filters: SearchFilters) {
		_filters = filters;
	},

	toggleFilter<K extends keyof SearchFilters>(key: K) {
		_filters = { ..._filters, [key]: !_filters[key] };
	},

	setLoading(loading: boolean) {
		_loading = loading;
	},

	reset() {
		_query = '';
		_filters = {};
		_loading = false;
	}
};
