export type TagDomain = 'performer' | 'coach' | 'team';
export type TagStatus = 'pending' | 'approved' | 'rejected';

export interface TagOption {
	id: string;
	name: string;
}

export interface EntityTagDisplay {
	id: string;
	tagId: string;
	name: string;
	status: TagStatus;
}
