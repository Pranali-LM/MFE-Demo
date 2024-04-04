export const OVERVIEW_TABLE_COLUMN = ['attributes', 'type', 'tags', 'entities', 'roles'];
export const ATTRIBUTE_TABLE_COLUMN = ['attrName', 'type', 'status', 'entity', 'createdOn', 'createdBy', 'lastUpdated', 'actions'];
export const TAGS_TABLE_COLUMN = ['tagName', 'attributeName', 'entity', 'status', 'createdOn', 'createdBy', 'lastUpdated', 'actions'];

export const TAGGING_CONTROL_TYPES = [
  { Label: 'Access-Based', value: 'ACCESS' },
  { Label: 'Data-Based', value: 'DATA' },
];

export const ACCESS_CONTROL_TYPES = [
  { entityName: 'asset', entityType: 'ACCESS' },
  { entityName: 'driver', entityType: 'ACCESS' },
];

export const ENTITY_TYPES = [
  { entityName: 'asset', entityType: 'ACCESS' },
  { entityName: 'driver', entityType: 'ACCESS' },
  { entityName: 'event', entityType: 'DATA' },
  { entityName: 'trip', entityType: 'DATA' },
];
