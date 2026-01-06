import { AbilityBuilder, PureAbility } from '@casl/ability';

/**
 * Conditions matcher for CASL - matches objects based on their properties
 */
function conditionsMatcher(conditions) {
  return (object) => {
    if (!conditions || typeof conditions !== 'object') {
      return true;
    }
    
    return Object.keys(conditions).every(key => {
      const conditionValue = conditions[key];
      const objectValue = object[key];
      
      // Handle nested objects
      if (typeof conditionValue === 'object' && conditionValue !== null && !Array.isArray(conditionValue)) {
        return conditionsMatcher(conditionValue)(objectValue);
      }
      
      return objectValue === conditionValue;
    });
  };
}

/**
 * Field matcher for CASL - checks if requested fields are allowed
 */
function fieldMatcher(allowedFields) {
  return (fields) => {
    if (!allowedFields || allowedFields.length === 0) {
      return true;
    }
    
    if (Array.isArray(fields)) {
      return fields.every(field => allowedFields.includes(field));
    }
    
    return allowedFields.includes(fields);
  };
}

/**
 * Define the abilities for the user
 * Generally, admins can view and edit anything.
 * Moderators can view and edit unresolved incidents by any users.
 * Players can view and create their own incidents.
 */
export function defineAbility(user) {
  const { can, cannot, build } = new AbilityBuilder(PureAbility);

  if (user.role === 'Admin') {
    can('manage', 'all');
  } else if (user.role === 'Moderator') {
    // Can view all incidents and edit unresolved incidents by any users. Cannot delete incidents.
    can('read', 'Incident');
    can('update', 'Incident', { resolved: false });    
    cannot('delete', 'Incident');
    cannot('update', 'Incident', { resolved: true });
    
    // Can view all users and ban/unban players:
    can('update', 'User', ['banned'], { role: 'Player' });
    
    // Can view report reasons
    can('read', 'ReportReason');
  } else if (user.role === 'Player') {
    // Can create incidents
    can('create', 'Incident', { reporterId: user.id });
    
    // Can only view own incidents
    can('read', 'Incident', { reporterId: user.id });
    
    // Can only edit their own unresolved incidents. Cannot delete.
    can('update', 'Incident', { reporterId: user.id, resolved: false });
    cannot('delete', 'Incident');
    
    // Can only view their own profile
    can('read', 'User', { id: user.id });
    
    // Can view report reasons (to select when creating incident)
    can('read', 'ReportReason');
  }

  return build({ conditionsMatcher, fieldMatcher });
}
