import { AbilityBuilder, PureAbility } from '@casl/ability';

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
  }

  return build();
}
